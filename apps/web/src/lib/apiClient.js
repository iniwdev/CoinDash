/**
 * apiClient.js — CoinDash AI
 *
 * Axios instance with:
 *   1. Request interceptor  — injects Bearer token from Zustand store
 *   2. Response interceptor — on 401, attempts one silent token refresh,
 *      retries the original request, then logs out if refresh fails
 *
 * Single in-flight refresh pattern prevents thundering-herd on concurrent 401s.
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: '/api/v1',                 // Vite proxy handles routing to FastAPI
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: inject current access token ─────────────────────────
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Refresh state: track a single in-flight refresh promise ──────────────────
let _refreshPromise = null;

// ── Response interceptor: silent refresh on 401 ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const url = originalRequest.url || '';
    const isAuthEndpoint = url.includes('/auth/login')
      || url.includes('/auth/signup')
      || url.includes('/auth/refresh')
      || url.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retried && !isAuthEndpoint) {
      console.log(`[apiClient] 401 detected on ${url}, attempting refresh...`);
      originalRequest._retried = true;

      // Collapse concurrent 401s into one refresh attempt
      if (!_refreshPromise) {
        _refreshPromise = useAuthStore.getState().refreshSession().finally(() => {
          _refreshPromise = null;
        });
      }

      const newToken = await _refreshPromise;

      if (newToken) {
        console.log(`[apiClient] Refresh successful, retrying ${url}`);
        // Retry original request with the fresh token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      console.warn(`[apiClient] Refresh failed for ${url}`);
      // Refresh failed — user is now logged out (handled inside refreshSession)
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

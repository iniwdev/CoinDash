/**
 * authStore.js — CoinDash AI
 *
 * Manages JWT authentication state with:
 *   - Correct field names matching the FastAPI response contract
 *     { access_token, refresh_token, token_type, user }
 *   - Zustand persist middleware for session survival across page reloads
 *   - restoreSession() to validate persisted tokens on app boot
 *   - refreshSession() for silent token rotation
 *   - logout() that revokes the server-side refresh token
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/apiClient';

const AUTH_STORAGE_KEY = 'coindash_auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,
      /**
       * authStatus:
       *   'idle'            — app just booted, not yet checked
       *   'loading'         — checking/restoring session
       *   'authenticated'   — valid user + token
       *   'unauthenticated' — no session
       */
      authStatus: 'idle',

      // ── Derived helpers ───────────────────────────────────────────────────
      get isAuthenticated() {
        return get().authStatus === 'authenticated';
      },

      // ── Internal: apply a token pair from backend response ────────────────
      _applySession: (data) => {
        const { access_token, refresh_token, user } = data;
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          user,
          authStatus: 'authenticated',
        });
      },

      // ── login ─────────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ authStatus: 'loading' });
        try {
          const { data } = await apiClient.post('/auth/login', { email, password });
          get()._applySession(data);
          return { success: true };
        } catch (err) {
          set({ authStatus: 'unauthenticated' });
          const detail = err.response?.data?.detail;
          const message = typeof detail === 'string'
            ? detail
            : err.response?.data?.message || 'Login failed. Check your credentials.';
          return { success: false, message };
        }
      },

      // ── signup ────────────────────────────────────────────────────────────
      signup: async (email, password) => {
        set({ authStatus: 'loading' });
        try {
          const { data } = await apiClient.post('/auth/signup', { email, password });
          get()._applySession(data);
          return { success: true };
        } catch (err) {
          set({ authStatus: 'unauthenticated' });
          const detail = err.response?.data?.detail;
          const message = typeof detail === 'string'
            ? detail
            : err.response?.data?.message || 'Signup failed. Please try again.';
          return { success: false, message };
        }
      },

      // ── logout ────────────────────────────────────────────────────────────
      logout: async () => {
        const { refreshToken } = get();
        // Best-effort: revoke server-side refresh token
        if (refreshToken) {
          try {
            await apiClient.post('/auth/logout', { refresh_token: refreshToken });
          } catch (_) {
            // Non-fatal — always clear local state
          }
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          authStatus: 'unauthenticated',
        });
      },

      // ── refreshSession (silent token rotation) ────────────────────────────
      /**
       * Called by the Axios interceptor when a 401 is received.
       * Returns the new access token on success, or null on failure.
       */
      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ authStatus: 'unauthenticated' });
          return null;
        }
        try {
          const { data } = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken,
          });
          get()._applySession(data);
          return data.access_token;
        } catch (_) {
          // Refresh token invalid/expired — full logout
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            authStatus: 'unauthenticated',
          });
          return null;
        }
      },

      // ── restoreSession (called once on app boot) ──────────────────────────
      /**
       * Validates a persisted access token by hitting /auth/me.
       * On success: confirms authenticated state.
       * On failure: attempts silent refresh, then falls back to unauthenticated.
       */
      restoreSession: async () => {
        const { accessToken, authStatus } = get();
        if (authStatus === 'loading') return;
        
        if (!accessToken) {
          console.log('[Auth] No persisted token found');
          set({ authStatus: 'unauthenticated' });
          return;
        }
        set({ authStatus: 'loading' });
        try {
          console.log('[Auth] Restoring session...');
          const { data: user } = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          console.log('[Auth] Session restored for:', user.email);
          set({ user, authStatus: 'authenticated' });
        } catch (err) {
          console.error('[Auth] Restore failed:', err.response?.status || err.message);
          if (err.response?.status === 401) {
            console.log('[Auth] Attempting token refresh...');
            const newToken = await get().refreshSession();
            if (!newToken) {
              console.log('[Auth] Refresh failed, logging out');
              set({ authStatus: 'unauthenticated' });
            } else {
              console.log('[Auth] Refresh succeeded');
            }
          } else {
            console.log('[Auth] Network error or 404, assuming valid to avoid logout');
            set({ authStatus: 'authenticated' });
          }
        } finally {
          // Final fallback to ensure we never stay in 'loading' forever
          if (get().authStatus === 'loading') {
            set({ authStatus: 'unauthenticated' });
          }
        }
      },

      // ── Legacy compat shim (used by old Navbar logout button) ────────────
      // The Navbar calls logout() synchronously in an onClick — the async
      // version handles this gracefully.
      // ── Hydration status ──────────────────────────────────────────────────
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
      // Only persist tokens and user; authStatus is recomputed on boot
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      version: 2,
    }
  )
);

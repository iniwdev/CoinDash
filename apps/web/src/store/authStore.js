import { create } from 'zustand';
import apiClient from '@/lib/apiClient';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: !!localStorage.getItem('token'),
  
  setSession: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, loading: false });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },

  checkAuth: async (token) => {
    try {
      set({ loading: true });
      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().setSession(response.data.user, token);
    } catch (error) {
      get().logout();
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      get().setSession(user, token);
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  signup: async (email, password) => {
    try {
      set({ loading: true });
      const response = await apiClient.post('/auth/signup', { email, password });
      const { token, user } = response.data;
      get().setSession(user, token);
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  },
}));

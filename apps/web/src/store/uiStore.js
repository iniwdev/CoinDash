import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Auth & Wallet Modals
  isAuthModalOpen: false,
  isWalletModalOpen: false,
  authModalMode: 'login', // 'login' | 'signup'
  
  // Search State
  searchQuery: '',
  
  // Theme & Layout
  theme: localStorage.getItem('theme') || 'dark',
  isSidebarOpen: false,
  
  // Actions
  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openWalletModal: () => set({ isWalletModalOpen: true }),
  closeWalletModal: () => set({ isWalletModalOpen: false }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

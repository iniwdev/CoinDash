import { create } from 'zustand';
import { portfolioService } from '../services/portfolioService';

export const usePortfolioStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  portfolios: [],
  activePortfolio: null,
  holdings: [],
  summary: null,
  transactions: [],
  
  // ── UI State ───────────────────────────────────────────────────────────────
  isLoading: false,
  isTrading: false,
  tradeModalOpen: false,
  selectedCoinForTrade: null,
  tradeType: 'BUY', // 'BUY' or 'SELL'
  
  // ── Actions ────────────────────────────────────────────────────────────────
  
  initializePortfolio: async () => {
    set({ isLoading: true });
    try {
      const portfolios = await portfolioService.getPortfolios();
      set({ portfolios });
      
      if (portfolios.length > 0) {
        // Default to the first (main) portfolio
        const mainPf = portfolios[0];
        set({ activePortfolio: mainPf });
        await get().fetchDashboardData(mainPf.id);
      }
    } catch (error) {
      console.error('Failed to initialize portfolio:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDashboardData: async (portfolioId) => {
    try {
      const [holdings, summary, history] = await Promise.all([
        portfolioService.getHoldings(portfolioId),
        portfolioService.getSummary(portfolioId),
        portfolioService.getTransactions(portfolioId, { page: 1, per_page: 5 }) // fetch recent 5 for dashboard
      ]);
      set({ 
        holdings, 
        summary, 
        transactions: history.transactions 
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  },

  executeTrade: async (payload) => {
    const { activePortfolio } = get();
    if (!activePortfolio) return;

    set({ isTrading: true });
    try {
      await portfolioService.executeTrade(activePortfolio.id, payload);
      alert(`Successfully executed ${payload.type} order for ${payload.coin_symbol}`);
      
      // Refresh dashboard data after successful trade
      await get().fetchDashboardData(activePortfolio.id);
      
      set({ tradeModalOpen: false, selectedCoinForTrade: null, isTrading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Trade execution failed';
      alert(errorMsg);
      set({ isTrading: false });
      throw error;
    }
  },

  // ── Modal Controls ─────────────────────────────────────────────────────────
  
  openTradeModal: (coin, type = 'BUY') => {
    set({ 
      tradeModalOpen: true, 
      selectedCoinForTrade: coin,
      tradeType: type
    });
  },
  
  closeTradeModal: () => {
    set({ 
      tradeModalOpen: false, 
      selectedCoinForTrade: null 
    });
  },

  setTradeType: (type) => set({ tradeType: type }),
}));

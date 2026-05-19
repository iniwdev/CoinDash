import apiClient from '../lib/apiClient';

/**
 * Service for interacting with the backend Portfolio Engine endpoints.
 */
export const portfolioService = {
  // ── Portfolio CRUD ─────────────────────────────────────────────────────────
  
  async getPortfolios() {
    const response = await apiClient.get('/portfolio');
    return response.data;
  },

  async createPortfolio(name, currency = 'USD') {
    const response = await apiClient.post('/portfolio', { name, currency });
    return response.data;
  },

  // ── Core Financial Endpoints ───────────────────────────────────────────────

  async getHoldings(portfolioId) {
    const response = await apiClient.get(`/portfolio/${portfolioId}/holdings`);
    return response.data.holdings;
  },

  async getSummary(portfolioId) {
    const response = await apiClient.get(`/portfolio/${portfolioId}/summary`);
    return response.data;
  },

  // ── Transactions & History ─────────────────────────────────────────────────

  async executeTrade(portfolioId, payload) {
    // payload: { coin_id, coin_symbol, type: "BUY"|"SELL", quantity, price_per_unit }
    const response = await apiClient.post(`/portfolio/${portfolioId}/transactions`, payload);
    return response.data;
  },

  async getTransactions(portfolioId, params = { page: 1, per_page: 20 }) {
    const response = await apiClient.get(`/portfolio/${portfolioId}/transactions`, { params });
    return response.data;
  }
};

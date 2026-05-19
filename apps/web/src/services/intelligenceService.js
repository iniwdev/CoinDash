import apiClient from '../lib/apiClient';

/**
 * Service for the Intelligence module (/api/v1/portfolio/intelligence/*, /api/v1/market/*, /api/v1/assets/*)
 * All responses are cached server-side via Redis; the frontend can call freely.
 */
export const intelligenceService = {

  /**
   * GET /portfolio/intelligence/insights
   * Returns dynamic AI-generated insight cards for the current user's portfolio.
   */
  async getInsights() {
    const response = await apiClient.get('/portfolio/intelligence/insights');
    return response.data; // List[Insight]
  },

  /**
   * GET /portfolio/intelligence/scores
   * Returns { risk_score, risk_label, diversification_index, diversification_label }
   */
  async getScores() {
    const response = await apiClient.get('/portfolio/intelligence/scores');
    return response.data;
  },

  /**
   * GET /market/snapshot
   * Returns global macro data: Fear & Greed, BTC dominance, top movers, trending.
   */
  async getMarketSnapshot() {
    const response = await apiClient.get('/market/snapshot');
    return response.data;
  },

  /**
   * GET /assets/{coin_id}/sparkline?days=7
   * Returns { coin_id, data: [{ value }] } for the terminal table sparklines.
   */
  async getSparkline(coinId, days = 7) {
    const response = await apiClient.get(`/assets/${coinId}/sparkline`, { params: { days } });
    return response.data; // SparklineResponse
  },
};

/**
 * getCoins.js
 *
 * Fetches the top-100 coins from the market API (FastAPI → CoinGecko proxy)
 * and normalizes every coin through the canonical normalizeCoin contract.
 *
 * All consumers of useCoins() receive a consistent coin shape regardless of
 * whether the backend returned live CoinGecko data or the mock rate-limit fallback.
 */
import apiClient from '@/lib/apiClient';
import { normalizeCoins } from '@/lib/normalizeCoin';

export const getCoins = async () => {
  const response = await apiClient.get('/market/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: true,
      price_change_percentage: '1h,24h,7d',
    },
  });

  if (!Array.isArray(response.data)) {
    console.error('[getCoins] Expected array from market API, got:', typeof response.data);
    return [];
  }

  return normalizeCoins(response.data);
};

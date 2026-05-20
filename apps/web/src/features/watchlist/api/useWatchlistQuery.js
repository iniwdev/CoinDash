/**
 * useWatchlistQuery.js
 *
 * React Query hook that fetches live market data for the user's watchlisted coins.
 * Uses the canonical normalizeCoin contract from lib/normalizeCoin.
 *
 * Key behaviors:
 * - Only fetches when IDs are present
 * - Filters out coins not in the user's watchlist (protects against mock fallback pollution)
 * - Returns consistently shaped coin objects identical to what useCoins() returns
 */
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { normalizeCoin, normalizeCoins } from '@/lib/normalizeCoin';

export const useWatchlistQuery = (ids) => {
  return useQuery({
    queryKey: ['watchlist-coins', ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];

      const response = await apiClient.get('/market/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: ids.join(','),
          order: 'market_cap_desc',
          sparkline: true,
          price_change_percentage: '1h,24h,7d',
        },
      });

      if (!Array.isArray(response.data)) {
        return [];
      }

      // The backend mock fallback ignores the `ids` param and returns top-20 coins.
      // Filter strictly to only what the user actually watchlisted.
      const idSet = new Set(ids);
      const filtered = response.data.filter((coin) => idSet.has(coin.id));

      return normalizeCoins(filtered);
    },
    enabled: Array.isArray(ids) && ids.length > 0,
    staleTime: 1000 * 60,       // 1 min
    refetchInterval: 1000 * 60 * 5, // 5 min
    retry: 2,
  });
};

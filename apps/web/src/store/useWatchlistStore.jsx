/**
 * useWatchlistStore.jsx
 *
 * Zustand persisted store for the user's watchlist (coin IDs + minimal cached metadata).
 *
 * Uses the canonical normalizeCoin function to ensure any coin added to the
 * watchlist (from CoinsPage, CoinDetails, etc.) is stored in the same shape.
 *
 * Note: the persisted watchlist objects are ONLY used as:
 *   1. A source of coin IDs to pass to useWatchlistQuery
 *   2. Immediate UI feedback (optimistic, shows "is in watchlist" indicator)
 *
 * Live market data always comes from useWatchlistQuery, not from this store.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { normalizeCoin } from '@/lib/normalizeCoin';

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      watchlist: [],

      addToWatchlist: (coin) => {
        if (!coin || !coin.id) return;
        const normalized = normalizeCoin(coin);
        if (!normalized) return;

        set((state) => {
          if (state.watchlist.some((item) => item.id === normalized.id)) return state;
          return { watchlist: [...state.watchlist, normalized] };
        });
      },

      removeFromWatchlist: (coinId) => {
        if (!coinId) return;
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== coinId),
        }));
      },

      toggleWatchlist: (coinOrId) => {
        if (!coinOrId) return;
        const coinId = typeof coinOrId === 'string' ? coinOrId : coinOrId.id;
        if (!coinId) return;

        const exists = get().watchlist.some((item) => item.id === coinId);
        if (exists) {
          get().removeFromWatchlist(coinId);
        } else if (typeof coinOrId !== 'string') {
          get().addToWatchlist(coinOrId);
        }
      },

      isInWatchlist: (coinId) => {
        if (!coinId) return false;
        return get().watchlist.some((item) => item.id === coinId);
      },
    }),
    {
      name: 'coindash-watchlist',
      partialize: (state) => ({ watchlist: state.watchlist }),
      version: 2,
      // Migrate v1 persisted data (raw CoinGecko shape) through normalizeCoin
      migrate: (persistedState, version) => {
        if (version === 1 && Array.isArray(persistedState?.watchlist)) {
          return {
            watchlist: persistedState.watchlist
              .map((coin) => normalizeCoin(coin))
              .filter(Boolean),
          };
        }
        return persistedState;
      },
    }
  )
);

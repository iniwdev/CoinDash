import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const normalizeCoin = (coin) => ({
  id: coin.id,
  name: coin.name || coin.title || 'Unknown',
  symbol: coin.symbol ? String(coin.symbol).toUpperCase() : 'N/A',
  image: coin.image || coin.icon || coin.logo || '',
  current_price: coin.price ?? coin.current_price ?? 0,
  market_cap: coin.marketCap ?? coin.market_cap ?? 0,
  price_change_percentage_24h:
    coin.priceChange24h ?? coin.price_change_percentage_24h ?? coin.priceChange1d ?? coin.priceChange1h ?? 0,
  total_volume: coin.volume ?? coin.total_volume ?? 0,
  market_cap_rank: coin.rank ?? coin.market_cap_rank ?? 0,
});

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (coin) => {
        if (!coin || !coin.id) return;
        const normalized = normalizeCoin(coin);
        set((state) => {
          if (state.watchlist.some((item) => item.id === normalized.id)) {
            return state;
          }
          const next = [...state.watchlist, normalized];
          console.log('Watchlist added:', normalized.id, 'Watchlist:', next);
          return { watchlist: next };
        });
      },
      removeFromWatchlist: (coinId) => {
        if (!coinId) return;
        set((state) => {
          const next = state.watchlist.filter((item) => item.id !== coinId);
          console.log('Watchlist removed:', coinId, 'Watchlist:', next);
          return { watchlist: next };
        });
      },
      toggleWatchlist: (coinOrId) => {
        if (!coinOrId) return;
        const coinId = typeof coinOrId === 'string' ? coinOrId : coinOrId.id;
        if (!coinId) return;

        const exists = get().watchlist.some((item) => item.id === coinId);
        if (exists) {
          get().removeFromWatchlist(coinId);
          return;
        }

        if (typeof coinOrId === 'string') {
          return;
        }

        get().addToWatchlist(coinOrId);
      },
      isInWatchlist: (coinId) => {
        if (!coinId) return false;
        return get().watchlist.some((item) => item.id === coinId);
      },
      logWatchlist: () => {
        console.log('Watchlist:', get().watchlist);
      },
    }),
    {
      name: 'coindash-watchlist',
      partialize: (state) => ({ watchlist: state.watchlist }),
      version: 1,
      migrate: (persistedState) => persistedState,
    }
  )
);

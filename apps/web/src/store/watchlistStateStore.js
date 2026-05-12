import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWatchlistState = create(
  persist(
    (set, get) => ({
      watchlists: [
        {
          id: 'main',
          name: 'Main Portfolio',
          coins: ['bitcoin', 'ethereum', 'solana'],
          createdAt: new Date().toISOString(),
        }
      ],
      activeWatchlistId: 'main',
      alerts: [],
      notes: {},

      setActiveWatchlistId: (id) => set({ activeWatchlistId: id }),

      getActiveWatchlist: () => {
        const state = get();
        return state.watchlists.find((w) => w.id === state.activeWatchlistId);
      },

      addCoinToWatchlist: (coinId, watchlistId) => {
        const targetId = watchlistId || get().activeWatchlistId;
        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id === targetId && !w.coins.includes(coinId)) {
              return { ...w, coins: [...w.coins, coinId] };
            }
            return w;
          })
        }));
      },

      removeCoinFromWatchlist: (coinId, watchlistId) => {
        const targetId = watchlistId || get().activeWatchlistId;
        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id === targetId) {
              return { ...w, coins: w.coins.filter((c) => c !== coinId) };
            }
            return w;
          })
        }));
      },

      createWatchlist: (name) => {
        const newWatchlist = {
          id: `watchlist_${Date.now()}`,
          name,
          coins: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          watchlists: [...state.watchlists, newWatchlist],
          activeWatchlistId: newWatchlist.id
        }));
        return newWatchlist;
      },

      renameWatchlist: (watchlistId, newName) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) => (w.id === watchlistId ? { ...w, name: newName } : w))
        }));
      },

      deleteWatchlist: (watchlistId) => {
        set((state) => {
          const newWatchlists = state.watchlists.filter((w) => w.id !== watchlistId);
          let newActiveId = state.activeWatchlistId;
          if (state.activeWatchlistId === watchlistId) {
            newActiveId = newWatchlists[0]?.id || null;
          }
          return {
            watchlists: newWatchlists,
            activeWatchlistId: newActiveId
          };
        });
      },

      addAlert: (coinId, type, value) => {
        const newAlert = {
          id: `alert_${Date.now()}`,
          coinId,
          type,
          value,
          createdAt: new Date().toISOString(),
          triggered: false,
        };
        set((state) => ({ alerts: [...state.alerts, newAlert] }));
        return newAlert;
      },

      removeAlert: (alertId) => {
        set((state) => ({ alerts: state.alerts.filter((a) => a.id !== alertId) }));
      },

      addNote: (coinId, note) => {
        set((state) => ({
          notes: { ...state.notes, [coinId]: note }
        }));
      },

      removeNote: (coinId) => {
        set((state) => {
          const newNotes = { ...state.notes };
          delete newNotes[coinId];
          return { notes: newNotes };
        });
      },

      getNote: (coinId) => get().notes[coinId] || '',

      getAlertsForCoin: (coinId) => get().alerts.filter((a) => a.coinId === coinId),

      isCoinInWatchlist: (coinId, watchlistId) => {
        const state = get();
        const targetId = watchlistId || state.activeWatchlistId;
        const watchlist = state.watchlists.find((w) => w.id === targetId);
        return watchlist?.coins.includes(coinId) || false;
      },
    }),
    {
      name: 'coindash-watchlist-complex',
      version: 1,
    }
  )
);

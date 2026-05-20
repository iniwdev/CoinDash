/**
 * watchlistStateStore.js — CoinDash AI
 *
 * Manages UI-level watchlist state:
 *   - Named watchlist groups (Main Portfolio, DeFi, etc.)
 *   - Per-coin notes
 *   - Client-side price alerts (threshold triggers)
 *
 * This is SEPARATE from useWatchlistStore which persists the actual coin
 * objects and drives the live market data fetch. This store is purely for
 * UI organization state (grouping, annotations, alerts).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWatchlistState = create(
  persist(
    (set, get) => ({
      // ── Named watchlists (UI grouping) ──────────────────────────────────────
      watchlists: [
        {
          id: 'main',
          name: 'Main Portfolio',
          coins: [],
          createdAt: new Date().toISOString(),
        },
      ],
      activeWatchlistId: 'main',

      setActiveWatchlistId: (id) => set({ activeWatchlistId: id }),

      getActiveWatchlist: () => {
        const state = get();
        return state.watchlists.find((w) => w.id === state.activeWatchlistId) ?? null;
      },

      addCoinToWatchlist: (coinId, watchlistId) => {
        const targetId = watchlistId || get().activeWatchlistId;
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === targetId && !w.coins.includes(coinId)
              ? { ...w, coins: [...w.coins, coinId] }
              : w
          ),
        }));
      },

      removeCoinFromWatchlist: (coinId, watchlistId) => {
        const targetId = watchlistId || get().activeWatchlistId;
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === targetId
              ? { ...w, coins: w.coins.filter((c) => c !== coinId) }
              : w
          ),
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
          activeWatchlistId: newWatchlist.id,
        }));
        return newWatchlist;
      },

      renameWatchlist: (watchlistId, newName) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === watchlistId ? { ...w, name: newName } : w
          ),
        }));
      },

      deleteWatchlist: (watchlistId) => {
        set((state) => {
          const remaining = state.watchlists.filter((w) => w.id !== watchlistId);
          return {
            watchlists: remaining,
            activeWatchlistId:
              state.activeWatchlistId === watchlistId
                ? (remaining[0]?.id ?? null)
                : state.activeWatchlistId,
          };
        });
      },

      // ── Price alerts ────────────────────────────────────────────────────────
      alerts: [],

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
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== alertId),
        }));
      },

      getAlertsForCoin: (coinId) => {
        return get().alerts.filter((a) => a.coinId === coinId);
      },

      // ── Per-coin notes ──────────────────────────────────────────────────────
      notes: {},

      addNote: (coinId, text) => {
        set((state) => ({
          notes: { ...state.notes, [coinId]: text },
        }));
      },

      getNote: (coinId) => get().notes[coinId] ?? '',

      removeNote: (coinId) => {
        set((state) => {
          const { [coinId]: _, ...rest } = state.notes;
          return { notes: rest };
        });
      },
    }),
    {
      name: 'coindash-watchlist-state',
      version: 1,
    }
  )
);

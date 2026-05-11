import { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notes, setNotes] = useState({});

  // Load from localStorage
  useEffect(() => {
    const savedWatchlists = localStorage.getItem('coindash_watchlists');
    const savedAlerts = localStorage.getItem('coindash_alerts');
    const savedNotes = localStorage.getItem('coindash_notes');
    const savedActiveId = localStorage.getItem('coindash_active_watchlist');

    if (savedWatchlists) {
      const parsed = JSON.parse(savedWatchlists);
      setWatchlists(parsed);
      setActiveWatchlistId(savedActiveId || (parsed[0]?.id || null));
    } else {
      // Create default watchlist
      const defaultWatchlist = {
        id: 'main',
        name: 'Main Portfolio',
        coins: ['bitcoin', 'ethereum', 'solana'],
        createdAt: new Date().toISOString(),
      };
      setWatchlists([defaultWatchlist]);
      setActiveWatchlistId('main');
    }

    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (watchlists.length > 0) {
      localStorage.setItem('coindash_watchlists', JSON.stringify(watchlists));
    }
  }, [watchlists]);

  useEffect(() => {
    localStorage.setItem('coindash_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('coindash_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (activeWatchlistId) {
      localStorage.setItem('coindash_active_watchlist', activeWatchlistId);
    }
  }, [activeWatchlistId]);

  const getActiveWatchlist = () => {
    return watchlists.find((w) => w.id === activeWatchlistId);
  };

  const addCoinToWatchlist = (coinId, watchlistId = activeWatchlistId) => {
    setWatchlists((prev) =>
      prev.map((w) => {
        if (w.id === watchlistId && !w.coins.includes(coinId)) {
          return { ...w, coins: [...w.coins, coinId] };
        }
        return w;
      })
    );
  };

  const removeCoinFromWatchlist = (coinId, watchlistId = activeWatchlistId) => {
    setWatchlists((prev) =>
      prev.map((w) => {
        if (w.id === watchlistId) {
          return { ...w, coins: w.coins.filter((c) => c !== coinId) };
        }
        return w;
      })
    );
  };

  const createWatchlist = (name) => {
    const newWatchlist = {
      id: `watchlist_${Date.now()}`,
      name,
      coins: [],
      createdAt: new Date().toISOString(),
    };
    setWatchlists((prev) => [...prev, newWatchlist]);
    setActiveWatchlistId(newWatchlist.id);
    return newWatchlist;
  };

  const renameWatchlist = (watchlistId, newName) => {
    setWatchlists((prev) =>
      prev.map((w) => (w.id === watchlistId ? { ...w, name: newName } : w))
    );
  };

  const deleteWatchlist = (watchlistId) => {
    setWatchlists((prev) => prev.filter((w) => w.id !== watchlistId));
    if (activeWatchlistId === watchlistId) {
      setActiveWatchlistId(watchlists[0]?.id || null);
    }
  };

  const addAlert = (coinId, type, value) => {
    const newAlert = {
      id: `alert_${Date.now()}`,
      coinId,
      type, // 'price_above', 'price_below', 'change_percent'
      value,
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    setAlerts((prev) => [...prev, newAlert]);
    return newAlert;
  };

  const removeAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const addNote = (coinId, note) => {
    setNotes((prev) => ({
      ...prev,
      [coinId]: note,
    }));
  };

  const removeNote = (coinId) => {
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[coinId];
      return copy;
    });
  };

  const getNote = (coinId) => notes[coinId] || '';

  const getAlertsForCoin = (coinId) => alerts.filter((a) => a.coinId === coinId);

  const isCoinInWatchlist = (
    coinId,
    watchlistId = activeWatchlistId
  ) => {
    const watchlist = watchlists.find((w) => w.id === watchlistId);
    return watchlist?.coins.includes(coinId) || false;
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        activeWatchlistId,
        setActiveWatchlistId,
        getActiveWatchlist,
        addCoinToWatchlist,
        removeCoinFromWatchlist,
        createWatchlist,
        renameWatchlist,
        deleteWatchlist,
        alerts,
        addAlert,
        removeAlert,
        notes,
        addNote,
        removeNote,
        getNote,
        getAlertsForCoin,
        isCoinInWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

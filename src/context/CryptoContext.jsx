import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CryptoContext = createContext(null);

export const useCrypto = () => {
  const context = useContext(CryptoContext);

  if (!context) {
    throw new Error('useCrypto must be used within CryptoProvider');
  }

  return context;
};

export const CryptoProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem('coindash_watchlist');
      return storedValue ? JSON.parse(storedValue) : [];
    } catch {
      return [];
    }
  });

  const fetchCoins = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://openapiv1.coinstats.app/coins?limit=100', {
        headers: {
          'X-API-KEY': import.meta.env.VITE_COINSTATS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`CoinStats API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Normalize coins array from various possible response shapes
      let coinsList = [];
      if (Array.isArray(data)) {
        coinsList = data;
      } else if (data.coins && Array.isArray(data.coins)) {
        coinsList = data.coins;
      } else if (data.result && Array.isArray(data.result)) {
        coinsList = data.result;
      } else if (data.data && Array.isArray(data.data)) {
        coinsList = data.data;
      }

      // Normalize each coin object with fallbacks for missing fields
      const normalizedCoins = coinsList.map((coin, index) => ({
        id: coin.id || `coin-${index}`,
        name: coin.name || 'Unknown',
        symbol: coin.symbol || '---',
        price: typeof coin.price === 'number' ? coin.price : 0,
        icon: coin.icon || coin.image || coin.logo || '',
        priceChange1d: coin.priceChange1d ?? coin.priceChange24h ?? coin.change24h ?? 0,
        priceChange7d: coin.priceChange7d ?? coin.priceChange ?? 0,
        marketCap: coin.marketCap || 0,
        volume: coin.volume || 0,
        rank: coin.rank || index + 1,
      }));

      setCoins(normalizedCoins);
      
      // Debug: Verify coin structure
      console.log('Coin data sample:', normalizedCoins[0]);
    } catch (err) {
      console.error('Failed to fetch coins:', err);
      setError(err instanceof Error ? err.message : 'Failed to load coins. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  useEffect(() => {
    try {
      window.localStorage.setItem('coindash_watchlist', JSON.stringify(watchlist));
    } catch {
      // Ignore write errors for unsupported browsers or storage limits.
    }
  }, [watchlist]);

  const toggleWatchlist = useCallback((coinId) => {
    setWatchlist((current) =>
      current.includes(coinId) ? current.filter((id) => id !== coinId) : [...current, coinId],
    );
  }, []);

  const value = useMemo(
    () => ({
      coins,
      loading,
      error,
      watchlist,
      fetchCoins,
      toggleWatchlist,
    }),
    [coins, loading, error, watchlist, fetchCoins, toggleWatchlist],
  );

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
};

export default CryptoContext;

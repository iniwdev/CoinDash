import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from "@/components/layout/Layout";

const AllCoins = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching coins from CoinStats API...');

        const response = await fetch('https://openapiv1.coinstats.app/coins?limit=20', {
          headers: {
            'X-API-KEY': import.meta.env.VITE_COINSTATS_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('CoinStats API Response:', data);

        // IMPORTANT: CoinStats API returns data in data.result
        let coinsList = [];
        if (data.result && Array.isArray(data.result)) {
          coinsList = data.result;
        } else if (Array.isArray(data)) {
          coinsList = data;
        } else if (data.coins && Array.isArray(data.coins)) {
          coinsList = data.coins;
        }

        console.log('Extracted coins:', coinsList.length);

        // Normalize coin data
        const normalizedCoins = coinsList.map((coin, index) => ({
          id: coin.id || `coin-${index}`,
          name: coin.name || 'Unknown',
          symbol: coin.symbol || '---',
          price: typeof coin.price === 'number' ? coin.price : 0,
          icon: coin.icon || coin.image || '',
          priceChange1d: coin.priceChange1d ?? coin.priceChange24h ?? 0,
        }));

        setCoins(normalizedCoins);
        console.log('Normalized coins:', normalizedCoins.length);

      } catch (err) {
        console.error('Failed to fetch coins:', err);
        setError(err.message);

        // Fallback mock data
        const mockCoins = [
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 45000, icon: '', priceChange1d: 2.5 },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3000, icon: '', priceChange1d: -1.2 },
          { id: 'tether', name: 'Tether', symbol: 'USDT', price: 1.00, icon: '', priceChange1d: 0.0 },
          { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', price: 300, icon: '', priceChange1d: 1.8 },
          { id: 'solana', name: 'Solana', symbol: 'SOL', price: 100, icon: '', priceChange1d: -0.5 },
        ];
        setCoins(mockCoins);
        console.log('Using fallback mock data');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '$0.00';
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatPercentage = (value) => {
    if (typeof value !== 'number') return '—';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPercentageColor = (value) => {
    if (typeof value !== 'number') return 'text-slate-400';
    return value >= 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  // Loading State
  if (loading) {
    return (
      <Layout>
        <div className="section-spacing bg-background">
          <div className="content-width">
            <h1 className="text-4xl font-bold text-white mb-8">Cryptocurrency Prices</h1>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-400 mt-8">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error State
  if (error) {
    return (
      <Layout>
        <div className="section-spacing bg-background">
          <div className="content-width">
            <h1 className="text-4xl font-bold text-white mb-8">Cryptocurrency Prices</h1>
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h2>
              <p className="text-slate-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty State
  if (!coins || coins.length === 0) {
    return (
      <Layout>
        <div className="section-spacing bg-background">
          <div className="content-width">
            <h1 className="text-4xl font-bold text-white mb-8">Cryptocurrency Prices</h1>
            <div className="bg-slate-800/50 rounded-lg p-12 text-center">
              <h2 className="text-xl font-semibold text-slate-300 mb-2">No Coins Found</h2>
              <p className="text-slate-400">Unable to load cryptocurrency data at this time.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Success State - Show Data
  return (
    <Layout>
      <div className="section-spacing bg-background">
        <div className="content-width">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Cryptocurrency Prices</h1>
              <p className="text-slate-400">Live prices and market data</p>
            </div>
            <Link
              to="/"
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-lg"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Top Cryptocurrencies</h2>
              <p className="text-sm text-slate-400">Showing {coins.length} coins</p>
            </div>

            <div className="divide-y divide-white/5">
              {coins.map((coin, index) => (
                <div key={coin.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full text-xs font-bold text-slate-300">
                        {index + 1}
                      </div>

                      {coin.icon ? (
                        <img
                          src={coin.icon}
                          alt={coin.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-300">
                          {coin.symbol?.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-white">{coin.name}</h3>
                        <p className="text-sm text-slate-400 uppercase">{coin.symbol}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-white">{formatPrice(coin.price)}</p>
                      <p className={`text-sm font-medium ${getPercentageColor(coin.priceChange1d)}`}>
                        {formatPercentage(coin.priceChange1d)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllCoins;
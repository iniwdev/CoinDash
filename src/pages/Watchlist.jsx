import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Layout from '../components/Layout';
import WatchlistHeader from '../components/watchlist/WatchlistHeader';
import WatchlistPerformanceChart from '../components/watchlist/WatchlistPerformanceChart';
import WatchlistTable from '../components/watchlist/WatchlistTable';
import WatchlistHeatmap from '../components/watchlist/WatchlistHeatmap';
import WatchlistNews from '../components/watchlist/WatchlistNews';
import WatchlistAlerts from '../components/watchlist/WatchlistAlerts';
import CoinDrawer from '../components/watchlist/CoinDrawer';
import WatchlistManager from '../components/watchlist/WatchlistManager';
import WatchlistExportShare from '../components/watchlist/WatchlistExportShare';
import { useWatchlist } from '../context/WatchlistContext';

const Watchlist = () => {
  const { getActiveWatchlist } = useWatchlist();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const activeWatchlist = getActiveWatchlist();
  const coinIds = activeWatchlist?.coins || [];

  useEffect(() => {
    if (coinIds.length === 0) {
      setCoins([]);
      setLoading(false);
      return;
    }

    const fetchWatchlistCoins = async () => {
      try {
        setLoading(true);
        const ids = coinIds.join(',');
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h%2C24h%2C7d`
        );
        setCoins(response.data);
      } catch (error) {
        console.error('Error fetching watchlist coins:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchWatchlistCoins();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchWatchlistCoins, 30000);
    return () => clearInterval(interval);
  }, [coinIds]);

  const filteredCoins = coins.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'gainers') {
      return matchesSearch && coin.price_change_percentage_24h > 0;
    }
    if (filterType === 'losers') {
      return matchesSearch && coin.price_change_percentage_24h < 0;
    }
    if (filterType === 'high_volume') {
      return matchesSearch && coin.total_volume > 1000000000;
    }

    return matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <Layout>
      <motion.div
        className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] pt-8 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Watchlist Manager */}
          <motion.div variants={itemVariants}>
            <WatchlistManager />
          </motion.div>

          {coinIds.length === 0 ? (
            <motion.div
              className="mt-20 text-center"
              variants={itemVariants}
            >
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-16 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Your watchlist is empty
                </h3>
                <p className="text-slate-400 mb-8">
                  Track your favorite crypto assets and monitor the market in
                  real time.
                </p>
                <a
                  href="/coins"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
                >
                  Explore Coins
                </a>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header Analytics */}
              <motion.div variants={itemVariants}>
                <WatchlistHeader coins={coins} loading={loading} />
              </motion.div>

              {/* Performance Chart */}
              <motion.div variants={itemVariants}>
                <WatchlistPerformanceChart
                  coins={coins}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              </motion.div>

              {/* Export & Share */}
              <motion.div variants={itemVariants} className="flex justify-end">
                <WatchlistExportShare coins={coins} />
              </motion.div>

              {/* Search and Filters */}
              <motion.div variants={itemVariants} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  <option value="all">All</option>
                  <option value="gainers">Gainers</option>
                  <option value="losers">Losers</option>
                  <option value="high_volume">High Volume</option>
                </select>
              </motion.div>

              {/* Watchlist Table */}
              <motion.div variants={itemVariants}>
                <WatchlistTable
                  coins={filteredCoins}
                  loading={loading}
                  onSelectCoin={setSelectedCoin}
                />
              </motion.div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Heatmap */}
                <motion.div variants={itemVariants}>
                  <WatchlistHeatmap coins={coins} />
                </motion.div>

                {/* News Feed */}
                <motion.div variants={itemVariants}>
                  <WatchlistNews coins={coins} />
                </motion.div>
              </div>

              {/* Alerts */}
              <motion.div variants={itemVariants}>
                <WatchlistAlerts coins={coins} />
              </motion.div>
            </>
          )}
        </div>

        {/* Coin Detail Drawer */}
        {selectedCoin && (
          <CoinDrawer coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
        )}
      </motion.div>
    </Layout>
  );
};

export default Watchlist;
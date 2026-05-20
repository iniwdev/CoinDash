import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from "@/components/layout/Layout";
import WatchlistHeader from "@/features/watchlist/components/WatchlistHeader";
import WatchlistPerformanceChart from "@/features/watchlist/components/WatchlistPerformanceChart";
import WatchlistTable from "@/features/watchlist/components/WatchlistTable";
import WatchlistHeatmap from "@/features/watchlist/components/WatchlistHeatmap";
import WatchlistNews from "@/features/watchlist/components/WatchlistNews";
import WatchlistAlerts from "@/features/watchlist/components/WatchlistAlerts";
import CoinDrawer from "@/features/watchlist/components/CoinDrawer";
import WatchlistManager from "@/features/watchlist/components/WatchlistManager";
import WatchlistExportShare from "@/features/watchlist/components/WatchlistExportShare";
import { useWatchlistStore } from "@/store/useWatchlistStore";
import { useWatchlistQuery } from '@/features/watchlist/api/useWatchlistQuery';

const Watchlist = () => {
  const watchlist = useWatchlistStore((state) => state.watchlist);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const coinIds = useMemo(() => (watchlist || []).map((coin) => coin.id), [watchlist]);

  // Use React Query for centralized caching and synchronization
  const { data: fetchedCoins, isLoading: loading } = useWatchlistQuery(coinIds);

  // Fallback to local store data while loading to prevent empty flashes,
  // but use real fetched data once available to ensure accuracy.
  const coins = useMemo(() => {
    if (fetchedCoins && fetchedCoins.length > 0) return fetchedCoins;
    return watchlist || [];
  }, [fetchedCoins, watchlist]);

  const filteredCoins = (coins || []).filter((coin) => {
    const matchesSearch =
      (coin.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coin.symbol || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'gainers') {
      return matchesSearch && coin.priceChange24h > 0;
    }
    if (filterType === 'losers') {
      return matchesSearch && coin.priceChange24h < 0;
    }
    if (filterType === 'high_volume') {
      return matchesSearch && coin.volume > 1000000000;
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
                <Link
                  to="/coins"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
                >
                  Explore Coins
                </Link>
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
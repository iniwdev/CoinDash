import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, Plus, Star } from 'lucide-react';
import AnimatedCounter from "@/features/watchlist/components/AnimatedCounter";
import { useWatchlistState } from "@/store/watchlistStateStore";

const WatchlistHeader = ({ coins, loading }) => {
  const { watchlists, activeWatchlistId, setActiveWatchlistId, createWatchlist } = useWatchlistState();
  const [btcDominance, setBtcDominance] = useState(0);
  const [fearGreedScore, setFearGreedScore] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  useEffect(() => {
    // Fetch BTC dominance
    const fetchBtcDominance = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/global'
        );
        const data = await response.json();
        setBtcDominance(
          data.data?.btc_market_cap_percentage?.toFixed(2) || 0
        );
      } catch (error) {
        console.error('Error fetching BTC dominance:', error);
      }
    };

    // Fetch Fear & Greed Index
    const fetchFearGreed = async () => {
      try {
        const response = await fetch(
          'https://api.alternative.me/fng/?limit=1'
        );
        const data = await response.json();
        setFearGreedScore(data.data?.[0]?.value || 0);
      } catch (error) {
        console.error('Error fetching Fear & Greed:', error);
      }
    };

    fetchBtcDominance();
    fetchFearGreed();
  }, []);

  const totalValue = (coins || []).reduce((sum, coin) => {
    return sum + (coin.current_price * (coin.total_supply || 1) || 0);
  }, 0);

  const perf24h = (coins || []).reduce((sum, coin) => {
    return sum + (coin.price_change_percentage_24h || 0);
  }, 0) / (coins?.length || 1);

  const bestPerformer = (coins || []).reduce((best, coin) => {
    if (!best || (coin.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0)) {
      return coin;
    }
    return best;
  }, null);

  const worstPerformer = (coins || []).reduce((worst, coin) => {
    if (!worst || (coin.price_change_percentage_24h || 0) < (worst.price_change_percentage_24h || 0)) {
      return coin;
    }
    return worst;
  }, null);

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(newWatchlistName);
      setNewWatchlistName('');
      setShowCreateForm(false);
    }
  };

  const MetricCard = ({ icon: Icon, label, value, change, prefix = '', suffix = '' }) => {
    const isPositive = change >= 0;

    return (
      <motion.div
        className="relative overflow-hidden group"
        whileHover={{ y: -2, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
        <div className="relative bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 group-hover:border-blue-500/40 rounded-[28px] p-6 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <Icon className="w-5 h-5 text-blue-400" />
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(change).toFixed(2)}%
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-white text-2xl font-bold">
            {prefix}
            <AnimatedCounter value={value} />
            {suffix}
          </p>
        </div>
      </motion.div>
    );
  };

  if (loading || coins.length === 0) {
    return (
      <div className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] p-6">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Side - Watchlist Tabs */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">My Watchlists</h1>
          <div className="flex flex-wrap gap-3">
            {watchlists.map((watchlist) => {
              const isActive = watchlist.id === activeWatchlistId;
              return (
                <motion.button
                  key={watchlist.id}
                  onClick={() => setActiveWatchlistId(watchlist.id)}
                  className={`relative px-4 py-2 rounded-[28px] font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-black/40 border border-white/10 text-slate-300 hover:border-blue-500/40 hover:bg-black/60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <span>{watchlist.name}</span>
                    <span className="text-xs bg-black/30 px-2 py-1 rounded-full">
                      {watchlist.coins.length}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[28px] blur-xl -z-10"></div>
                  )}
                </motion.button>
              );
            })}

            {/* Create New Watchlist */}
            {showCreateForm ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Watchlist name..."
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateWatchlist()}
                  autoFocus
                  className="px-4 py-2 bg-black/40 border border-white/10 rounded-[28px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/40 text-sm"
                />
                <motion.button
                  onClick={handleCreateWatchlist}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-[28px] font-semibold transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewWatchlistName('');
                  }}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-[28px] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ✕
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 hover:border-blue-500/40 text-slate-300 rounded-[28px] font-semibold transition-all duration-300 hover:bg-black/60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                New
              </motion.button>
            )}
          </div>
        </div>

        {/* Right Side - Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] p-4">
            <p className="text-slate-400 text-sm">Total Assets</p>
            <p className="text-white text-2xl font-bold">{coins.length}</p>
          </div>
          <div className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] p-4">
            <p className="text-slate-400 text-sm">Total Value</p>
            <p className="text-white text-2xl font-bold">
              ${(totalValue / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={Activity}
          label="Assets Tracked"
          value={coins.length}
          change={0}
        />

        <MetricCard
          icon={TrendingUp}
          label="Watchlist Value"
          value={totalValue}
          change={Math.random() * 10 - 5}
          prefix="$"
          suffix={totalValue > 1000000 ? 'M+' : 'K'}
        />

        <MetricCard
          icon={Zap}
          label="24h Performance"
          value={perf24h}
          change={perf24h}
          suffix="%"
        />

        <MetricCard
          icon={TrendingUp}
          label="Best Performer"
          value={bestPerformer?.price_change_percentage_24h || 0}
          change={bestPerformer?.price_change_percentage_24h || 0}
          prefix={bestPerformer?.symbol?.toUpperCase() ? `${bestPerformer?.symbol?.toUpperCase()} ` : ''}
          suffix="%"
        />

        <MetricCard
          icon={Activity}
          label="BTC Dominance"
          value={btcDominance}
          change={0}
          suffix="%"
        />

        <MetricCard
          icon={Activity}
          label="Fear & Greed"
          value={fearGreedScore}
          change={0}
          suffix=""
        />
      </div>
    </div>
  );
};

export default WatchlistHeader;

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useWatchlistStore } from "@/store/useWatchlistStore";
import Sparkline from "@/features/market-data/components/Sparkline";

const WatchlistTable = ({ coins, loading, onSelectCoin }) => {
  const removeCoinFromWatchlist = useWatchlistStore((state) => state.removeFromWatchlist);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedCoins = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return coins.slice(startIdx, startIdx + itemsPerPage);
  }, [coins, currentPage]);

  const totalPages = Math.ceil(coins.length / itemsPerPage);

  const getPriceChangeColor = (change) => {
    if (!change || isNaN(change)) return 'text-slate-400';
    return change > 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  const getPriceChangeBg = (change) => {
    if (!change || isNaN(change)) return 'bg-slate-700/30';
    return change > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-16 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/15 text-yellow-300 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-4">
          <span className="text-2xl">★</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No favorite coins yet</h3>
        <p className="text-sm text-slate-400">Add coins to your watchlist to see them here.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-[0.24em]">
              <tr>
                <th className="w-[40px] px-2 py-3 text-left">⭐</th>
                <th className="w-[40px] px-2 py-3 text-left">Rank</th>
                <th className="w-[140px] px-2 py-3 text-left">Name</th>
                <th className="w-[70px] px-2 py-3 text-right">1H</th>
                <th className="w-[70px] px-2 py-3 text-right">24H</th>
                <th className="w-[70px] px-2 py-3 text-right">7D</th>
                <th className="w-[90px] px-2 py-3 text-right">Price</th>
                <th className="w-[100px] px-2 py-3 text-right">Market Cap</th>
                <th className="w-[100px] px-2 py-3 text-right">Volume</th>
                <th className="w-[100px] px-2 py-3 text-center">Graph</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {paginatedCoins.map((coin, index) => (
                  <motion.tr
                    key={coin.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => onSelectCoin(coin)}
                  >
                    <td className="px-2 py-3 text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCoinFromWatchlist(coin.id);
                        }}
                        className="text-lg text-yellow-400 shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:opacity-80 transition"
                        aria-label="Remove from watchlist"
                      >
                        ★
                      </button>
                    </td>

                    <td className="px-2 py-3 text-left text-xs font-semibold text-white">
                      {coin.rank || 'N/A'}
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={coin.image || coin.icon}
                          alt={coin.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {coin.name}
                          </div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500 truncate">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-3 text-right">
                      <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getPriceChangeBg(
                        coin.priceChange1h
                      )} ${getPriceChangeColor(coin.priceChange1h)}`}>
                        <span className="flex items-center justify-end gap-1">
                          {(coin.priceChange1h ?? 0) > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {(coin.priceChange1h ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-2 py-3 text-right">
                      <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getPriceChangeBg(
                        coin.priceChange24h
                      )} ${getPriceChangeColor(coin.priceChange24h)}`}>
                        <span className="flex items-center justify-end gap-1">
                          {(coin.priceChange24h ?? 0) > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {(coin.priceChange24h ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-2 py-3 text-right">
                      <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getPriceChangeBg(
                        coin.priceChange7d
                      )} ${getPriceChangeColor(coin.priceChange7d)}`}>
                        <span className="flex items-center justify-end gap-1">
                          {(coin.priceChange7d ?? 0) > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {(coin.priceChange7d ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-2 py-3 text-right text-sm font-semibold text-white">
                      ${coin.price?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || 'N/A'}
                    </td>

                    <td className="px-2 py-3 text-right text-sm text-slate-300">
                      ${((coin.marketCap || 0) / 1000000).toFixed(0)}M
                    </td>

                    <td className="px-2 py-3 text-right text-sm text-slate-300">
                      ${((coin.volume || 0) / 1000000).toFixed(0)}M
                    </td>

                    <td className="px-2 py-3 text-center">
                      <div className="w-full h-10 mx-auto max-w-[100px]">
                        {coin.sparkline && coin.sparkline.length > 0 ? (
                          <Sparkline
                            coin={coin}
                            data={coin.sparkline}
                            color={
                              (coin.priceChange7d ?? 0) > 0
                                ? '#10b981'
                                : '#f43f5e'
                            }
                          />
                        ) : (
                          <div className="h-full bg-white/10 rounded" />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white disabled:opacity-30 hover:bg-slate-700/50 transition-colors text-sm font-medium"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
            return page <= totalPages ? page : null;
          }).filter(Boolean).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg font-semibold transition-colors text-sm ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white disabled:opacity-30 hover:bg-slate-700/50 transition-colors text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default WatchlistTable;

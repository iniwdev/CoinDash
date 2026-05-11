import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import Sparkline from '../Sparkline';

const WatchlistTable = ({ coins, loading, onSelectCoin }) => {
  const { removeCoinFromWatchlist } = useWatchlist();
  const [sortConfig, setSortConfig] = useState({
    key: 'market_cap_rank',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedCoins = useMemo(() => {
    let sorted = [...coins];

    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });

    return sorted;
  }, [coins, sortConfig]);

  const paginatedCoins = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedCoins.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedCoins, currentPage]);

  const totalPages = Math.ceil(sortedCoins.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <div className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getPriceChangeColor = (change) => {
    if (!change) return 'text-slate-400';
    return change > 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  const getPriceChangeBg = (change) => {
    if (!change) return 'bg-black/40';
    return change > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  };

  if (loading) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Table Container */}
      <div className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] overflow-hidden">
        {/* Header */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-white/6 bg-black/40">
                <th className="w-12 px-3 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    COIN
                    <SortIcon columnKey="name" />
                  </button>
                </th>
                <th className="w-24 px-3 py-4 text-right">
                  <button
                    onClick={() => handleSort('current_price')}
                    className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    PRICE
                    <SortIcon columnKey="current_price" />
                  </button>
                </th>
                <th className="w-16 px-3 py-4 text-right">
                  <span className="text-xs font-semibold text-slate-400">1H</span>
                </th>
                <th className="w-16 px-3 py-4 text-right">
                  <button
                    onClick={() => handleSort('price_change_percentage_24h')}
                    className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    24H
                    <SortIcon columnKey="price_change_percentage_24h" />
                  </button>
                </th>
                <th className="w-16 px-3 py-4 text-right">
                  <button
                    onClick={() => handleSort('price_change_percentage_7d_in_currency')}
                    className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    7D
                    <SortIcon columnKey="price_change_percentage_7d_in_currency" />
                  </button>
                </th>
                <th className="w-20 px-3 py-4 text-right">
                  <button
                    onClick={() => handleSort('total_volume')}
                    className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    VOLUME
                    <SortIcon columnKey="total_volume" />
                  </button>
                </th>
                <th className="w-20 px-3 py-4 text-right">
                  <button
                    onClick={() => handleSort('market_cap')}
                    className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                  >
                    MARKET CAP
                    <SortIcon columnKey="market_cap" />
                  </button>
                </th>
                <th className="w-16 px-3 py-4 text-right">
                  <span className="text-xs font-semibold text-slate-400">CHART</span>
                </th>
                <th className="w-16 px-3 py-4 text-right">
                  <span className="text-xs font-semibold text-slate-400">ACTIONS</span>
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Body */}
        <div className="overflow-x-auto">
          <AnimatePresence mode="popLayout">
            {paginatedCoins.map((coin, index) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <table className="w-full table-fixed">
                  <tbody>
                    <tr
                      className="border-b border-white/6 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => onSelectCoin(coin)}
                    >
                      {/* Coin Name */}
                      <td className="w-12 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-5 h-5 rounded-full flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-white truncate">
                              {coin.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {coin.symbol.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="w-24 px-3 py-3 text-right">
                        <div className="text-xs font-semibold text-white">
                          ${coin.current_price?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || 'N/A'}
                        </div>
                      </td>

                      {/* 1H Change */}
                      <td className="w-16 px-3 py-3 text-right">
                        <div
                          className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getPriceChangeBg(
                            coin.price_change_percentage_1h_in_currency
                          )} ${getPriceChangeColor(
                            coin.price_change_percentage_1h_in_currency
                          )}`}
                        >
                          <span className="flex items-center gap-1">
                            {coin.price_change_percentage_1h_in_currency > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {coin.price_change_percentage_1h_in_currency?.toFixed(
                              1
                            )}
                          </span>
                        </div>
                      </td>

                      {/* 24H Change */}
                      <td className="w-16 px-3 py-3 text-right">
                        <div
                          className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getPriceChangeBg(
                            coin.price_change_percentage_24h
                          )} ${getPriceChangeColor(coin.price_change_percentage_24h)}`}
                        >
                          <span className="flex items-center gap-1">
                            {coin.price_change_percentage_24h > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {coin.price_change_percentage_24h?.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* 7D Change */}
                      <td className="w-16 px-3 py-3 text-right">
                        <div
                          className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getPriceChangeBg(
                            coin.price_change_percentage_7d_in_currency
                          )} ${getPriceChangeColor(
                            coin.price_change_percentage_7d_in_currency
                          )}`}
                        >
                          <span className="flex items-center gap-1">
                            {coin.price_change_percentage_7d_in_currency > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {coin.price_change_percentage_7d_in_currency?.toFixed(
                              1
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="w-20 px-3 py-3 text-right">
                        <div className="text-xs font-semibold text-slate-300">
                          ${(coin.total_volume / 1000000).toFixed(0)}M
                        </div>
                      </td>

                      {/* Market Cap */}
                      <td className="w-20 px-3 py-3 text-right">
                        <div className="text-xs font-semibold text-slate-300">
                          ${(coin.market_cap / 1000000).toFixed(0)}M
                        </div>
                      </td>

                      {/* Sparkline */}
                      <td className="w-16 px-3 py-3">
                        <div className="w-12 h-6">
                          {coin.sparkline_in_7d?.price ? (
                            <Sparkline
                              data={coin.sparkline_in_7d.price}
                              color={
                                coin.price_change_percentage_7d_in_currency > 0
                                  ? '#10b981'
                                  : '#f43f5e'
                              }
                            />
                          ) : (
                            <div className="h-full bg-white/10 rounded" />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="w-16 px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCoinFromWatchlist(coin.id);
                            }}
                            className="p-1 hover:bg-rose-500/20 rounded transition-colors"
                            title="Remove from watchlist"
                          >
                            <MoreVertical className="w-3 h-3 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-black/40 border border-white/10 rounded-[28px] text-white disabled:opacity-50 hover:bg-black/60 transition-colors text-sm"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-[28px] font-semibold transition-colors text-sm ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-black/40 border border-white/10 text-slate-400 hover:bg-black/60'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-black/40 border border-white/10 rounded-[28px] text-white disabled:opacity-50 hover:bg-black/60 transition-colors text-sm"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default WatchlistTable;

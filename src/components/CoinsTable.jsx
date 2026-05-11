import { useMemo } from 'react';
import { useWatchlistStore } from '../store/useWatchlistStore.jsx';
import CoinRow from './CoinRow';

const CoinsTable = ({
  coins: propCoins,
  loading: propLoading,
  error: propError,
  charts: propCharts = {},
  onToggleFavorite: propToggleFavorite,
  activeTab = '',
}) => {
  const watchlist = useWatchlistStore((state) => state.watchlist);
  const toggleWatchlist = useWatchlistStore((state) => state.toggleWatchlist);

  const isPageMode = typeof propCoins !== 'undefined';
  const coins = isPageMode ? propCoins : [];
  const loading = isPageMode ? propLoading : false;
  const error = isPageMode ? propError : null;
  const charts = isPageMode ? propCharts : {};

  const handleToggleFavorite = typeof propToggleFavorite === 'function'
    ? propToggleFavorite
    : (coin) => toggleWatchlist(coin);

  const favoriteSet = useMemo(
    () => new Set(watchlist.map((item) => item.id)),
    [watchlist]
  );

  const formatSkeletonCell = () => <div className="h-4 rounded bg-slate-800" />;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
      <div className="px-6 py-5 border-b border-white/10 bg-slate-950/70">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Top Coins</h2>
            <p className="text-sm text-slate-400">Market cap ranking with price momentum and live trends.</p>
          </div>
        </div>
      </div>

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
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-white/5 last:border-b-0">
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3 space-y-2">
                    <div className="h-4 rounded bg-slate-800 w-32" />
                    <div className="h-3 rounded bg-slate-800 w-16" />
                  </td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                  <td className="px-2 py-3">{formatSkeletonCell()}</td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={10} className="px-2 py-12 text-center text-rose-300">
                  {error}
                </td>
              </tr>
            ) : coins.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-2 py-16">
                  {activeTab === 'favorites' ? (
                    <div className="mx-auto max-w-lg rounded-[32px] border border-white/10 bg-slate-950/80 p-8 text-center shadow-[0_32px_120px_-70px_rgba(15,23,42,0.9)]">
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/15 text-yellow-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <span className="text-2xl">★</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No favorite coins yet</h3>
                      <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Star coins from the market table to build your watchlist and unlock a tailored favorites view.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">No coins found.</div>
                  )}
                </td>
              </tr>
            ) : (
              coins.map((coin, index) => (
                <CoinRow
                  key={coin.id}
                  coin={coin}
                  index={index}
                  isFavorite={favoriteSet.has(coin.id)}
                  onToggleFavorite={handleToggleFavorite}
                  chartData={charts[coin.symbol]}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoinsTable;

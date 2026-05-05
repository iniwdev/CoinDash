import { useMemo, useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import CoinRow from './CoinRow';

const CoinsTable = ({ coins: propCoins, loading: propLoading, error: propError, charts: propCharts = {} }) => {
  const { loading: contextLoading, error: contextError, watchlist, toggleWatchlist } = useCrypto();
  const [localFavorites, setLocalFavorites] = useState([]);

  const isPageMode = typeof propCoins !== 'undefined';
  const coins = isPageMode ? propCoins : [];
  const loading = isPageMode ? propLoading : contextLoading;
  const error = isPageMode ? propError : contextError;
  const charts = isPageMode ? propCharts : {};

  const activeWatchlist = isPageMode ? localFavorites : watchlist;
  const handleToggleFavorite = isPageMode
    ? (coinId) => setLocalFavorites((current) =>
        current.includes(coinId) ? current.filter((id) => id !== coinId) : [...current, coinId],
      )
    : toggleWatchlist;

  const favoriteSet = useMemo(() => new Set(activeWatchlist), [activeWatchlist]);

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
              <th className="w-[60px] px-4 py-4 text-left">⭐</th>
              <th className="w-[60px] px-4 py-4 text-left">Rank</th>
              <th className="w-[200px] px-4 py-4 text-left">Name</th>
              <th className="w-[100px] px-4 py-4 text-right">1H</th>
              <th className="w-[100px] px-4 py-4 text-right">24H</th>
              <th className="w-[100px] px-4 py-4 text-right">7D</th>
              <th className="w-[120px] px-4 py-4 text-right">Price</th>
              <th className="w-[140px] px-4 py-4 text-right">Market Cap</th>
              <th className="w-[140px] px-4 py-4 text-right">Volume</th>
              <th className="w-[160px] px-4 py-4 text-center">Graph</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-white/5 last:border-b-0">
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4 space-y-2">
                    <div className="h-4 rounded bg-slate-800 w-32" />
                    <div className="h-3 rounded bg-slate-800 w-16" />
                  </td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                  <td className="px-4 py-4">{formatSkeletonCell()}</td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-rose-300">
                  {error}
                </td>
              </tr>
            ) : coins.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                  No coins found.
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

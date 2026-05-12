import { useMemo } from 'react';

const formatVolume = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
    return '—';
  }

  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T BTC`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B BTC`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M BTC`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K BTC`;
  return `${value.toFixed(2)} BTC`;
};

const formatMarkets = (value) => (typeof value === 'number' && value > 0 ? value.toLocaleString() : '—');

const ExchangesTable = ({ exchanges = [], loading, error, noResults, onRetry }) => {
  const tableRows = useMemo(() => exchanges, [exchanges]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
      <div className="px-6 py-5 border-b border-white/10 bg-slate-950/70">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Top Exchanges</h2>
            <p className="text-sm text-slate-400">Live exchange ranking with volume, markets, and trading activity.</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-[0.18em]">
            <tr>
              <th className="w-[40px] px-2 py-3 text-left font-semibold">#</th>
              <th className="w-[220px] px-2 py-3 text-left font-semibold">Name</th>
              <th className="w-[110px] px-2 py-3 text-center font-semibold">Volume 24h</th>
              <th className="w-[110px] px-2 py-3 text-center font-semibold">Volume 7d</th>
              <th className="w-[110px] px-2 py-3 text-center font-semibold">Volume 30d</th>
              <th className="w-[90px] px-2 py-3 text-center font-semibold">No. Markets</th>
              <th className="w-[100px] px-2 py-3 text-center font-semibold">24h Change</th>
              <th className="w-[90px] px-2 py-3 text-center font-semibold">Launched</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-white/10 last:border-b-0">
                  <td className="px-2 py-3"><div className="h-4 w-6 rounded bg-slate-800 mx-auto" /></td>
                  <td className="px-2 py-3 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-800" />
                    <div className="h-3 w-20 rounded bg-slate-800" />
                  </td>
                  <td className="px-2 py-3"><div className="h-4 w-24 rounded bg-slate-800 mx-auto" /></td>
                  <td className="px-2 py-3"><div className="h-4 w-24 rounded bg-slate-800 mx-auto" /></td>
                  <td className="px-2 py-3"><div className="h-4 w-24 rounded bg-slate-800 mx-auto" /></td>
                  <td className="px-2 py-3"><div className="h-4 w-16 rounded bg-slate-800 mx-auto" /></td>
                  <td className="px-2 py-3"><div className="h-4 w-20 rounded bg-slate-800 mx-auto" /></td>
                  <td className="px-2 py-3"><div className="h-4 w-12 rounded bg-slate-800 mx-auto" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-2 py-16">
                  <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-950/85 p-8 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
                    <p className="text-sm uppercase tracking-[0.24em] text-blue-300 mb-3">Unable to load exchanges</p>
                    <p className="text-lg font-semibold text-white mb-4">Something went wrong while fetching exchange data.</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : noResults ? (
              <tr>
                <td colSpan={8} className="px-2 py-16 text-center text-slate-400">
                  No exchanges match your search.
                </td>
              </tr>
            ) : (
              tableRows.map((exchange) => (
                <tr
                  key={exchange.id}
                  className="border-b border-white/10 transition hover:bg-white/5 cursor-pointer"
                  onClick={() => window.open(exchange.url, '_blank', 'noopener,noreferrer')}
                >
                  <td className="px-2 py-3 text-sm font-semibold text-white">{exchange.rank}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="exchange-logo-container-compact">
                        <div className="exchange-logo-fallback-compact">{exchange.name.charAt(0)}</div>
                        {exchange.image ? (
                          <img
                            src={exchange.image}
                            alt={exchange.name}
                            className="exchange-logo-compact"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{exchange.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 truncate">Exchange</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-sm font-semibold text-white">{formatVolume(exchange.volume24h)}</td>
                  <td className="px-2 py-3 text-center text-sm text-slate-300">{formatVolume(exchange.volume7d)}</td>
                  <td className="px-2 py-3 text-center text-sm text-slate-300">{formatVolume(exchange.volume30d)}</td>
                  <td className="px-2 py-3 text-center text-sm text-white">{formatMarkets(exchange.markets)}</td>
                  <td className="px-2 py-3 text-center text-sm">
                    {typeof exchange.change24h === 'number' && !Number.isNaN(exchange.change24h) ? (
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${exchange.change24h >= 0 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'}`}>
                        {exchange.change24h >= 0 ? '+' : ''}{exchange.change24h.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-slate-400">{exchange.founded || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExchangesTable;

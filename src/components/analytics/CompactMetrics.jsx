import React from 'react';
import FearGreedGauge from './FearGreedGauge';

const CompactMetrics = ({ coin, globalData, fearGreed }) => {
  const marketCap = coin?.marketCap ? `$${(coin.marketCap / 1e9).toFixed(1)}B` : '$2.4T';
  const volume = coin?.volume24h ? `$${(coin.volume24h / 1e9).toFixed(1)}B` : '$132B';
  const change24h = coin?.change24h ? `${coin.change24h > 0 ? '+' : ''}${coin.change24h.toFixed(2)}%` : '+2.4%';
  const marketCapRank = coin?.marketCapRank ? `#${coin.marketCapRank}` : '#1';

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Fear & Greed */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Sentiment</p>
        <div className="mt-2 h-16">
          <FearGreedGauge
            value={fearGreed?.value ?? 58}
            category={fearGreed?.classification ?? 'Greed'}
            compact
          />
        </div>
      </div>

      {/* Market Cap */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Market Cap</p>
        <p className="mt-2 truncate text-lg font-semibold text-white">{marketCap}</p>
        <p className="mt-1 text-xs text-slate-400 truncate">Rank {marketCapRank}</p>
      </div>

      {/* 24h Volume */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">24h Volume</p>
        <p className="mt-2 truncate text-lg font-semibold text-white">{volume}</p>
        <p className="mt-1 text-xs text-slate-400 truncate">Trading activity</p>
      </div>

      {/* 24h Change */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">24h Change</p>
        <p
          className={`mt-2 text-lg font-semibold ${
            coin?.change24h > 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {change24h}
        </p>
        <p className="mt-1 text-xs text-slate-400 truncate">Price momentum</p>
      </div>
    </div>
  );
};

export default CompactMetrics;

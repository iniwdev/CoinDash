import React from 'react';

const AnalyticsHero = ({ coin }) => {
  const coinName = coin?.name || 'Bitcoin';
  const coinSymbol = coin?.symbol || 'BTC';
  const currentPrice = coin?.currentPrice ? `$${coin.currentPrice.toLocaleString()}` : '$43,250';
  const change24h = coin?.change24h ? `${coin.change24h > 0 ? '+' : ''}${coin.change24h.toFixed(2)}%` : '+2.4%';

  return (
    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 text-white shadow-sm overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.15),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300/90">Premium Analytics</p>
          <h1 className="mt-1 truncate text-xl font-semibold text-white sm:text-2xl">
            {coinName} ({coinSymbol}) Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Real-time technical analysis, market sentiment, and institutional insights
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          <div className="text-center">
            <p className="text-xs text-slate-400">Current Price</p>
            <p className="mt-1 text-lg font-semibold text-white">{currentPrice}</p>
            <p className={`text-sm ${coin?.change24h > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change24h}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHero;

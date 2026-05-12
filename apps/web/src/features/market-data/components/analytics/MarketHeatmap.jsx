import React from 'react';

const coins = [
  { symbol: 'BTC', name: 'Bitcoin', change: 2.8 },
  { symbol: 'ETH', name: 'Ethereum', change: -1.2 },
  { symbol: 'SOL', name: 'Solana', change: 4.1 },
  { symbol: 'XRP', name: 'XRP', change: -0.8 },
  { symbol: 'ADA', name: 'Cardano', change: 1.7 },
  { symbol: 'DOGE', name: 'Dogecoin', change: -0.4 },
  { symbol: 'AVAX', name: 'Avalanche', change: 3.4 },
  { symbol: 'MATIC', name: 'Polygon', change: 0.9 },
];

const MarketHeatmap = () => (
  <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Market Heatmap</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Market movers at a glance</h2>
      </div>
      <p className="max-w-lg text-sm leading-6 text-slate-400">Live performance overlay across major assets with premium heat mapping and trend bias.</p>
    </div>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {coins.map((coin) => {
        const isUp = coin.change >= 0;
        return (
          <div key={coin.symbol} className={`group rounded-3xl border border-white/10 p-5 transition duration-300 ${isUp ? 'bg-emerald-500/8 hover:bg-emerald-500/12' : 'bg-rose-500/8 hover:bg-rose-500/12'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">{coin.symbol}</p>
                <p className="mt-2 text-lg font-semibold text-white">{coin.name}</p>
              </div>
              <div className={`rounded-2xl px-3 py-2 text-sm font-semibold ${isUp ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                {isUp ? '+' : ''}{coin.change}%
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ width: `${Math.min(100, Math.abs(coin.change) * 10)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default MarketHeatmap;

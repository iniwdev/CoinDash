import React from 'react';

const gaugeColor = (value) => {
  if (value >= 80) return 'from-emerald-400 to-lime-400';
  if (value >= 60) return 'from-sky-400 to-cyan-400';
  if (value >= 40) return 'from-amber-400 to-orange-400';
  if (value >= 20) return 'from-amber-500 to-rose-500';
  return 'from-rose-500 to-fuchsia-500';
};

const FearGreedGauge = ({ value, category, compact = false }) => {
  if (compact) {
    return (
      <div className="h-16">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Fear & Greed</p>
          <p className="text-xs text-slate-400">{category}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gaugeColor(value)} transition-all duration-300`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-white min-w-[2rem] text-right">{value}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Fear & Greed</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{category}</p>
        </div>
        <div className="h-24 w-24 rounded-full bg-white/5 p-2">
          <div className={`relative h-full w-full overflow-hidden rounded-full bg-white/10 bg-gradient-to-r ${gaugeColor(value)}`}>
            <div className="pointer-events-none absolute inset-0 bg-slate-950/95" style={{ clipPath: `polygon(50% 50%, 100% 50%, ${50 + value / 2}% 0%, 50% 0%)` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FearGreedGauge;
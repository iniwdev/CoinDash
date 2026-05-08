import React from 'react';

const CompactTechnicalIndicators = ({ technicalData }) => {
  if (!technicalData) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Technical Indicators</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['RSI', 'MACD', 'SMA', 'EMA'].map((indicator) => (
            <div key={indicator} className="text-center">
              <p className="text-xs text-slate-400">{indicator}</p>
              <p className="text-lg font-semibold text-white">--</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { rsi, macd, sma, ema, volatility, trend } = technicalData;

  const indicators = [
    { label: 'RSI', value: rsi, signal: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral' },
    { label: 'MACD', value: macd > 0 ? `+${macd}` : macd, signal: macd > 0 ? 'Bullish' : 'Bearish' },
    { label: 'SMA', value: sma, signal: 'Support' },
    { label: 'EMA', value: ema, signal: 'Trend' },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Technical Indicators</p>
          <p className="mt-1 text-xs text-slate-400">Real-time calculations from price data</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
          trend === 'Strong Bullish' || trend === 'Bullish' ? 'bg-emerald-500/15 text-emerald-300' :
          trend === 'Bearish' ? 'bg-rose-500/15 text-rose-300' : 'bg-sky-500/15 text-sky-300'
        }`}>
          {trend}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {indicators.map((indicator) => (
          <div key={indicator.label} className="rounded-xl border border-white/5 bg-slate-900/50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{indicator.label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-white">{indicator.value}</p>
            <p className={`mt-1 text-xs ${
              indicator.signal === 'Bullish' || indicator.signal === 'Support' ? 'text-emerald-400' :
              indicator.signal === 'Bearish' ? 'text-rose-400' : 'text-sky-400'
            }`}>
              {indicator.signal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompactTechnicalIndicators;
import React from 'react';

const indicators = [
  { title: 'RSI', signal: 'Neutral', value: '62', description: 'Momentum is stable; range-bound signals are building.' },
  { title: 'EMA', signal: 'Bullish', value: '1,024', description: 'Price above short and mid-term EMA convergence.' },
  { title: 'SMA', signal: 'Bullish', value: '997', description: 'Long-term average supports current trend.' },
  { title: 'Bollinger Bands', signal: 'Volatile', value: '±3.8%', description: 'Widening bands show rising price volatility.' },
  { title: 'MACD', signal: 'Bullish', value: '+0.42', description: 'Positive MACD cross confirms momentum strength.' },
];

const TechnicalIndicators = () => (
  <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Technical Indicators</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Premium trading signals</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-slate-400">Get a consolidated signal feed across RSI, SMA, EMA, Bollinger Bands and MACD for stronger decision-making.</p>
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {indicators.map((indicator) => (
        <div key={indicator.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 hover:border-orange-500/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{indicator.title}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{indicator.value}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${indicator.signal === 'Bullish' ? 'bg-emerald-500/15 text-emerald-300' : indicator.signal === 'Bearish' ? 'bg-rose-500/15 text-rose-300' : 'bg-sky-500/15 text-sky-300'}`}>
              {indicator.signal}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{indicator.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default TechnicalIndicators;

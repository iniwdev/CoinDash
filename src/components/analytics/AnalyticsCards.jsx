import React from 'react';
import FearGreedGauge from './FearGreedGauge';

const metricCards = [
  { title: 'Total Market Cap', value: '$2.44T', short: 'Dominant crypto liquidity', accent: 'from-cyan-500 to-sky-500' },
  { title: 'Global Volume', value: '$132B', short: '24h traded volume', accent: 'from-orange-500 to-amber-400' },
  { title: 'Market Sentiment', value: 'Neutral', short: 'Aggregate trader positioning', accent: 'from-violet-500 to-fuchsia-500' },
  { title: 'AI Insight', value: 'Macro bullish', short: 'Risk-adjusted view', accent: 'from-emerald-400 to-lime-400' },
];

const AnalyticsCards = ({ data }) => {
  const marketCap = data?.global?.total_market_cap ? `$${(data.global.total_market_cap.toFixed(0)).toLocaleString?.() ?? data.global.total_market_cap}` : '$2.44T';
  const volume = data?.global?.total_volume ? `$${(data.global.total_volume.toFixed(0)).toLocaleString?.() ?? data.global.total_volume}` : '$132B';
  const dominance = data?.global?.market_cap_percentage?.btc ? `${data.global.market_cap_percentage.btc.toFixed(1)}%` : '46.2%';
  const sentiment = data?.fearGreed?.value > 60 ? 'Optimistic' : data?.fearGreed?.value > 40 ? 'Neutral' : 'Cautious';

  return (
    <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
      <FearGreedGauge value={data?.fearGreed?.value ?? 58} category={data?.fearGreed?.classification ?? 'Greed'} />
      <div className="grid gap-4 sm:grid-cols-2 xl:col-span-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">BTC Dominance</p>
            <p className="mt-3 text-3xl font-semibold text-white">{dominance}</p>
            <p className="mt-2 text-sm text-slate-400">Share of total crypto market</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total Market Cap</p>
            <p className="mt-3 text-3xl font-semibold text-white">{marketCap}</p>
            <p className="mt-2 text-sm text-slate-400">Global crypto capitalization</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Global Volume</p>
            <p className="mt-3 text-3xl font-semibold text-white">{volume}</p>
            <p className="mt-2 text-sm text-slate-400">24h spot + derivatives</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Market Sentiment</p>
            <p className="mt-3 text-3xl font-semibold text-white">{sentiment}</p>
            <p className="mt-2 text-sm text-slate-400">AI gauge of investor mood</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCards;

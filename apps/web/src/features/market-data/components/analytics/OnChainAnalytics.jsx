import React from 'react';

const stats = [
  { label: 'Active Wallets', value: '12.8M', change: '+4.2%', accent: 'from-sky-500 to-cyan-400' },
  { label: 'Transactions', value: '1.9M', change: '-1.1%', accent: 'from-orange-500 to-amber-400' },
  { label: 'Whale Activity', value: '1,240', change: '+3.8%', accent: 'from-emerald-500 to-lime-400' },
  { label: 'Gas Fees', value: '$18.40', change: '-2.7%', accent: 'from-violet-500 to-fuchsia-500' },
  { label: 'Network Usage', value: '78%', change: '+1.2%', accent: 'from-slate-400 to-slate-300' },
];

const OnChainAnalytics = () => (
  <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">On-Chain Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Network health metrics</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-slate-400">Track wallet activity, transaction flow, whale pressure and network usage in a premium dashboard view.</p>
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)] transition hover:-translate-y-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r ${stat.accent} text-white/90`}>{stat.change}</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-fuchsia-500" style={{ width: '72%' }} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default OnChainAnalytics;

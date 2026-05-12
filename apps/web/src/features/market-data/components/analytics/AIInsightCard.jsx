import React from 'react';

const AIInsightCard = ({ title, probability, support, resistance, sentiment }) => (
  <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)] transition hover:-translate-y-1">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{title}</p>
        <p className="mt-3 text-2xl font-semibold text-white">{sentiment}</p>
      </div>
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(251,146,60,0.18)]">
        {probability}%
      </div>
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-white/5 p-3 text-sm text-slate-300">
        <p className="text-slate-400">Support</p>
        <p className="mt-2 font-semibold text-white">{support}</p>
      </div>
      <div className="rounded-2xl bg-white/5 p-3 text-sm text-slate-300">
        <p className="text-slate-400">Resistance</p>
        <p className="mt-2 font-semibold text-white">{resistance}</p>
      </div>
    </div>

    <p className="mt-5 text-xs uppercase tracking-[0.3em] text-slate-500">Not financial advice</p>
  </div>
);

export default AIInsightCard;

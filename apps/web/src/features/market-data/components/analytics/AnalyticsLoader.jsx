import React from 'react';

const shimmer = 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-[shimmer_1.8s_infinite]';

const AnalyticsLoader = () => (
  <div className="space-y-6">
    <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
      <div className={`h-36 rounded-3xl ${shimmer}`} />
    </div>
    <div className="grid gap-4 xl:grid-cols-4">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className={`h-36 rounded-3xl ${shimmer}`} />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className={`h-60 rounded-[32px] ${shimmer}`} />
      ))}
    </div>
  </div>
);

export default AnalyticsLoader;

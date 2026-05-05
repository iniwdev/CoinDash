import React from 'react';

const FeatureStory = React.memo(() => {
  const features = [
    {
      icon: '📈',
      title: 'Live Market Insights',
      description: 'Track real-time price movements, volume, and momentum with instant market data.',
    },
    {
      icon: '🔒',
      title: 'Secure Portfolio Tracking',
      description: 'Keep your watchlist and holdings private with encrypted sessions.',
    },
    {
      icon: '⚡',
      title: 'Smart Trade Signals',
      description: 'Spot opportunities instantly with clear change indicators and trend analysis.',
    },
  ];

  return (
    <section className="section-spacing bg-background fade-in-section">
      <div className="content-width">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Features */}
          <div>
            <div className="inline-flex rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary mb-8">
              Why CoinDash
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Powerful crypto insights for modern investors
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-lg">
              CoinDash delivers premium market intelligence with intuitive design and live tracking that feels instant.
            </p>

            {/* Feature Blocks */}
            <div className="space-y-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex gap-4 p-6 rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-slate-900/50 hover:shadow-[0_20px_40px_-16px_rgba(247,147,26,0.15)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 flex-shrink-0 text-xl">
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Illustration */}
          <div className="relative">
            {/* Large Dashboard Graphic Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/40 backdrop-blur-sm p-8 overflow-hidden">
              {/* Decorative gradients */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">Dashboard Preview</p>
                    <h3 className="text-2xl font-bold text-white mt-3">Portfolio Overview</h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">Live</span>
                  </div>
                </div>

                {/* Main Stats Card */}
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-500 mb-2">Total Portfolio Value</p>
                  <p className="text-3xl font-bold text-white mb-4">$124,892</p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 h-12 bg-gradient-to-t from-primary/30 to-primary rounded-lg" />
                    <div className="flex-1 h-8 bg-gradient-to-t from-primary/20 to-primary/40 rounded-lg" />
                    <div className="flex-1 h-10 bg-gradient-to-t from-primary/25 to-primary/35 rounded-lg" />
                    <div className="flex-1 h-6 bg-gradient-to-t from-primary/15 to-primary/25 rounded-lg" />
                    <div className="flex-1 h-11 bg-gradient-to-t from-primary/28 to-primary/38 rounded-lg" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">7 Day Performance</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      ↑ +4.2%
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-500 mb-2">Bitcoin Dominance</p>
                    <p className="text-xl font-bold text-white">43.8%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-500 mb-2">Daily Volume</p>
                    <p className="text-xl font-bold text-white">$32.7B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FeatureStory;
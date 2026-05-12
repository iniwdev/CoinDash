const StatsCards = ({ stats }) => {
  const formatValue = (value) => {
    if (value === null || value === undefined || Number.isNaN(value) || value === 0) {
      return '$0';
    }

    const num = Number(value);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;

    return `$${num.toLocaleString()}`;
  };

  const formatChange = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '—';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const statusColor = (value) =>
    typeof value === 'number' && !Number.isNaN(value) && value >= 0 ? 'text-emerald-400' : 'text-rose-400';

  const cards = [
    {
      title: 'Market Cap',
      amount: formatValue(stats.marketCap),
      change: stats.marketCapChange,
    },
    {
      title: '24h Volume',
      amount: formatValue(stats.volume24h),
      change: stats.volumeChange,
    },
    {
      title: 'BTC Dominance',
      amount: `${stats.btcDominance.toFixed(1)}%`,
      change: stats.btcDominanceChange,
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-3 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl px-6 py-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.85)]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {card.title}
            </span>
            <span className={`text-sm font-semibold ${statusColor(card.change)}`}>
              {formatChange(card.change)}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-semibold text-white">{card.amount}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

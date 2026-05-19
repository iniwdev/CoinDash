import { motion } from 'framer-motion';

export default function PortfolioSummary({ summary, isLoading }) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
        ))}
      </div>
    );
  }

  const totalValue = Number(summary.total_value);
  const totalInvested = Number(summary.total_invested);
  const totalPnL = Number(summary.total_pnl);
  const pnlPct = Number(summary.total_pnl_pct);
  const isProfit = totalPnL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-lg"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-2">Total Balance</p>
        <h2 className="text-4xl font-bold text-white tracking-tight">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-lg relative overflow-hidden"
      >
        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-2 relative z-10">Unrealized P&L</p>
        <div className="flex items-baseline gap-3 relative z-10">
          <h2 className={`text-3xl font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className={`px-2 py-1 rounded text-sm font-medium ${isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
          </span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-lg"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-2">Total Invested</p>
        <h2 className="text-3xl font-semibold text-slate-300">
          ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
      </motion.div>
    </div>
  );
}

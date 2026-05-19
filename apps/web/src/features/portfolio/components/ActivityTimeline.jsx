import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/store/portfolioStore';

// Map raw transaction fields to display metadata
function getEventMeta(txn) {
  const isBuy = txn.type === 'BUY';
  const qty = Number(txn.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 });
  const symbol = txn.coin_symbol?.toUpperCase() || '???';
  const price = Number(txn.price_per_unit).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  return {
    id: txn.id,
    title: isBuy ? `Bought ${qty} ${symbol}` : `Sold ${qty} ${symbol}`,
    desc: `Executed at ${price} via Smart Router.`,
    time: formatRelativeTime(txn.created_at),
    icon: isBuy ? '💸' : '📤',
    color: isBuy ? 'text-emerald-400' : 'text-rose-400',
    bg: isBuy ? 'bg-emerald-500/20' : 'bg-rose-500/20',
    border: isBuy ? 'border-emerald-500/30' : 'border-rose-500/30',
  };
}

function formatRelativeTime(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

// Static AI/market events shown above the real transactions for visual richness
const SYSTEM_EVENTS = [
  {
    id: 'sys_alert',
    title: 'AI Alert Triggered',
    desc: 'Unusual volume detected on Solana.',
    time: 'Now',
    icon: '✨',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-500/30',
  },
];

export default function ActivityTimeline() {
  const { transactions, isLoading } = usePortfolioStore();

  // Combine system events with real backend transactions
  const txnEvents = (transactions || []).map(getEventMeta);
  const events = [...SYSTEM_EVENTS, ...txnEvents];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] p-6 flex-1 flex flex-col transition-all duration-700 hover:bg-[#0A0E17]/80 hover:border-white/[0.05]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#7C879C] uppercase">Live Activity Feed</h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
        </span>
      </div>

      <div className="relative flex-1">
        {/* Vertical timeline line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

        {isLoading ? (
          <div className="space-y-6 pl-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-28 bg-white/10 rounded mb-2" />
                <div className="h-2 w-40 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 relative">
            {events.length === 0 ? (
              <div className="pl-12 text-[11px] text-[#64748B] font-medium">No recent activity.</div>
            ) : (
              events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.08 }}
                  className="flex gap-4 group cursor-pointer relative"
                >
                  {/* Timeline node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${event.bg} ${event.border} border flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110`}>
                      <span className="text-[12px]">{event.icon}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-[12px] font-bold tracking-wide ${event.color} drop-shadow-sm transition-colors duration-300 group-hover:text-white truncate`}>
                        {event.title}
                      </p>
                      <span className="text-[9px] font-bold tracking-widest text-[#475569] uppercase whitespace-nowrap flex-shrink-0">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] font-medium leading-relaxed group-hover:text-[#94A3B8] transition-colors duration-300 truncate">
                      {event.desc}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.05] text-center">
        <button className="text-[10px] font-bold text-[#64748B] hover:text-white uppercase tracking-widest transition-colors">
          View Full Ledger
        </button>
      </div>
    </motion.div>
  );
}

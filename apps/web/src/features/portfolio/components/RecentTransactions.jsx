import { motion } from 'framer-motion';
import dayjs from 'dayjs';

export default function RecentTransactions({ transactions }) {
  return (
    <div className="h-full rounded-2xl bg-[#0A0E17]/80 backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] p-6 flex flex-col transition-all duration-500 hover:bg-[#0A0E17]/90 hover:border-white/[0.08] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_16px_48px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase">Recent Transactions</h3>
        <button className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-transparent hover:bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] text-[#94A3B8] hover:text-white rounded-lg transition-all">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 mt-2 pr-2">
        {(!transactions || transactions.length === 0) ? (
          <div className="h-full flex items-center justify-center text-[#64748B] text-[10px] font-bold uppercase tracking-widest">
            No recent transactions
          </div>
        ) : (
          transactions.slice(0, 5).map((tx, i) => {
            const isBuy = tx.type === 'BUY';
            const date = dayjs(tx.executed_at).format('MMM DD, YYYY • hh:mm A');
            const qtyStr = `${isBuy ? '+' : '-'}${Number(tx.quantity).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${tx.coin_symbol}`;
            const totalValue = Number(tx.quantity) * Number(tx.price_per_unit);
            const valueStr = `${isBuy ? '-' : '+'}$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            return (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-[0_2px_8px_rgba(0,0,0,0.2)] ring-1 ring-white/10 ${isBuy ? 'bg-[#F97316]/10 text-[#F97316] drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-[#E11D48]/10 text-[#E11D48] drop-shadow-[0_0_8px_rgba(225,29,72,0.3)]'}`}>
                    {tx.coin_symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white tracking-wide">
                      {isBuy ? 'Buy' : 'Sell'} {tx.coin_id.charAt(0).toUpperCase() + tx.coin_id.slice(1)}
                    </p>
                    <p className="text-[10px] text-[#64748B] font-semibold tracking-wide mt-0.5">{date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[12px] font-bold tracking-wide ${isBuy ? 'text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-white drop-shadow-sm'}`}>
                    {qtyStr}
                  </p>
                  <p className="text-[10px] text-[#64748B] font-semibold tracking-wide mt-0.5">{valueStr}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.05]">
        <button className="w-full py-2.5 bg-transparent hover:bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] text-[#94A3B8] hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all">
          View All Transactions
        </button>
      </div>
    </div>
  );
}

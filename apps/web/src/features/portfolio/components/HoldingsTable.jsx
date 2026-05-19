import { usePortfolioStore } from '@/store/portfolioStore';
import { motion } from 'framer-motion';

export default function HoldingsTable({ holdings, isLoading }) {
  const { openTradeModal } = usePortfolioStore();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-xl animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-8 text-center shadow-xl">
        <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💰</span>
        </div>
        <h3 className="text-xl text-white font-semibold mb-2">No Holdings Yet</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Your portfolio is empty. Execute your first trade to start tracking your assets.
        </p>
        <button
          onClick={() => openTradeModal(null, 'BUY')}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-slate-950 font-bold hover:scale-105 transition-transform"
        >
          Buy Crypto
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden shadow-xl">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Your Assets</h3>
        <button
          onClick={() => openTradeModal(null, 'BUY')}
          className="text-sm px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          + New Trade
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
              <th className="p-4 font-medium">Asset</th>
              <th className="p-4 font-medium text-right">Balance</th>
              <th className="p-4 font-medium text-right">Price</th>
              <th className="p-4 font-medium text-right">Avg Cost</th>
              <th className="p-4 font-medium text-right">Unrealized PnL</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {holdings.map((h, i) => {
              const pnlValue = Number(h.unrealized_pnl);
              const pnlPct = Number(h.unrealized_pnl_pct);
              const isProfit = pnlValue >= 0;
              
              return (
                <motion.tr 
                  key={h.coin_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 group transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs uppercase">
                        {h.coin_symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{h.coin_id.charAt(0).toUpperCase() + h.coin_id.slice(1)}</div>
                        <div className="text-slate-400 text-xs">{h.coin_symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-white font-medium">{Number(h.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                    <div className="text-slate-400 text-xs">${Number(h.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </td>
                  <td className="p-4 text-right text-white">
                    ${Number(h.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="p-4 text-right text-slate-300">
                    ${Number(h.avg_cost_basis).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-medium ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${Math.abs(pnlValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs ${isProfit ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                      {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openTradeModal(h.coin_id, 'BUY')}
                        className="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-medium transition-colors"
                      >
                        Buy
                      </button>
                      <button 
                        onClick={() => openTradeModal(h.coin_id, 'SELL')}
                        className="px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded text-xs font-medium transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

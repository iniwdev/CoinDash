import { usePortfolioStore } from '@/store/portfolioStore';
import { motion } from 'framer-motion';
import { useState } from 'react';
import MiniSparkline from './MiniSparkline';
import { useAi } from '@/context/AiContext';

export default function HoldingsTable({ holdings, isLoading }) {
  const { openTradeModal } = usePortfolioStore();
  const { openAiModal } = useAi();
  const [searchTerm, setSearchTerm] = useState('');
  const [hideSmall, setHideSmall] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#0A0E17]/80 backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] p-6 animate-pulse h-full">
        <div className="h-6 w-48 bg-white/5 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  let filteredHoldings = holdings || [];
  
  if (hideSmall) {
    filteredHoldings = filteredHoldings.filter(h => Number(h.current_value) > 1);
  }
  
  if (searchTerm) {
    filteredHoldings = filteredHoldings.filter(h => 
      h.coin_symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.coin_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] flex flex-col h-full transition-all duration-700 hover:bg-[#0A0E17]/80 hover:border-white/[0.05]">
      
      {/* Table Header Controls */}
      <div className="p-6 lg:px-8 border-b border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center rounded-t-[2rem] relative z-10 bg-white/[0.01] gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h3 className="text-[14px] font-bold tracking-widest text-white drop-shadow-sm uppercase">Terminal Holdings</h3>
            <span className="bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase">Hide Small Dust</span>
            <button 
              onClick={() => setHideSmall(!hideSmall)}
              className={`w-7 h-4 rounded-full flex items-center transition-colors px-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] ${hideSmall ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'bg-[#1E293B]'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform shadow-md ${hideSmall ? 'translate-x-3' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search asset matrix..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#05070A]/80 border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] rounded-xl py-2 pl-9 pr-4 text-[11px] font-bold tracking-widest text-white placeholder-[#475569] focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] w-56 transition-all uppercase"
          />
        </div>
      </div>
      
      {/* Table Content — scroll only within the card, never the whole page */}
      <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-transparent text-[10px] uppercase tracking-[0.2em] text-[#475569] border-b border-white/[0.05]">
              <th className="p-5 font-bold pl-8">Asset</th>
              <th className="p-5 font-bold text-right">Holdings</th>
              <th className="p-5 font-bold text-right">Price</th>
              <th className="p-5 font-bold text-right">24h Change</th>
              <th className="p-5 font-bold text-right">Avg Cost</th>
              <th className="p-5 font-bold text-right">Current Value</th>
              <th className="p-5 font-bold text-right">Unrealized P&L</th>
              <th className="p-5 font-bold text-center">Alloc %</th>
              <th className="p-5 font-bold text-center">Trend (7D)</th>
              <th className="p-5 font-bold text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {filteredHoldings.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl mb-4 opacity-50">📂</span>
                    <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-widest">No assets found in current matrix</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHoldings.map((h, i) => {
                const pnlValue = Number(h.unrealized_pnl);
                const pnlPct = Number(h.unrealized_pnl_pct);
                const isProfit = pnlValue >= 0;
                const allocationStr = Number(h.allocation_pct).toFixed(2);
                const isExpanded = expandedRow === h.coin_id;
                
                return (
                  <motion.tr 
                    key={h.coin_id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    onClick={() => setExpandedRow(isExpanded ? null : h.coin_id)}
                    className="hover:bg-white/[0.015] transition-all duration-300 group cursor-pointer"
                  >
                    <td className="p-5 pl-8 relative">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 flex items-center justify-center text-white font-bold text-sm uppercase shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:border-violet-500/30 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all">
                          {h.coin_symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-white tracking-wide group-hover:text-violet-200 transition-colors">{h.coin_id.charAt(0).toUpperCase() + h.coin_id.slice(1)}</div>
                          <div className="text-[11px] text-[#64748B] font-bold tracking-widest mt-0.5 uppercase">{h.coin_symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="text-[14px] font-bold text-white tracking-wide font-mono">{Number(h.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="text-[14px] font-bold text-white tracking-wide font-mono drop-shadow-sm">
                        ${Number(h.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="inline-flex items-center gap-1 text-[12px] font-bold tracking-widest text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-md border border-[#10B981]/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        ↗ 2.35%
                      </div>
                    </td>
                    <td className="p-5 text-right text-[13px] font-bold text-[#64748B] tracking-wide font-mono">
                      ${Number(h.avg_cost_basis).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 text-right text-[15px] text-white font-bold tracking-wide drop-shadow-md font-mono">
                      ${Number(h.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 text-right">
                      <div className={`text-[14px] font-bold tracking-wide font-mono ${isProfit ? 'text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-[#E11D48] drop-shadow-[0_0_10px_rgba(225,29,72,0.4)]'}`}>
                        {isProfit ? '+' : '-'}${Math.abs(pnlValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[11px] font-bold tracking-widest mt-1 ${isProfit ? 'text-[#10B981]/80' : 'text-[#E11D48]/80'}`}>
                        {pnlPct.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-5 text-center w-32">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-[12px] text-white font-bold tracking-wide font-mono mb-2">{allocationStr}%</div>
                        <div className="w-full h-1.5 bg-[#05070A] rounded-full overflow-hidden border border-white/[0.05]">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.8)] relative" style={{ width: `${allocationStr}%` }}>
                            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center items-center">
                        <MiniSparkline isProfit={isProfit} />
                      </div>
                    </td>
                    <td className="p-5 pr-8">
                      <div className="flex items-center justify-end gap-3 opacity-100 sm:opacity-20 sm:group-hover:opacity-100 transition-opacity duration-300">
                        {/* AI Analyze Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); openAiModal(); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-fuchsia-400 hover:bg-violet-500/30 hover:border-fuchsia-500/50 hover:shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all"
                          title="AI Analyze Asset"
                        >
                          <span className="text-sm drop-shadow-[0_0_5px_currentColor]">✨</span>
                        </button>
                        
                        {/* Trade Actions */}
                        <div className="flex rounded-lg bg-[#05070A] border border-white/[0.05] overflow-hidden">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openTradeModal(h.coin_id, 'BUY'); }}
                            className="px-4 py-2 hover:bg-emerald-500/10 text-[#64748B] hover:text-emerald-400 text-[10px] font-bold tracking-widest uppercase transition-all border-r border-white/[0.05]"
                          >
                            Buy
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openTradeModal(h.coin_id, 'SELL'); }}
                            className="px-4 py-2 hover:bg-rose-500/10 text-[#64748B] hover:text-rose-400 text-[10px] font-bold tracking-widest uppercase transition-all"
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Add Assets */}
      {!hideSmall && filteredHoldings.length > 0 && (
        <div className="mt-auto border-t border-white/[0.05] p-5 flex justify-center bg-white/[0.01] rounded-b-[2rem] hover:bg-white/[0.02] transition-colors cursor-pointer group">
          <button className="text-[11px] font-bold text-[#64748B] group-hover:text-white flex items-center gap-2 transition-colors uppercase tracking-[0.2em]">
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">+</span>
            Expand Portfolio Matrix
          </button>
        </div>
      )}
    </div>
  );
}

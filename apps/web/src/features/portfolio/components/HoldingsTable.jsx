import { usePortfolioStore } from '@/store/portfolioStore';
import { motion } from 'framer-motion';
import { useState } from 'react';
import MiniSparkline from './MiniSparkline';

// Deterministic vibrant gradient color per coin symbol
const COIN_COLORS = {
  BTC:  ['#F7931A', '#E8750A'],
  ETH:  ['#627EEA', '#3C5EC7'],
  SOL:  ['#9945FF', '#7B2FD4'],
  BNB:  ['#F3BA2F', '#D4A020'],
  XRP:  ['#346AA9', '#1E4E8C'],
  ADA:  ['#0D83C2', '#0065A0'],
  DOGE: ['#C2A633', '#A88D20'],
  AVAX: ['#E84142', '#C42B2C'],
  DOT:  ['#E6007A', '#B5005F'],
  MATIC:['#8247E5', '#6030C0'],
  LINK: ['#2A5ADA', '#1A3DBB'],
  UNI:  ['#FF007A', '#D4005F'],
  LTC:  ['#BFBBBB', '#8E8A8A'],
  ATOM: ['#6F7390', '#4A4D72'],
  NEAR: ['#00C08B', '#009A70'],
  ARB:  ['#12AAFF', '#0090D4'],
  OP:   ['#FF0420', '#D40018'],
  PEPE: ['#16A34A', '#15803D'],
};

function coinColor(symbol) {
  const s = symbol?.toUpperCase();
  if (COIN_COLORS[s]) return COIN_COLORS[s][0];
  let hash = 0;
  for (let i = 0; i < (s?.length || 0); i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

function coinColorDark(symbol) {
  const s = symbol?.toUpperCase();
  if (COIN_COLORS[s]) return COIN_COLORS[s][1];
  let hash = 0;
  for (let i = 0; i < (s?.length || 0); i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 38%)`;
}


export default function HoldingsTable({ holdings, isLoading }) {
  const { openTradeModal } = usePortfolioStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [hideSmall, setHideSmall] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl"></div>
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
    <div className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] flex flex-col transition-all duration-700 hover:bg-[#0A0E17]/80 hover:border-white/[0.05]">

      {/* ── Header controls ────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/[0.01] rounded-t-[2rem]">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold tracking-widest text-white uppercase">Terminal Holdings</h3>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase hidden sm:block">Hide Dust</span>
            <button
              onClick={() => setHideSmall(!hideSmall)}
              className={`w-7 h-4 rounded-full flex items-center px-0.5 transition-colors ${hideSmall ? 'bg-violet-600' : 'bg-[#1E293B]'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white shadow-md transition-transform ${hideSmall ? 'translate-x-3' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="relative">
          <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#05070A]/80 border border-white/[0.05] rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-medium text-white placeholder-[#475569] focus:outline-none focus:border-violet-500/40 w-40 transition-all"
          />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────
          Key layout engineering decisions:
          1. overflow-x-auto is on this wrapper, not the page — contains scroll
          2. table-fixed + explicit col widths via colgroup prevent auto-sizing blowout
          3. p-3 instead of p-5 on tds — saves ~80px of horizontal padding across 10 cols
          4. whitespace-nowrap on financial cells prevents line-wrapping blowout
          5. min-w-[780px] is low enough to fit the 9-col left canvas at 1280px
      ──────────────────────────────────────────────────────────── */}
      <div
        className="overflow-x-auto w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <table className="w-full text-left border-collapse min-w-[820px] table-fixed">
          <colgroup>
            <col style={{ width: '20%' }} /> {/* Asset */}
            <col style={{ width: '9%' }}  /> {/* Holdings */}
            <col style={{ width: '11%' }} /> {/* Price */}
            <col style={{ width: '8%' }}  /> {/* 24h */}
            <col style={{ width: '10%' }} /> {/* Avg Cost */}
            <col style={{ width: '11%' }} /> {/* Value */}
            <col style={{ width: '11%' }} /> {/* P&L */}
            <col style={{ width: '9%' }}  /> {/* Alloc */}
            <col style={{ width: '6%' }}  /> {/* Trend */}
            <col style={{ width: '5%' }}  /> {/* Actions */}
          </colgroup>
          <thead>
            <tr className="text-[9px] uppercase tracking-[0.18em] text-[#475569] border-b border-white/[0.05]">
              <th className="px-4 py-3 font-bold text-left pl-6">Asset</th>
              <th className="px-3 py-3 font-bold text-right">Holdings</th>
              <th className="px-3 py-3 font-bold text-right">Price</th>
              <th className="px-3 py-3 font-bold text-right">24h</th>
              <th className="px-3 py-3 font-bold text-right">Avg Cost</th>
              <th className="px-3 py-3 font-bold text-right">Value</th>
              <th className="px-3 py-3 font-bold text-right">P&L</th>
              <th className="px-3 py-3 font-bold text-center">Alloc</th>
              <th className="px-3 py-3 font-bold text-center">Trend</th>
              <th className="px-4 py-3 font-bold text-center pr-6">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.025]">
            {filteredHoldings.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-16 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl mb-3 opacity-40">📂</span>
                    <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest">No assets in portfolio</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHoldings.map((h, i) => {
                const pnlValue = Number(h.unrealized_pnl);
                const pnlPct = Number(h.unrealized_pnl_pct);
                const isProfit = pnlValue >= 0;
                const allocationPct = Number(h.allocation_pct);
                const allocationStr = allocationPct.toFixed(1);

                return (
                  <motion.tr
                    key={h.coin_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                    className="hover:bg-white/[0.015] transition-colors duration-200 group"
                  >
                    {/* Asset — coin avatar + name/symbol */}
                    <td className="px-4 py-3.5 pl-6">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Coin avatar: vibrant gradient circle with initial */}
                        <div
                          className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-white font-black text-[13px] uppercase shadow-lg ring-1 ring-white/10"
                          style={{
                            background: `linear-gradient(135deg, ${coinColor(h.coin_symbol)} 0%, ${coinColorDark(h.coin_symbol)} 100%)`,
                            boxShadow: `0 4px 14px ${coinColor(h.coin_symbol)}55`,
                          }}
                        >
                          {h.coin_symbol.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-white truncate leading-tight group-hover:text-violet-200 transition-colors">
                            {h.coin_id.charAt(0).toUpperCase() + h.coin_id.slice(1)}
                          </div>
                          <div className="text-[10px] text-[#64748B] font-bold tracking-widest uppercase mt-0.5">{h.coin_symbol}</div>
                        </div>
                      </div>
                    </td>

                    {/* Holdings qty */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="text-[12px] font-bold text-white font-mono">
                        {Number(h.quantity).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="text-[12px] font-bold text-white font-mono">
                        ${Number(h.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* 24h change */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className="text-[11px] font-bold text-[#10B981]">↗ 2.35%</span>
                    </td>

                    {/* Avg cost */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className="text-[12px] font-bold text-[#64748B] font-mono">
                        ${Number(h.avg_cost_basis).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Current value */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className="text-[13px] font-bold text-white font-mono">
                        ${Number(h.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* P&L */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className={`text-[12px] font-bold font-mono ${isProfit ? 'text-[#10B981]' : 'text-[#E11D48]'}`}>
                        {isProfit ? '+' : '-'}${Math.abs(pnlValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] font-bold mt-0.5 ${isProfit ? 'text-[#10B981]/70' : 'text-[#E11D48]/70'}`}>
                        {pnlPct.toFixed(2)}%
                      </div>
                    </td>

                    {/* Allocation bar */}
                    <td className="px-3 py-3 text-center">
                      <div className="text-[11px] text-white font-bold font-mono mb-1.5">{allocationStr}%</div>
                      <div className="w-full h-1 bg-[#05070A] rounded-full overflow-hidden mx-auto max-w-[48px]">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          style={{ width: `${Math.min(allocationPct, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Sparkline */}
                    <td className="px-3 py-3.5 text-center">
                      <div className="flex justify-center">
                        <MiniSparkline isProfit={isProfit} />
                      </div>
                    </td>

                    {/* Actions — always visible, right-padded to breathe */}
                    <td className="px-4 py-3.5 pr-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openTradeModal(h.coin_id, 'BUY'); }}
                          className="px-2.5 py-1 rounded-md text-[9px] font-bold text-emerald-400 bg-emerald-500/[0.08] hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all uppercase tracking-wider"
                        >
                          B
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openTradeModal(h.coin_id, 'SELL'); }}
                          className="px-2.5 py-1 rounded-md text-[9px] font-bold text-rose-400 bg-rose-500/[0.08] hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all uppercase tracking-wider"
                        >
                          S
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredHoldings.length > 0 && (
        <div className="border-t border-white/[0.05] px-6 py-3 flex justify-center bg-white/[0.01] rounded-b-[2rem]">
          <button className="text-[10px] font-bold text-[#64748B] hover:text-white flex items-center gap-2 transition-colors uppercase tracking-[0.15em]">
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">+</span>
            View Full Portfolio
          </button>
        </div>
      )}
    </div>
  );
}

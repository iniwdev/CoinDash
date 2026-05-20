import { usePortfolioStore } from '@/store/portfolioStore';
import { useAi } from '@/context/AiContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import MiniSparkline from './MiniSparkline';
import { usePriceTick, useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { Brain, Sparkles, TrendingUp, TrendingDown, Activity } from 'lucide-react';

// ─── Coin colour palette ────────────────────────────────────────────────────
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

// ─── Number formatters ──────────────────────────────────────────────────────
// Abbreviates large dollar amounts so they NEVER overflow a column.
// $1,234        → $1,234
// $12,345       → $12.3K
// $1,234,567    → $1.23M
// $12,345,678   → $12.3M
// $1,234,567,890 → $1.23B
function fmtUSD(value) {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e4) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// For live price — show full precision up to 4dp, no abbreviation needed (prices rarely exceed $100K)
function fmtPrice(value) {
  if (!value && value !== 0) return '$0.00';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

// ─── LiveTableRow ───────────────────────────────────────────────────────────
function LiveTableRow({ holding, index, openTradeModal, openAiModal }) {
  const basePrice    = Number(holding.current_price);
  const qty          = Number(holding.quantity);
  const avgCost      = Number(holding.avg_cost_basis);
  const allocationPct = Number(holding.allocation_pct);
  const cColor       = coinColor(holding.coin_symbol);

  const tickInterval = 2000 + index * 400;
  const { value: livePrice, direction } = usePriceTick(basePrice, tickInterval, 0.0015);

  const liveValue  = livePrice * qty;
  const livePnL    = liveValue - avgCost * qty;
  const livePnLPct = avgCost > 0
    ? (livePnL / (avgCost * qty)) * 100
    : Number(holding.unrealized_pnl_pct);
  const isProfit   = livePnL >= 0;

  const animValue  = useAnimatedCounter(liveValue, 800, 2);
  const animPnL    = useAnimatedCounter(livePnL, 800, 2);
  const animPnLPct = useAnimatedCounter(livePnLPct, 800, 2);

  const coinName = holding.coin_name
    || (holding.coin_id.charAt(0).toUpperCase() + holding.coin_id.slice(1));

  const [sparklineData, setSparklineData] = useState(() =>
    Array.from({ length: 15 }).map(() => ({ value: basePrice * (1 + (Math.random() - 0.5) * 0.02) }))
  );

  useEffect(() => {
    setSparklineData(prev => [...prev.slice(1), { value: livePrice }]);
  }, [livePrice]);

  // Tick flash colours
  const tickUp   = direction === 'up';
  const tickDown = direction === 'down';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group relative cursor-default border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.025]"
    >
      {/* Tick flash overlay — uses a real td so HTML stays valid */}
      <td
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 transition-colors duration-700"
        style={{
          backgroundColor: tickUp
            ? 'rgba(16,185,129,0.04)'
            : tickDown
            ? 'rgba(225,29,72,0.04)'
            : 'transparent',
        }}
      />

      {/* ── ASSET (24%) ──────────────────────────────────────────────────── */}
      <td className="pl-6 pr-3 py-4 align-middle relative z-10">
        <div className="flex items-center gap-3">
          {/* Circular logo */}
          <div
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-black text-[14px] uppercase ring-1 ring-white/10 relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${cColor} 0%, ${coinColorDark(holding.coin_symbol)} 100%)`,
              boxShadow: `0 3px 12px ${cColor}35`,
            }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {holding.coin_symbol.charAt(0)}
          </div>

          {/* Name + symbol stacked */}
          <div className="flex flex-col justify-center" style={{ gap: '3px' }}>
            <span className="text-[13px] font-bold text-white leading-none whitespace-nowrap group-hover:text-violet-200 transition-colors duration-200">
              {coinName}
            </span>
            <span className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase leading-none flex items-center gap-1">
              {holding.coin_symbol}
              {tickUp   && <TrendingUp   size={9} className="text-emerald-400 animate-pulse" />}
              {tickDown && <TrendingDown size={9} className="text-rose-400 animate-pulse" />}
            </span>
          </div>
        </div>
      </td>

      {/* ── HOLDINGS (8%) ─────────────────────────────────────────────────── */}
      <td className="px-3 py-4 align-middle text-right relative z-10">
        <span className="text-[12px] font-bold text-white tabular-nums font-mono leading-none">
          {qty.toLocaleString('en-US', { maximumFractionDigits: 4 })}
        </span>
      </td>

      {/* ── LIVE PRICE (12%) ─────────────────────────────────────────────── */}
      <td className="px-3 py-4 align-middle text-right relative z-10">
        <motion.span
          key={`price-${holding.coin_id}-${Math.round(livePrice)}`}
          initial={
            direction !== 'flat'
              ? { color: tickUp ? '#10B981' : '#E11D48' }
              : {}
          }
          animate={{ color: '#ffffff' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="text-[13px] font-bold tabular-nums font-mono leading-none whitespace-nowrap"
        >
          {fmtPrice(livePrice)}
        </motion.span>
      </td>

      {/* ── 24H CHANGE (10%) ─────────────────────────────────────────────── */}
      <td className="px-3 py-4 align-middle text-right relative z-10">
        <div className={`flex items-center justify-end gap-0.5 text-[12px] font-bold leading-none tabular-nums font-mono ${isProfit ? 'text-[#10B981]' : 'text-[#E11D48]'}`}>
          <motion.span
            animate={{ y: tickUp ? -1 : tickDown ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
            className="text-[11px]"
          >
            {isProfit ? '↗' : '↘'}
          </motion.span>
          <span>{Math.abs(Number(holding.unrealized_pnl_pct)).toFixed(2)}%</span>
        </div>
      </td>

      {/* ── AVG COST (12%) ─────────────────────────────────────────────────
          Uses fmtUSD so large avg cost values never overflow their column.
      ──────────────────────────────────────────────────────────────────── */}
      <td className="px-3 py-4 align-middle text-right relative z-10">
        <span className="text-[12px] font-bold text-[#64748B] tabular-nums font-mono leading-none">
          {fmtUSD(avgCost)}
        </span>
      </td>

      {/* ── VALUE (12%) ──────────────────────────────────────────────────── */}
      <td className="px-3 py-4 align-middle text-right relative z-10">
        <span className="text-[13px] font-bold text-white tabular-nums font-mono leading-none">
          {fmtUSD(animValue)}
        </span>
      </td>

      {/* ── P&L (12%) ──────────────────────────────────────────────────────
          Two-line cell: abbreviated dollar value + percentage sub-line.
      ──────────────────────────────────────────────────────────────────── */}
      <td className="px-3 py-4 align-middle text-right relative z-10">
        <div className="flex flex-col items-end justify-center" style={{ gap: '4px' }}>
          <span className={`text-[13px] font-bold tabular-nums font-mono leading-none ${isProfit ? 'text-[#10B981]' : 'text-[#E11D48]'}`}>
            {isProfit ? '+' : '–'}{fmtUSD(Math.abs(animPnL))}
          </span>
          <span className={`text-[10px] font-bold tabular-nums font-mono leading-none ${isProfit ? 'text-[#10B981]/65' : 'text-[#E11D48]/65'}`}>
            {animPnLPct.toFixed(2)}%
          </span>
        </div>
      </td>

      {/* ── ALLOCATION (8%) ──────────────────────────────────────────────── */}
      <td className="px-3 py-4 align-middle text-center relative z-10">
        <div className="flex flex-col items-center justify-center" style={{ gap: '5px' }}>
          <span className="text-[11px] text-white font-bold tabular-nums font-mono leading-none">
            {allocationPct.toFixed(1)}%
          </span>
          <div className="w-10 h-1.5 bg-[#05070A] rounded-full overflow-hidden ring-1 ring-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${cColor}, ${coinColorDark(holding.coin_symbol)})` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(allocationPct, 100)}%` }}
              transition={{ duration: 1.2, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
        </div>
      </td>

      {/* ── TREND SPARKLINE (7%) ─────────────────────────────────────────── */}
      <td className="px-2 py-4 align-middle text-center relative z-10">
        <div className="flex justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen">
          <MiniSparkline data={sparklineData} isProfit={isProfit} />
        </div>
      </td>

      {/* ── ACTIONS (7%) ─────────────────────────────────────────────────── */}
      <td className="pl-2 pr-5 py-4 align-middle text-center relative z-10">
        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
          <button
            onClick={(e) => { e.stopPropagation(); openAiModal(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-400 bg-violet-500/[0.08] hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/50 hover:shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-all"
            title="AI Analysis"
          >
            <Brain size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openTradeModal(holding.coin_id, 'BUY'); }}
            className="w-7 h-7 rounded-lg text-[10px] font-bold text-emerald-400 bg-emerald-500/[0.08] hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center"
          >
            B
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openTradeModal(holding.coin_id, 'SELL'); }}
            className="w-7 h-7 rounded-lg text-[10px] font-bold text-rose-400 bg-rose-500/[0.08] hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all flex items-center justify-center"
          >
            S
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function EnhancedHoldingsTableV2({ holdings, isLoading }) {
  const { openTradeModal } = usePortfolioStore();
  const aiCtx = useAi();
  const openAiModal = aiCtx?.openAiModal ?? (() => {});

  const [searchTerm, setSearchTerm]   = useState('');
  const [hideSmall, setHideSmall]     = useState(false);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center mb-6">
          <div className="shimmer h-5 w-44 rounded" />
          <div className="shimmer h-7 w-28 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer h-14 rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  // ── Filtering ───────────────────────────────────────────────────────────
  let filtered = holdings || [];
  if (hideSmall)   filtered = filtered.filter(h => Number(h.current_value) > 1);
  if (searchTerm)  filtered = filtered.filter(h =>
    h.coin_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.coin_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Column layout (must sum to 100%) ──────────────────────────────────
  // Asset 22 | Holdings 8 | Price 12 | 24H 9 | AvgCost 11 | Value 11 | PnL 11 | Alloc 8 | Trend 4 | Actions 4
  const COLS = [22, 8, 12, 9, 11, 11, 11, 8, 4, 4];

  return (
    <div className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] flex flex-col transition-all duration-700 hover:bg-[#0A0E17]/80 hover:border-white/[0.05] relative group/terminal">

      {/* Background terminal glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-violet-500/[0.04] blur-[80px] rounded-full pointer-events-none opacity-60 group-hover/terminal:opacity-100 transition-opacity duration-1000" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] rounded-t-[2rem] relative z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <h3 className="text-[13px] font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <Activity size={15} className="text-violet-400" />
              Live Terminal
            </h3>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase hidden sm:block">Dust</span>
            <button
              onClick={() => setHideSmall(!hideSmall)}
              className={`relative w-8 h-4 rounded-full flex items-center px-0.5 transition-all ${hideSmall ? 'bg-violet-600 border border-violet-500' : 'bg-[#1E293B] border border-white/5'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white shadow-md transition-transform duration-200 ${hideSmall ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="relative group/search">
          <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within/search:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-[#05070A]/80 border border-white/[0.08] rounded-xl py-1.5 pl-9 pr-3 text-[11px] font-medium text-white placeholder-[#475569] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 w-48 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────
          overflow-x-auto handles narrow viewports gracefully.
          table-fixed + colgroup guarantees the browser obeys our widths.
          min-w is set wide enough that no column starves.
      ─────────────────────────────────────────────────────────────────── */}
      <div
        className="overflow-x-auto w-full relative z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <table
          className="w-full border-collapse table-fixed"
          style={{ minWidth: '900px' }}
        >
          <colgroup>
            {COLS.map((w, i) => (
              <col key={i} style={{ width: `${w}%` }} />
            ))}
          </colgroup>

          <thead>
            <tr className="text-[9px] uppercase tracking-[0.18em] text-[#475569] border-b border-white/[0.05] bg-white/[0.005]">
              <th className="pl-6 pr-3 py-3 font-bold text-left">Asset</th>
              <th className="px-3 py-3 font-bold text-right">Holdings</th>
              <th className="px-3 py-3 font-bold text-right">Live Price</th>
              <th className="px-3 py-3 font-bold text-right">24H</th>
              <th className="px-3 py-3 font-bold text-right">Avg Cost</th>
              <th className="px-3 py-3 font-bold text-right">Value</th>
              <th className="px-3 py-3 font-bold text-right">P&amp;L</th>
              <th className="px-3 py-3 font-bold text-center">Alloc</th>
              <th className="px-2 py-3 font-bold text-center">Trend</th>
              <th className="pl-2 pr-5 py-3 font-bold text-center">Act.</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <Sparkles className="text-[#64748B]" size={22} />
                    </div>
                    <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest">No assets matched</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((h, i) => (
                <LiveTableRow
                  key={h.coin_id}
                  holding={h}
                  index={i}
                  openTradeModal={openTradeModal}
                  openAiModal={openAiModal}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="border-t border-white/[0.05] px-6 py-3 flex justify-center bg-white/[0.01] rounded-b-[2rem] relative z-10">
          <button className="text-[10px] font-bold text-[#64748B] hover:text-white flex items-center gap-2 transition-colors uppercase tracking-[0.15em] group/btn">
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] group-hover/btn:bg-white group-hover/btn:text-black transition-all">+</span>
            Expand Full Portfolio
          </button>
        </div>
      )}
    </div>
  );
}

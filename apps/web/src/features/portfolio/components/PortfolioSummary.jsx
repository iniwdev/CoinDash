import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const dummySparklineData = [
  { value: 40 }, { value: 30 }, { value: 45 }, { value: 50 }, { value: 35 }, { value: 60 }, { value: 55 }, { value: 70 }
];

const dummyBarData = [
  { value: 40 }, { value: 60 }, { value: 35 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 45 }, { value: 70 }, { value: 100 }
];

const cinematicCard = "lg:col-span-1 rounded-2xl bg-[#0A0E17]/80 backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] p-5 flex flex-col justify-between overflow-hidden relative group transition-all duration-500 hover:bg-[#0A0E17]/90 hover:border-white/[0.08] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_16px_48px_rgba(0,0,0,0.5)]";
const labelBase = "text-[10px] font-bold tracking-widest text-[#64748B] uppercase";
const valueBase = "text-xl xl:text-2xl 2xl:text-[28px] font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)] truncate block w-full";

const formatLargeCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  const absValue = Math.abs(value);
  if (absValue >= 1e9) return `${value < 0 ? '-' : ''}$${(absValue / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `${value < 0 ? '-' : ''}$${(absValue / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export default function PortfolioSummary({ summary, holdings, isLoading }) {
  if (isLoading || !summary) {
    return (
      // 2 cols on sm, 3 on md, 3 on lg (within the 9-col left canvas these are wide enough)
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 xl:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-[#0A0E17]/80 animate-pulse border border-white/[0.05]" />
        ))}
      </div>
    );
  }

  const totalValue = Number(summary.total_value);
  const totalInvested = Number(summary.total_invested);
  const totalPnL = Number(summary.total_pnl);
  const pnlPct = Number(summary.total_pnl_pct);
  const isProfit = totalPnL >= 0;

  const change24hValue = totalValue * 0.1243; 
  const change24hPct = 12.43;
  const is24hProfit = true;

  let bestPerformer = null;
  let worstPerformer = null;

  if (holdings && holdings.length > 0) {
    const sorted = [...holdings].sort((a, b) => Number(b.unrealized_pnl_pct) - Number(a.unrealized_pnl_pct));
    bestPerformer = sorted[0];
    worstPerformer = sorted[sorted.length - 1];
  }

  return (
    // 3 cards per row on md, keeps each card readable. xl+ gets all 6 in a row.
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-5">
      
      {/* 1. Total Portfolio Value */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cinematicCard}>
        <div className="flex justify-between items-start z-10 relative">
          <p className={labelBase}>Total Portfolio Value</p>
          <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </div>
        <div className="mt-2 z-10 relative">
          <div className="flex items-baseline gap-2 w-full overflow-hidden">
            <h2 className={valueBase} title={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
              {formatLargeCurrency(totalValue)}
            </h2>
            <span className="text-[11px] text-[#10B981] font-bold tracking-wide drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] shrink-0">↗ {change24hPct}%</span>
          </div>
          <p className="text-[11px] text-[#10B981]/80 mt-1 font-medium">+{change24hValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (24h)</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 opacity-60" style={{ filter: 'drop-shadow(0px 4px 12px rgba(139, 92, 246, 0.4))' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummySparklineData}>
              <defs>
                <linearGradient id="colorValSpark1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="url(#colorValSpark1)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 2. Unrealized P&L */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cinematicCard}>
        <div className="flex justify-between items-start z-10 relative">
          <p className={labelBase}>Unrealized P&L</p>
          <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <div className="mt-2 z-10 relative">
          <div className="flex items-baseline gap-2 w-full overflow-hidden">
            <h2 className={`${valueBase} ${isProfit ? 'text-[#10B981] drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-[#E11D48] drop-shadow-[0_0_12px_rgba(225,29,72,0.3)]'}`} title={`${isProfit ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
              {isProfit && totalPnL > 0 ? '+' : ''}{formatLargeCurrency(totalPnL)}
            </h2>
            <span className={`text-[11px] font-bold tracking-wide shrink-0 ${isProfit ? 'text-[#10B981]' : 'text-[#E11D48]'}`}>
              {isProfit ? '↗' : '↘'} {pnlPct.toFixed(2)}%
            </span>
          </div>
          <p className={`text-[11px] font-medium mt-1 ${isProfit ? 'text-[#10B981]/80' : 'text-[#E11D48]/80'}`}>
            {isProfit ? '+' : '-'}$1,204.32 (24h)
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 opacity-60" style={{ filter: isProfit ? 'drop-shadow(0px 4px 12px rgba(16, 185, 129, 0.4))' : 'drop-shadow(0px 4px 12px rgba(225, 29, 72, 0.4))' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummySparklineData}>
              <defs>
                <linearGradient id="colorValSpark2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isProfit ? "#10B981" : "#E11D48"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={isProfit ? "#10B981" : "#E11D48"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={isProfit ? "#10B981" : "#E11D48"} strokeWidth={2} fill="url(#colorValSpark2)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 3. Total Invested */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cinematicCard}>
        <div className="flex justify-between items-start z-10 relative">
          <p className={labelBase}>Total Invested</p>
          <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="mt-2 z-10 relative w-full overflow-hidden">
          <h2 className={valueBase} title={`$${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
            {formatLargeCurrency(totalInvested)}
          </h2>
          <p className="text-[11px] text-[#64748B] mt-1 font-medium">Avg. Cost Basis</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 px-2 flex items-end opacity-80" style={{ filter: 'drop-shadow(0px -4px 12px rgba(59, 130, 246, 0.3))' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dummyBarData}>
              <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                {dummyBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#6366F1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 4. 24h Change */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cinematicCard}>
        <div className="flex justify-between items-start z-10 relative">
          <p className={labelBase}>24h Change</p>
          <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11h10M7 15h10M7 19h10M12 7V3m0 4l-4 4m4-4l4 4" /></svg>
        </div>
        <div className="mt-2 z-10 relative">
          <h2 className={`${valueBase} ${is24hProfit ? 'text-[#10B981] drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-[#E11D48] drop-shadow-[0_0_12px_rgba(225,29,72,0.3)]'}`}>
            {is24hProfit ? '↗' : '↘'} {change24hPct.toFixed(2)}%
          </h2>
          <p className={`text-[11px] font-medium mt-1 ${is24hProfit ? 'text-[#10B981]/80' : 'text-[#E11D48]/80'}`}>
            {is24hProfit ? '+' : '-'}${change24hValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 opacity-60" style={{ filter: is24hProfit ? 'drop-shadow(0px 4px 12px rgba(16, 185, 129, 0.4))' : 'drop-shadow(0px 4px 12px rgba(225, 29, 72, 0.4))' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummySparklineData}>
              <defs>
                <linearGradient id="colorValSpark3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={is24hProfit ? "#10B981" : "#E11D48"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={is24hProfit ? "#10B981" : "#E11D48"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={is24hProfit ? "#10B981" : "#E11D48"} strokeWidth={2} fill="url(#colorValSpark3)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 5. Best Performer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cinematicCard}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">🔥</span>
            <p className={labelBase}>Best Performer</p>
          </div>
        </div>
        {bestPerformer ? (
          <div className="flex flex-col justify-between h-full pt-1">
            <div className="flex justify-between items-center">
              <h3 className="text-[15px] font-semibold tracking-wide text-white drop-shadow-sm">
                {bestPerformer.coin_id.charAt(0).toUpperCase() + bestPerformer.coin_id.slice(1)}
              </h3>
              <div className="w-7 h-7 rounded-full bg-[#F97316]/20 border border-[#F97316]/30 flex items-center justify-center text-[11px] text-[#F97316] font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)]">
                {bestPerformer.coin_symbol.charAt(0)}
              </div>
            </div>
            <p className="text-[15px] font-bold tracking-wide text-[#10B981] mt-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              ↗ {Number(bestPerformer.unrealized_pnl_pct).toFixed(2)}%
            </p>
          </div>
        ) : (
           <p className="text-[11px] font-medium text-[#64748B] mt-4">N/A</p>
        )}
      </motion.div>

      {/* 6. Worst Performer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cinematicCard}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">📉</span>
            <p className={labelBase}>Worst Performer</p>
          </div>
        </div>
        {worstPerformer ? (
          <div className="flex flex-col justify-between h-full pt-1">
            <div className="flex justify-between items-center">
              <h3 className="text-[15px] font-semibold tracking-wide text-white drop-shadow-sm">
                {worstPerformer.coin_id.charAt(0).toUpperCase() + worstPerformer.coin_id.slice(1)}
              </h3>
              <div className="w-7 h-7 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/30 flex items-center justify-center text-[11px] text-[#3B82F6] font-bold shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                {worstPerformer.coin_symbol.charAt(0)}
              </div>
            </div>
            <p className="text-[15px] font-bold tracking-wide text-[#E11D48] mt-2 drop-shadow-[0_0_8px_rgba(225,29,72,0.3)]">
              ↘ {Number(worstPerformer.unrealized_pnl_pct).toFixed(2)}%
            </p>
          </div>
        ) : (
           <p className="text-[11px] font-medium text-[#64748B] mt-4">N/A</p>
        )}
      </motion.div>
      
    </div>
  );
}

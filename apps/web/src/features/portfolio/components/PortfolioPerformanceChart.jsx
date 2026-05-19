import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const dummyData = [
  { date: 'Apr 18', value: 200000 },
  { date: 'Apr 20', value: 215000 },
  { date: 'Apr 22', value: 230000 },
  { date: 'Apr 24', value: 210000 },
  { date: 'Apr 26', value: 240000 },
  { date: 'Apr 28', value: 235000 },
  { date: 'Apr 30', value: 250000 },
  { date: 'May 02', value: 260000 },
  { date: 'May 04', value: 255000 },
  { date: 'May 06', value: 280000 },
  { date: 'May 08', value: 295000 },
  { date: 'May 10', value: 270000 },
  { date: 'May 12', value: 300000 },
  { date: 'May 14', value: 285000 },
  { date: 'May 16', value: 307496 },
];

export default function PortfolioPerformanceChart({ summary }) {
  const totalValue = summary ? Number(summary.total_value) : 307496;

  return (
    /*
      Key fixes:
      - Removed fixed h-[520px]. Let the card be h-auto with a min-h
        so it adapts to the column width on resize without cropping.
      - Reduced p-8 → p-6 to reclaim height for the chart.
      - The chart area uses a fixed h-[340px] instead of flex-1 so
        Recharts always has a concrete pixel height to measure against.
        (ResponsiveContainer with flex-1 inside a flex column can
        collapse to 0 height on first paint in some browser/zoom combos.)
      - Removed -ml-4 from chart wrapper — it was causing horizontal bleed
        outside the card boundary on narrow columns.
    */
    <div className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] p-6 flex flex-col relative overflow-hidden group transition-all duration-700 hover:bg-[#0A0E17]/80 hover:border-white/[0.05]">

      {/* Ambient glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-[#8B5CF6]/5 rounded-full blur-[80px] pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-1000" />

      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 relative z-10 gap-4 flex-shrink-0">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-1"
          >
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#7C879C] uppercase">Portfolio Performance</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-baseline gap-3 mt-1"
          >
            <h2 className="text-3xl lg:text-4xl xl:text-[40px] font-bold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(255,255,255,0.15)] leading-none">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex flex-col">
              <span className="text-[13px] text-[#10B981] font-bold tracking-wide drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">↗ +$38,204.00</span>
              <span className="text-[11px] text-[#10B981]/70 font-bold tracking-widest">+12.43% (ALL)</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center bg-[#05070A]/80 rounded-xl p-1.5 border border-white/[0.04] backdrop-blur-md flex-shrink-0"
        >
          {['1D', '7D', '1M', '3M', '1Y', 'ALL'].map((filter) => (
            <button
              key={filter}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-widest rounded-lg transition-all duration-300 ${
                filter === 'ALL'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-white/10'
                  : 'text-[#7C879C] hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Chart area — fixed pixel height so Recharts always renders correctly */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full"
        style={{
          height: '340px',
          filter: 'drop-shadow(0px 6px 20px rgba(139, 92, 246, 0.4))',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dummyData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValueMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#D946EF" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D946EF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
              dy={12}
              minTickGap={40}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
              tickFormatter={(val) => `$${val / 1000}K`}
              domain={['dataMin - 20000', 'dataMax + 20000']}
              width={60}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{
                backgroundColor: 'rgba(5, 7, 10, 0.95)',
                backdropFilter: 'blur(24px)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: '14px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                padding: '14px 16px',
              }}
              itemStyle={{ color: '#fff', fontSize: '16px', fontWeight: 800 }}
              labelStyle={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '6px' }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#colorValueMain)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValueMain)"
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-out"
              activeDot={{ r: 7, fill: '#D946EF', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 10px rgba(217,70,239,0.8))' } }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

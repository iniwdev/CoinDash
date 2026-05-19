import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#A855F7', '#EC4899', '#22D3EE', '#F43F5E', '#EAB308'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0A0E17]/90 backdrop-blur-xl border border-white/[0.05] rounded-xl p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: data.fill, color: data.fill }}></div>
          <span className="text-white text-[11px] font-bold uppercase tracking-widest">{data.coin_symbol}</span>
        </div>
        <div className="text-white font-semibold text-[13px] tracking-wide">
          {Number(data.allocation_pct).toFixed(2)}%
        </div>
        <div className="text-[#64748B] text-[10px] mt-1 font-semibold tracking-wide">
          ${Number(data.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    );
  }
  return null;
};

export default function AllocationDonut({ holdings, summary }) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="h-full rounded-2xl bg-[#0A0E17]/80 backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] p-6 flex items-center justify-center text-[#64748B] text-[10px] font-bold uppercase tracking-widest">
        No allocation data
      </div>
    );
  }

  // Filter out zero value holdings and sort by value
  const chartData = holdings
    .filter(h => Number(h.current_value) > 0)
    .sort((a, b) => Number(b.current_value) - Number(a.current_value))
    .map((h, i) => ({
      ...h,
      current_value: Number(h.current_value), // Required for Recharts to render
      fill: COLORS[i % COLORS.length]
    }));

  const totalValue = summary ? Number(summary.total_value) : 0;

  return (
    <div className="h-full rounded-2xl bg-[#0A0E17]/80 backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] p-6 flex flex-col transition-all duration-500 hover:bg-[#0A0E17]/90 hover:border-white/[0.08] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_16px_48px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase">Asset Allocation</h3>
          <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <button className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-transparent hover:bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] text-[#94A3B8] hover:text-white rounded-lg transition-all">
          View All
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-6 mt-2">
        {/* Donut Chart with Center Text */}
        <div className="relative h-48 w-full flex items-center justify-center">
          {/* Subtle glow behind donut */}
          <div className="absolute inset-0 bg-[#8B5CF6]/10 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Total Value</span>
            <span className="text-[18px] font-bold text-white tracking-tight mt-1 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
              ${totalValue > 1000 ? (totalValue/1000).toFixed(1) + 'K' : totalValue.toFixed(0)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                innerRadius="75%" 
                outerRadius="95%" 
                paddingAngle={3} 
                dataKey="current_value"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: `drop-shadow(0px 0px 8px ${entry.fill}40)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="w-full flex flex-col gap-3 z-10 px-2 pb-2">
          {chartData.slice(0, 4).map((entry) => (
            <div key={entry.coin_id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] transition-transform group-hover:scale-125" style={{ backgroundColor: entry.fill, color: entry.fill }} />
                <span className="font-semibold text-[#E2E8F0] text-[11px] tracking-widest uppercase">{entry.coin_symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white text-[12px] tracking-wide">{Number(entry.allocation_pct).toFixed(2)}%</div>
                <div className="text-[10px] text-[#64748B] font-semibold tracking-wide mt-0.5">${Number(entry.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          ))}
          {chartData.length > 4 && (
            <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest text-center mt-2 pt-3 border-t border-white/[0.05]">
              + {chartData.length - 4} others
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

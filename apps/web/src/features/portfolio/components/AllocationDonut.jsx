import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#f97316', '#a855f7', '#3b82f6', '#22d3ee', '#ec4899', '#10b981', '#f43f5e', '#eab308'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#111827] border border-white/10 rounded-xl p-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }}></div>
          <span className="text-white text-sm font-medium">{data.coin_symbol}</span>
        </div>
        <div className="text-white font-semibold">
          {Number(data.allocation_pct).toFixed(2)}%
        </div>
        <div className="text-slate-400 text-xs mt-1">
          ${Number(data.current_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    );
  }
  return null;
};

export default function AllocationDonut({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
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
      fill: COLORS[i % COLORS.length]
    }));

  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-[0_0_40px_rgba(249,115,22,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Asset Allocation</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 h-[calc(100%-2rem)]">
        <div className="h-48 w-48 md:h-full md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="90%" 
                paddingAngle={4} 
                dataKey="current_value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 w-full flex flex-col justify-center gap-3">
          {chartData.slice(0, 5).map((entry) => (
            <div key={entry.coin_id} className="flex items-center justify-between text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                <span className="font-medium text-white">{entry.coin_symbol}</span>
              </div>
              <span className="font-semibold">{Number(entry.allocation_pct).toFixed(1)}%</span>
            </div>
          ))}
          {chartData.length > 5 && (
            <div className="text-xs text-slate-500 text-center mt-2">
              + {chartData.length - 5} other assets
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

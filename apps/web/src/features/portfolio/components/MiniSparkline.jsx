import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniSparkline({ data, isProfit }) {
  // If no data is provided, generate a deterministic-looking mock line for visual effect
  const chartData = data || [
    { value: 40 }, { value: isProfit ? 45 : 35 }, { value: isProfit ? 50 : 30 }, 
    { value: isProfit ? 48 : 38 }, { value: isProfit ? 60 : 25 }, { value: isProfit ? 75 : 20 }
  ];

  const color = isProfit ? '#10B981' : '#F43F5E'; // Emerald for profit, Rose for loss

  return (
    <div className="h-8 w-20 opacity-80 group-hover:opacity-100 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5} 
            dot={false} 
            isAnimationActive={false} 
            style={{ filter: `drop-shadow(0 2px 4px ${color}60)` }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

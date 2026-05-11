import { LineChart, Line, ResponsiveContainer } from 'recharts';

const SimpleSparkline = ({ data, isPositive }) => {
  if (!data || data.length === 0) {
    return <div className="w-full h-8 bg-slate-700/30 rounded" />;
  }

  const chartData = data.map((price, idx) => ({
    x: idx,
    y: price,
  }));

  const color = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="w-full h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Line
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleSparkline;

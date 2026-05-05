import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { getCoinGeckoId, fetchChartData } from '../utils/coingeckoChart';

const Sparkline = ({ coin }) => {
  const [sparklineData, setSparklineData] = useState([]);

  useEffect(() => {
    const fetchSparkline = async () => {
      if (!coin) return;
      
      try {
        const geckoId = getCoinGeckoId(coin);
        const prices = await fetchChartData(geckoId);
        setSparklineData(prices);
      } catch (error) {
        console.error('Failed to fetch sparkline:', error);
        setSparklineData([]);
      }
    };

    fetchSparkline();
  }, [coin?.name, coin?.symbol]);

  const { chartData, stroke } = useMemo(() => {
    if (sparklineData.length < 5) {
      return {
        chartData: [],
        stroke: '#64748b',
      };
    }

    const prices = sparklineData.map((d) => d.price);
    const strokeColor = prices[prices.length - 1] >= prices[0] ? '#22c55e' : '#ef4444';

    return {
      chartData: sparklineData,
      stroke: strokeColor,
    };
  }, [sparklineData]);

  if (chartData.length === 0) {
    return <div className="w-full h-[50px] bg-white/5 rounded" />;
  }

  return (
    <div className="w-full h-[50px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            hide={true}
          />
          <YAxis hide={true} domain={['auto', 'auto']} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;

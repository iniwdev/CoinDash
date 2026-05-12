import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import apiClient from '@/lib/apiClient';

const WatchlistPerformanceChart = ({ coins, timeRange, onTimeRangeChange }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeRanges = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '1m', label: '1M' },
    { value: '1y', label: '1Y' },
  ];

  useEffect(() => {
    if (coins.length === 0) return;

    const fetchChartData = async () => {
      setLoading(true);
      try {
        const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '1m' ? 30 : 365;

        // Fetch historical data for all coins in watchlist
        // Route through Vite proxy → FastAPI → CoinGecko (Redis cached)
        const promises = coins.map((coin) =>
          apiClient.get(`/market/coins/${coin.id}/market_chart`, {
            params: { vs_currency: 'usd', days }
          })
        );

        const results = await Promise.all(promises);

        // Combine data by timestamp
        const dataMap = new Map();

        results.forEach((result, idx) => {
          const coin = coins[idx];
          const prices = result.data.prices;

          prices.forEach(([timestamp, price]) => {
            const date = new Date(timestamp);
            const key = days === 1 ? date.toISOString().split('T')[0] + ' ' + date.getHours() + ':00' : date.toISOString().split('T')[0];

            if (!dataMap.has(key)) {
              dataMap.set(key, {
                date: key,
                timestamp,
              });
            }

            dataMap.get(key)[coin.symbol.toUpperCase()] = price;
          });
        });

        // Convert to array and sort by timestamp
        const combinedData = Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);

        // Normalize to percentage change from first value
        if (combinedData.length > 0) {
          const firstValues = {};
          coins.forEach(coin => {
            const symbol = coin.symbol.toUpperCase();
            firstValues[symbol] = combinedData[0][symbol];
          });

          combinedData.forEach(dataPoint => {
            coins.forEach(coin => {
              const symbol = coin.symbol.toUpperCase();
              if (firstValues[symbol] && dataPoint[symbol]) {
                dataPoint[symbol] = ((dataPoint[symbol] - firstValues[symbol]) / firstValues[symbol]) * 100;
              }
            });
          });
        }

        setChartData(combinedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [coins, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1120] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <motion.div
      className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] p-6"
      whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Watchlist Performance</h2>
          <p className="text-slate-400 text-sm mt-1">Track portfolio growth over time</p>
        </div>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange(range.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                timeRange === range.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400 mb-2">No data available</div>
            <div className="text-slate-500 text-sm">Add coins to your watchlist to see performance</div>
          </div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {coins.map((coin, index) => (
                  <linearGradient key={coin.id} id={`gradient-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => {
                  if (timeRange === '24h') {
                    return value.split(' ')[1];
                  }
                  return value;
                }}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              {coins.map((coin, index) => (
                <Area
                  key={coin.id}
                  type="monotone"
                  dataKey={coin.symbol.toUpperCase()}
                  stroke={colors[index % colors.length]}
                  fillOpacity={1}
                  fill={`url(#gradient-${coin.id})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>

          <div className="text-slate-400 text-sm mt-4">
            {coins.length} assets • {timeRange} period
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WatchlistPerformanceChart;
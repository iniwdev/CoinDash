import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const timeframeOptions = ['1D', '1W', '1M', '3M', '1Y'];

const generateChartData = (prices, timeframe) => {
  if (!prices?.length) return [];

  const now = new Date();
  const periods = {
    '1D': 24,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365,
  };

  const period = periods[timeframe];
  const step = Math.max(1, Math.floor(prices.length / period));

  return prices
    .filter((_, index) => index % step === 0)
    .slice(-period)
    .map((price, index) => ({
      time: timeframe === '1D' ? `${index}h` :
            timeframe === '1W' ? `D${index + 1}` :
            timeframe === '1M' ? `W${Math.ceil((index + 1) / 7)}` :
            timeframe === '3M' ? `M${Math.ceil((index + 1) / 30)}` :
            `M${Math.ceil((index + 1) / 30)}`,
      value: price,
    }));
};

const TradingAnalytics = ({ coin, technicalData }) => {
  const [range, setRange] = useState('1W');

  const chartData = useMemo(() => {
    if (technicalData?.priceHistory) {
      return generateChartData(technicalData.priceHistory, range);
    }
    return [];
  }, [technicalData, range]);

  const metrics = useMemo(() => {
    if (!technicalData) return [];

    return [
      {
        label: 'RSI',
        value: technicalData.rsi?.toFixed(1) || '--',
        trend: technicalData.rsi > 70 ? 'Overbought' : technicalData.rsi < 30 ? 'Oversold' : 'Neutral',
        color: technicalData.rsi > 70 ? 'text-rose-400' : technicalData.rsi < 30 ? 'text-emerald-400' : 'text-sky-400',
      },
      {
        label: 'MACD',
        value: technicalData.macd ? (technicalData.macd > 0 ? `+${technicalData.macd.toFixed(2)}` : technicalData.macd.toFixed(2)) : '--',
        trend: technicalData.macd > 0 ? '+0.12' : '-0.08',
        color: technicalData.macd > 0 ? 'text-emerald-400' : 'text-rose-400',
      },
      {
        label: 'Volatility',
        value: technicalData.volatility ? `${technicalData.volatility.toFixed(1)}%` : '--',
        trend: technicalData.volatility > 5 ? 'High' : technicalData.volatility > 2 ? 'Moderate' : 'Low',
        color: technicalData.volatility > 5 ? 'text-rose-400' : technicalData.volatility > 2 ? 'text-orange-400' : 'text-emerald-400',
      },
      {
        label: 'Trend',
        value: technicalData.trend || 'Neutral',
        trend: technicalData.trend === 'Strong Bullish' ? 'Bullish' : technicalData.trend === 'Bullish' ? 'Bullish' : 'Bearish',
        color: technicalData.trend?.includes('Bullish') ? 'text-emerald-400' : 'text-rose-400',
      },
    ];
  }, [technicalData]);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Price Analytics</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Technical Chart & Indicators</h2>
        </div>
        <div className="flex flex-wrap gap-1">
          {timeframeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded px-2 py-1 text-xs font-medium transition ${
                range === option ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
        <div className="rounded-xl bg-slate-900/80 p-3">
          <div className="h-[200px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(148,163,184,0.16)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#cbd5e1' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    fill="url(#analyticsChartGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <div className="text-2xl opacity-20">📊</div>
                <p className="text-xs text-slate-600">Insufficient price history</p>
              </div>
            )}
          </div>
        </div>


        <div className="grid gap-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-white/5 bg-slate-950/80 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{metric.value}</p>
                <span className={`text-xs ${metric.color}`}>{metric.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingAnalytics;
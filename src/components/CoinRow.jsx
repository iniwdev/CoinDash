import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const CoinRow = ({ coin, isFavorite, onToggleFavorite, chartData }) => {
  const navigate = useNavigate();

  // Calculate stroke color based on price trend
  const { displayChartData, chartColor } = useMemo(() => {
    if (!chartData || chartData.length < 5) {
      return { displayChartData: [], chartColor: '#64748b' };
    }

    const prices = chartData.map((d) => d.price);
    const chartColor = prices[prices.length - 1] >= prices[0] ? '#22c55e' : '#ef4444';

    return { displayChartData: chartData, chartColor };
  }, [chartData]);

  const formatPrice = (value) => {
    if (typeof value !== 'number') {
      return '$0.00';
    }
    if (value >= 1) {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${value.toFixed(6)}`;
  };

  const formatLarge = (value) => {
    if (!value || value === 0) {
      return '$0';
    }
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatChange = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '--';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const changeColor = (value) =>
    typeof value !== 'number' || Number.isNaN(value) ? 'text-slate-400' : value >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <tr
      className="border-b border-white/10 transition hover:bg-white/5 cursor-pointer"
      onClick={() => navigate(`/coin/${coin.id}`)}
    >
      <td className="px-2 py-3 min-w-0 overflow-hidden text-center text-slate-400 text-sm">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(coin.id);
          }}
          className={`text-lg transition ${isFavorite ? 'text-yellow-400 shadow-[0_0_18px_rgba(245,158,11,0.45)]' : 'text-slate-600 hover:text-slate-300'}`}
          aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
        >
          ★
        </button>
      </td>
      <td className="px-2 py-3 min-w-0 overflow-hidden text-sm font-semibold text-white">{coin.rank}</td>
      <td className="px-2 py-3 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          {coin.icon ? (
            <img
              src={coin.icon}
              alt={coin.name}
              className="h-8 w-8 rounded-full object-cover flex-shrink-0"
              onError={(event) => {
                event.target.src = "https://via.placeholder.com/40";
              }}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300 flex-shrink-0">
              {coin.symbol?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{coin.name}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 truncate">{coin.symbol}</p>
          </div>
        </div>
      </td>
      <td className={`px-2 py-3 min-w-0 overflow-hidden text-right text-sm font-semibold ${changeColor(coin.priceChange1h)}`}>
        {formatChange(coin.priceChange1h)}
      </td>
      <td className={`px-2 py-3 min-w-0 overflow-hidden text-right text-sm font-semibold ${changeColor(coin.priceChange24h)}`}>
        {formatChange(coin.priceChange24h)}
      </td>
      <td className={`px-2 py-3 min-w-0 overflow-hidden text-right text-sm font-semibold ${changeColor(coin.priceChange7d)}`}>
        {formatChange(coin.priceChange7d)}
      </td>
      <td className="px-2 py-3 min-w-0 overflow-hidden text-right text-sm font-semibold text-white">{formatPrice(coin.price)}</td>
      <td className="px-2 py-3 min-w-0 overflow-hidden text-right text-sm text-slate-300">{formatLarge(coin.marketCap)}</td>
      <td className="px-2 py-3 min-w-0 overflow-hidden text-right text-sm text-slate-300">{formatLarge(coin.volume)}</td>
      <td className="px-2 py-3 min-w-[100px] w-[100px] overflow-hidden">
        <div className="w-full h-10">
          {displayChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-lg bg-white/5" />
          )}
        </div>
      </td>
    </tr>
  );
};

export default CoinRow;

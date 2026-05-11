import { motion } from 'framer-motion';
import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const WatchlistHeatmap = ({ coins }) => {
  if (!coins || coins.length === 0) {
    return (
      <motion.div
        className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] p-6"
        whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Market Heatmap</h2>
          <p className="text-slate-400 text-sm mt-1">24h performance by market cap</p>
        </div>
        <div className="h-96 w-full flex items-center justify-center text-slate-400">
          <p>Add coins to your watchlist to view the heatmap</p>
        </div>
      </motion.div>
    );
  }

  const data = coins.map((coin) => ({
    name: coin.symbol?.toUpperCase() || 'N/A',
    value: Math.abs(coin.market_cap || 1),
    change: coin.price_change_percentage_24h || 0,
    price: coin.current_price || 0,
    image: coin.image,
    fullName: coin.name,
  }));

  const getColor = (change) => {
    if (change > 10) return '#00c853'; // Strong gain - vibrant green
    if (change > 5) return '#43a047'; // Gain - green
    if (change > 0) return '#ef5350'; // Loss - red
    if (change > -5) return '#c62828'; // Strong loss - dark red
    return '#b71c1c'; // Very strong loss - very dark red
  };

  const CustomTooltip = ({ payload }) => {
    if (payload && payload.length > 0) {
      const data = payload[0].payload;
      const isPositive = data.change > 0;

      return (
        <div className="bg-[#111827]/95 border border-white/10 rounded-lg p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={data.image}
              alt={data.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-white font-bold text-lg">{data.name}</p>
              <p className="text-slate-400 text-sm">{data.fullName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Price:</span>
              <span className="text-white font-semibold">
                ${data.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">24h Change:</span>
              <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Market Cap:</span>
              <span className="text-white font-semibold">
                ${(data.value / 1000000000).toFixed(2)}B
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomContent = (props) => {
    const { root, depth, x, y, width, height, index, payload } = props;

    if (!payload) return null;

    const change = payload.change;
    const color = getColor(change);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: '#020617',
            strokeWidth: 2,
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
          }}
          rx={8}
          ry={8}
        />

        {/* Glow effect for strong performers */}
        {Math.abs(change) > 10 && (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: 'none',
              stroke: color,
              strokeWidth: 3,
              filter: 'blur(4px) opacity(0.6)',
            }}
            rx={8}
            ry={8}
          />
        )}

        {/* Text */}
        {width > 60 && height > 40 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: Math.min(width / 6, height / 4, 14),
              fontWeight: 'bold',
              fill: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            {payload.name}
          </text>
        )}
      </g>
    );
  };

  return (
    <motion.div
      className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] p-6"
      whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Market Heatmap</h2>
        <p className="text-slate-400 text-sm mt-1">24h performance by market cap</p>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="value"
            content={<CustomContent />}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00c853] shadow-lg shadow-[#00c853]/50"></div>
          <span className="text-slate-400 text-sm font-semibold">Strong Gain (+10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#43a047] shadow-lg shadow-[#43a047]/50"></div>
          <span className="text-slate-400 text-sm font-semibold">Gain (+5% to +10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#ef5350] shadow-lg shadow-[#ef5350]/50"></div>
          <span className="text-slate-400 text-sm font-semibold">Loss (0% to -5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#c62828] shadow-lg shadow-[#c62828]/50"></div>
          <span className="text-slate-400 text-sm font-semibold">Strong Loss (-5% to -10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#b71c1c] shadow-lg shadow-[#b71c1c]/50"></div>
          <span className="text-slate-400 text-sm font-semibold">Heavy Loss (&lt;-10%)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WatchlistHeatmap;

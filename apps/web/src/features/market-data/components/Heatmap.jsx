import { useCallback, useEffect, useMemo, useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import HeatmapDropdown from "@/features/market-data/components/HeatmapDropdown";

const Heatmap = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [sizeMetric, setSizeMetric] = useState('market_cap');
  const [itemCount, setItemCount] = useState(20);

  const performanceOptions = [
    { label: '1 hour', value: '1h' },
    { label: '1 day', value: '24h' },
    { label: '7 days', value: '7d' },
  ];

  const sizeOptions = [
    { label: 'Market Cap', value: 'market_cap' },
    { label: 'Volume', value: 'volume' },
  ];

  const itemCountOptions = [
    { label: '20', value: 20 },
    { label: '100', value: 100 },
  ];

  const fetchHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/market/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: itemCount,
          page: 1,
          sparkline: false,
          price_change_percentage: timeframe
        }
      });

      setCoins(response.data);
    } catch (fetchError) {
      console.error('Heatmap fetch error:', fetchError);
      setError(fetchError.message);
      setCoins([]);
    } finally {
      setLoading(false);
    }
  }, [itemCount, timeframe]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData, timeframe]);

  const getChangeValue = (coin) => {
    switch (timeframe) {
      case '24h':
        return coin.price_change_percentage_24h_in_currency ||
               coin.price_change_percentage_24h ||
               coin.price_change_24h ||
               0;
      default:
        return coin.price_change_percentage_24h_in_currency ||
               coin.price_change_percentage_24h ||
               0;
    }
  };

  const getSizeValue = (coin) => {
    switch (sizeMetric) {
      case 'market_cap':
        return coin.market_cap || 0;
      case 'volume':
        return coin.total_volume || 0;
      default:
        return coin.market_cap || 0;
    }
  };

  const getColor = (change) => {
    if (change > 5) return '#16a34a'; // dark green
    if (change > 0) return '#22c55e'; // green
    if (change === 0) return '#64748b'; // gray
    if (change > -5) return '#ef4444'; // red
    return '#dc2626'; // dark red
  };

  const treemapData = useMemo(() => {
    if (!coins.length) return [];

    // Filter to only valid coins with symbol, price, and market cap
    const validCoins = coins.filter(
      (coin) =>
        coin.symbol &&
        coin.current_price &&
        coin.market_cap
    );

    const children = validCoins.map((coin, index) => ({
      name: coin.symbol?.toUpperCase() || `COIN${index}`,
      size: getSizeValue(coin) || 1000000,
      change: getChangeValue(coin) || 0,
      price: coin.current_price || 0,
      marketCap: coin.market_cap || 0,
      volume: coin.total_volume || 0,
      fullName: coin.name || `Coin ${index}`,
      image: coin.image || '',
      color: getColor(getChangeValue(coin) || 0),
    }));

    // Return children directly without "Market" root node
    return children;
  }, [coins, timeframe, sizeMetric]);

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatLarge = (value) => {
    if (!value || value === 0) return '$0';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, coordinate }) => {
    if (!(active && payload && payload.length && coordinate)) {
      return null;
    }

    const data = payload[0].payload;
    const tooltipWidth = 280;
    const tooltipHeight = 190;
    let left = coordinate.x + 24;
    let top = coordinate.y + 24;

    // Edge detection for right edge
    if (left + tooltipWidth > window.innerWidth) {
      left = coordinate.x - tooltipWidth - 24;
    }

    // Edge detection for bottom edge
    if (top + tooltipHeight > window.innerHeight) {
      top = coordinate.y - tooltipHeight - 24;
    }

    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - tooltipHeight - 12));

    return (
      <div
        className="fixed bg-[#f4f4f4] text-black rounded-2xl px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] border border-black/10 pointer-events-none z-[99999]"
        style={{ left, top, minWidth: tooltipWidth }}
      >
        <div className="mb-3 flex items-center gap-3">
          {data.image && (
            <img
              src={data.image}
              alt={data.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="font-bold text-lg">{data.fullName}</div>
            <div className="text-sm text-gray-600">{data.name}</div>
          </div>
        </div>
        <div className="space-y-1 text-[15px]">
          <div className="flex justify-between">
            <span className="text-gray-700">Price:</span>
            <span className="font-semibold">{formatPrice(data.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">1d Change:</span>
            <span className={`font-semibold ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Market Cap:</span>
            <span className="font-semibold">{formatLarge(data.marketCap)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Volume:</span>
            <span className="font-semibold">{formatLarge(data.volume)}</span>
          </div>
        </div>
      </div>
    );
  };

  const CustomHeatmapNode = (props) => {
    const { x, y, width, height, name, change, price } = props;

    // Skip invalid nodes
    if (!name || !price || width < 0 || height < 0) return null;

    const coinName = name || 'Coin';
    const coinChange = typeof change === 'number' ? change : 0;
    const coinPrice = typeof price === 'number' ? price : 0;

    // Dynamic colors based on positive/negative
    const positive = coinChange >= 0;
    const bgColor = positive
      ? `rgba(74, 222, 128, ${Math.min(0.85, 0.35 + Math.abs(coinChange) / 12)})`
      : `rgba(248, 113, 113, ${Math.min(0.85, 0.35 + Math.abs(coinChange) / 12)})`;

    // Detect huge boxes (BTC size)
    const isHuge = width > 600 && height > 350;

    // Calculate clamped font sizes with HARD CAPS
    const symbolSize = isHuge
      ? 88
      : Math.max(14, Math.min(width / 7, height / 4, 96));

    const priceSize = isHuge
      ? 56
      : Math.max(12, Math.min(width / 10, height / 6, 64));

    const changeSize = isHuge
      ? 40
      : Math.max(10, Math.min(width / 12, height / 7, 48));

    const clipPathId = `clip-${name}-${x}-${y}`;

    return (
      <g>
        {/* Clip path to prevent overflow */}
        <defs>
          <clipPath id={clipPathId}>
            <rect x={x} y={y} width={width} height={height} />
          </clipPath>
        </defs>

        {/* Main background rectangle */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={bgColor}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />

        {/* Render full content for larger boxes */}
        {width > 90 && height > 70 && (
          <g clipPath={`url(#${clipPathId})`}>
            {/* Coin symbol - top */}
            <text
              x={x + width / 2}
              y={y + height / 2 - symbolSize / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={symbolSize}
              fontWeight="500"
            >
              {coinName}
            </text>

            {/* Price - middle */}
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={priceSize}
              fontWeight="700"
            >
              ${coinPrice < 1 ? coinPrice.toFixed(4) : coinPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </text>

            {/* Change percentage - bottom */}
            <text
              x={x + width / 2}
              y={y + height / 2 + changeSize + 25}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={changeSize}
              fontWeight="700"
            >
              {coinChange > 0 ? '+' : ''}{coinChange.toFixed(2)}%
            </text>
          </g>
        )}

        {/* Show only symbol for small boxes */}
        {(width <= 90 || height <= 70) && width >= 50 && height >= 40 && (
          <g clipPath={`url(#${clipPathId})`}>
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={Math.max(10, Math.min(width / 7, height / 3, 28))}
              fontWeight="600"
            >
              {coinName}
            </text>
          </g>
        )}
      </g>
    );
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-white">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-rose-400 text-sm mb-2">Failed to load heatmap data</p>
            <p className="text-slate-400 text-xs">{error}</p>
            <button
              onClick={fetchHeatmapData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-slate-950/70">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Market Heatmap</h2>
            <p className="text-sm text-slate-400">Real-time market performance visualization</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:gap-4 sm:mt-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Performance:</span>
              <HeatmapDropdown
                selected={timeframe}
                options={performanceOptions}
                onSelect={setTimeframe}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Block Size:</span>
              <HeatmapDropdown
                selected={sizeMetric}
                options={sizeOptions}
                onSelect={setSizeMetric}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Treemap */}
      <div className="relative h-[700px] w-full min-h-[700px] overflow-hidden">
        {treemapData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#ffffff20"
              fill="#1f2937"
              content={<CustomHeatmapNode />}
              isAnimationActive
              animationDuration={700}
            >
              <Tooltip
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              />
            </Treemap>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">No data available for treemap</p>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-5 px-2">
        <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-slate-950/80 p-3 shadow-[0_10px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <span className="text-xs text-slate-400">Items in map:</span>
          <HeatmapDropdown
            selected={itemCount}
            options={itemCountOptions}
            onSelect={setItemCount}
            compact
            upward
          />
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
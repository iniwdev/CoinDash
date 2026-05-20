import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import { useUIStore } from "@/store/uiStore";
import { useCoins } from "@/features/market-data/api/useCoins";
import { getComparisonOptions, fetchComparisonHistory } from "@/utils/chartComparisons";
import { getCoinGeckoId } from "@/utils/coingeckoChart";
import Navbar from "@/components/layout/Navbar";
import MarketsTab from "@/features/market-data/components/MarketsTab";
import CoinMarketsTable from "@/features/market-data/components/CoinMarketsTable";
import CoinNewsSection from "@/features/market-data/components/CoinNewsSection";
import AlertsTab from "@/features/market-data/components/AlertsTab";
import AnalyticsDashboard from "@/features/market-data/components/analytics/AnalyticsDashboard";
import './CoinDetails.css';

const chartPeriods = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
];

const formatCurrency = (value, currency = 'USD') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  const currencyKey = String(currency).toLowerCase();
  if (currencyKey === 'usd') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currencyKey === 'btc') {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} BTC`;
  }
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} ETH`;
};

const formatLarge = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toLocaleString()}`;
};

const formatNumber = (num) => {
  if (typeof num !== 'number' || Number.isNaN(num) || num === null) return '-';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
};

const formatTimeLabel = (timestamp, range) => {
  const date = dayjs(timestamp);
  switch (range) {
    case '1h':
    case '24h':
      return date.format('HH:mm');
    case '1w':
    case '1m':
      return date.format('MMM D');
    case '1y':
      return date.format('MMM');
    case 'all':
      return date.format('YYYY');
    default:
      return date.format('MMM D');
  }
};

const normalizeValue = (value, min, max) => {
  if (typeof value !== 'number' || Number.isNaN(value) || max <= min) return 0.5;
  return (value - min) / (max - min);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const denormalizeRenderValue = (renderValue, min, max, offset = 0) => {
  if (typeof renderValue !== 'number' || Number.isNaN(renderValue) || max <= min) return min;
  const normalized = (renderValue - 0.1 - offset) / 0.8;
  const clamped = clamp(normalized, 0, 1);
  return min + clamped * (max - min);
};

const calcRenderValue = (value, min, max, offset = 0) => {
  const normalized = normalizeValue(value, min, max);
  return clamp(normalized * 0.8 + 0.1 + offset, 0, 1);
};

const SmallCard = ({ title, value, badge }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-slate-400 truncate">{title}</p>
      {badge && <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{badge}</span>}
    </div>
    <p className="mt-4 text-2xl font-semibold text-white truncate">{value}</p>
  </div>
);

export default function CoinDetails() {
  const { id } = useParams();
  const { openWalletModal } = useUIStore();
  const { data: coins = [] } = useCoins();
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [range, setRange] = useState('24h');
  const [enabledCharts, setEnabledCharts] = useState(['usd']);
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [noteText, setNoteText] = useState('');
  const [converterValue, setConverterValue] = useState(1);
  const [converterMode, setConverterMode] = useState('BTC→USD');

  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_COINSTATS_API_KEY;
  const btcCoin = useMemo(() => coins.find((c) => c.symbol === 'BTC'), [coins]);
  const ethCoin = useMemo(() => coins.find((c) => c.symbol === 'ETH'), [coins]);
  const currentBtcPrice = useMemo(() => (btcCoin?.price && Number.isFinite(btcCoin.price) ? btcCoin.price : null), [btcCoin]);
  const currentEthPrice = useMemo(() => (ethCoin?.price && Number.isFinite(ethCoin.price) ? ethCoin.price : null), [ethCoin]);
  const comparisonOptions = useMemo(() => getComparisonOptions(id), [id]);
  const coinGeckoId = useMemo(() => {
    if (coin) return getCoinGeckoId(coin);
    return id ? String(id).toLowerCase() : '';
  }, [coin, id]);

  useEffect(() => {
    if (!id) return;
    if (id.toLowerCase() === 'bitcoin') {
      setEnabledCharts(['usd', 'eth']);
      return;
    }
    if (id.toLowerCase() === 'ethereum') {
      setEnabledCharts(['usd', 'btc']);
      return;
    }
    setEnabledCharts(['usd', 'btc', 'eth']);
  }, [id]);

  const rangeMap = {
    "1h": { days: 1, interval: "minutely" },
    "24h": { days: 1 },
    "1w": { days: 7 },
    "1m": { days: 30 },
    "3m": { days: 90 },
    "6m": { days: 180 },
    "1y": { days: 365 },
    "all": { days: "max" }
  };

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Market', value: 'market' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Price', value: 'price' },
    { label: 'Alerts', value: 'alerts' },
    { label: 'News', value: 'news' },
  ];

  const leftTabs = tabs.slice(0, 3);
  const rightTabs = tabs.slice(3);
  const showRightTabs = ['overview', 'price', 'alerts', 'news'].includes(activeTab);

  const formatCurrency = (value, currencyType = 'USD') => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '—';
    const currencyKey = String(currencyType || 'usd').toLowerCase();
    if (currencyKey === 'usd') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currencyKey === 'btc') {
      return `${value.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} BTC`;
    }
    if (currencyKey === 'eth') {
      return `${value.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} ETH`;
    }
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyType}`;
  };

  const renderPriceChart = () => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="chart-header-title min-w-0">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Price chart</p>
            <h2 className="mt-2 text-2xl font-semibold text-white truncate break-words">{coin.name} price movement</h2>
          </div>
          <div className="comparison-toggle-group currency-toggle-row">
          {comparisonOptions.map((option) => {
            const isActive = enabledCharts.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setEnabledCharts((prev) => {
                    const active = prev.includes(option);
                    const next = active ? prev.filter((item) => item !== option) : [...prev, option];
                    return next.length ? next : [option];
                  });
                  setSelectedCurrency(option);
                }}
                className={`comparison-toggle ${isActive ? 'active' : 'inactive'}`}
              >
                <span className={`toggle-checkbox ${option} ${isActive ? 'checked' : ''}`}>
                  {isActive ? '✓' : ''}
                </span>
                <span className="toggle-label">{option.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chartPeriods.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setRange(filter.value)}
            className={`rounded-full px-3 py-2 text-sm transition ${range === filter.value ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-4 w-full h-[460px] rounded-3xl border border-white/10 bg-slate-950/80 p-3 overflow-hidden">
        {chartLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="text-4xl opacity-30">📈</div>
            <p className="text-sm text-slate-500">Chart data unavailable</p>
            <p className="text-xs text-slate-600">CoinGecko may be rate-limited. Try again in a moment.</p>
            <button
              type="button"
              onClick={fetchChart}
              className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {(() => {
              const showBTC = enabledCharts.includes('btc');
              const showETH = enabledCharts.includes('eth');
              const onlyBTC = showBTC && !showETH;
              const onlyETH = showETH && !showBTC;
              const bothEnabled = showBTC && showETH;
              const btcDx = bothEnabled ? -34 : 0;
              const ethDx = 0;
              const leftMargin = bothEnabled ? 38 : 38;
              const btcAxisWidth = bothEnabled ? 42 : 34;
              const ethAxisWidth = 34;

              return (
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: leftMargin, bottom: 0 }}>
                  <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="usdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ethGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>


              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} opacity={0.08} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
                tickMargin={2}
              />
              <YAxis
                yAxisId="btcAxis"
                orientation="left"
                hide={!enabledCharts.includes('btc')}
                tick={{ fill: '#7CFC00', fontSize: 11, fontWeight: 600, opacity: 0.9 }}
                axisLine={false}
                tickLine={false}
                width={btcAxisWidth}
                dx={btcDx}
                domain={[0, 1]}
                tickCount={4}
                tickFormatter={(value) => {
                  const btcMin = chartData.reduce((min, item) => (item.btc != null ? Math.min(min, item.btc) : min), Infinity);
                  const btcMax = chartData.reduce((max, item) => (item.btc != null ? Math.max(max, item.btc) : max), -Infinity);
                  if (!Number.isFinite(value) || !Number.isFinite(btcMin) || !Number.isFinite(btcMax) || btcMax <= btcMin) return '';
                  const actual = denormalizeRenderValue(value, btcMin, btcMax, 0);
                  return actual != null ? `₿${Number(actual).toFixed(2)}` : '';
                }}
              />
              <YAxis
                yAxisId="ethAxis"
                orientation="left"
                hide={!enabledCharts.includes('eth')}
                tick={{ fill: '#4ea1ff', fontSize: 11, fontWeight: 600, opacity: 0.9 }}
                axisLine={false}
                tickLine={false}
                width={ethAxisWidth}
                dx={ethDx}
                domain={[0, 1]}
                tickCount={4}
                tickFormatter={(value) => {
                  const ethMin = chartData.reduce((min, item) => (item.eth != null ? Math.min(min, item.eth) : min), Infinity);
                  const ethMax = chartData.reduce((max, item) => (item.eth != null ? Math.max(max, item.eth) : max), -Infinity);
                  if (!Number.isFinite(value) || !Number.isFinite(ethMin) || !Number.isFinite(ethMax) || ethMax <= ethMin) return '';
                  const actual = denormalizeRenderValue(value, ethMin, ethMax, -0.012);
                  return actual != null ? `Ξ${Number(actual).toFixed(1)}` : '';
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                hide={!enabledCharts.includes('usd')}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
                domain={[0, 1]}
                tickFormatter={(value) => {
                  const usdMin = chartData.reduce((min, item) => (item.usd != null ? Math.min(min, item.usd) : min), Infinity);
                  const usdMax = chartData.reduce((max, item) => (item.usd != null ? Math.max(max, item.usd) : max), -Infinity);
                  if (!Number.isFinite(value) || !Number.isFinite(usdMin) || !Number.isFinite(usdMax) || usdMax <= usdMin) return '';
                  const actual = denormalizeRenderValue(value, usdMin, usdMax, 0.012);
                  return actual != null ? `$${Number(actual).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '';
                }}
              />

              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(148,163,184,0.18)',
                  borderRadius: '14px',
                  boxShadow: '0 24px 64px rgba(15, 23, 42, 0.45)',
                  padding: '12px 14px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#f8fafc', fontWeight: 700, marginBottom: '4px' }}
                formatter={(value, name, props) => {
                  const dataKey = props?.dataKey;
                  const payload = props?.payload || {};
                  let actualValue = value;

                  if (dataKey === 'btcRender') actualValue = payload.btc;
                  if (dataKey === 'ethRender') actualValue = payload.eth;

                  if (name === 'USD') return [`$${Number(actualValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'USD'];
                  if (name === 'BTC') return [`${Number(actualValue).toFixed(6)} BTC`, 'BTC'];
                  if (name === 'ETH') return [`${Number(actualValue).toFixed(6)} ETH`, 'ETH'];
                  return [actualValue, name.toUpperCase()];
                }}
                labelFormatter={(label) => `Time: ${label}`}
              />

              {enabledCharts.includes('usd') && (
                <Area
                  type="monotone"
                  dataKey="usdRender"
                  name="USD"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#usdGradient)"
                  fillOpacity={0.12}
                  activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#0f172a' }}
                  isAnimationActive
                  animationDuration={800}
                  yAxisId="right"
                  filter="url(#glow)"
                />
              )}
              {enabledCharts.includes('btc') && (
                <Area
                  type="monotone"
                  dataKey="btcRender"
                  name="BTC"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#btcGradient)"
                  fillOpacity={0.12}
                  activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: '#0f172a' }}
                  isAnimationActive
                  animationDuration={800}
                  yAxisId="btcAxis"
                  filter="url(#glow)"
                />
              )}
              {enabledCharts.includes('eth') && (
                <Area
                  type="monotone"
                  dataKey="ethRender"
                  name="ETH"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fill="url(#ethGradient)"
                  fillOpacity={0.12}
                  activeDot={{ r: 5, stroke: '#38bdf8', strokeWidth: 2, fill: '#0f172a' }}
                  isAnimationActive
                  animationDuration={800}
                  yAxisId="ethAxis"
                  filter="url(#glow)"
                />
              )}
                </AreaChart>
              );
            })()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );

  const renderOverviewContent = () => (
    <>
      {renderPriceChart()}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
          <p className="text-sm text-slate-400">Notes</p>
          <p className="mt-2 text-lg font-semibold text-white">Personal research</p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add your note..."
            className="mt-4 h-40 w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white outline-none focus:border-orange-400"
          />
          <button type="button" className="mt-4 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
            Save Note
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
          <p className="text-sm text-slate-400">Crypto Converter</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mode</p>
              <select
                value={converterMode}
                onChange={(e) => setConverterMode(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-sm text-white outline-none"
              >
                <option>BTC→USD</option>
                <option>USD→ETH</option>
              </select>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Amount</p>
              <input
                type="number"
                value={converterValue}
                onChange={(e) => setConverterValue(Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-sm text-white outline-none"
              />
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Result</p>
              <p className="mt-2 text-xl font-semibold text-white truncate">{convertedValue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SmallCard title="% Holders" value="68%" badge="On chain" />
        <SmallCard title="Dominance" value="24.5%" badge="Market share" />
        <SmallCard title="Wallet vs Exchange" value="72 / 28" badge="Distribution" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-slate-400">Related Assets</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Similar cryptocurrencies</h3>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {['Ethereum', 'Tether', 'Cardano'].map((asset) => (
            <div key={asset} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-sm text-slate-400 truncate">{asset}</p>
              <p className="mt-2 text-lg font-semibold text-white truncate">{asset === 'Ethereum' ? 'ETH' : asset === 'Tether' ? 'USDT' : 'ADA'}</p>
              <p className="mt-1 text-sm text-slate-300">{asset === 'Ethereum' ? '18.2%' : asset === 'Tether' ? '1.0%' : '9.8%'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-slate-400">Trending Crypto</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Watchlist movers</h3>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {['Solana', 'Avalanche', 'Polygon'].map((name) => (
            <div key={name} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <div>
                <p className="text-sm text-slate-400 truncate">{name}</p>
                <p className="text-lg font-semibold text-white truncate">{name.slice(0, 3).toUpperCase()}</p>
              </div>
              <p className="text-sm text-green-400">+{(Math.random() * 8 + 1).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </div>

      <CoinMarketsTable
        coin={coin}
        limit={5}
        onSeeFullMarkets={() => setActiveTab('market')}
      />
    </>
  );

  const getCurrencyPrice = (amount, currencyKey) => {
    const key = String(currencyKey || 'usd').toLowerCase();
    if (key === 'usd' || amount === null || amount === undefined) return amount;
    if (key === 'btc') {
      return btcCoin?.price ? amount / btcCoin.price : null;
    }
    if (key === 'eth') {
      return ethCoin?.price ? amount / ethCoin.price : null;
    }
    return amount;
  };

  const displayedPrice = useMemo(
    () => getCurrencyPrice(coin?.price ?? null, selectedCurrency),
    [coin?.price, selectedCurrency, btcCoin, ethCoin]
  );
  const displayedLow = useMemo(
    () => getCurrencyPrice(coin?.low24h ?? coin?.priceLow24h ?? null, selectedCurrency),
    [coin?.low24h, coin?.priceLow24h, selectedCurrency, btcCoin, ethCoin]
  );
  const displayedHigh = useMemo(
    () => getCurrencyPrice(coin?.high24h ?? coin?.priceHigh24h ?? null, selectedCurrency),
    [coin?.high24h, coin?.priceHigh24h, selectedCurrency, btcCoin, ethCoin]
  );

  const renderPriceContent = () => (
    <>
      {renderPriceChart()}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
          <p className="text-sm text-slate-400">Current price</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(displayedPrice, selectedCurrency)}</p>
          <p className="mt-2 text-sm text-slate-400">{selectedCurrency.toUpperCase()} live market price</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
          <p className="text-sm text-slate-400">24h range ({selectedCurrency.toUpperCase()})</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(displayedLow, selectedCurrency)} - {formatCurrency(displayedHigh, selectedCurrency)}</p>
          <p className="mt-2 text-sm text-slate-400">Low / high range</p>
        </div>
      </div>
    </>
  );

  const renderMainContent = () => {
    if (activeTab === 'market') return <MarketsTab coin={coin} />;
    if (activeTab === 'analytics') return <AnalyticsDashboard coin={coin} />;
    if (activeTab === 'alerts') return <AlertsTab coin={coin} coinData={derivedStats} marketData={coin} price={coin.price} symbol={coin.symbol} />;
    if (activeTab === 'news') return <CoinNewsSection coin={coin} />;
    if (activeTab === 'price') return renderPriceContent();
    return renderOverviewContent();
  };

  const tabButtonClass = (tabValue) => `rounded-full px-3 py-2 text-sm font-medium transition ${activeTab === tabValue ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`;

  const fetchChart = useCallback(async () => {
    if (!coinGeckoId) {
      setChartData([]);
      return;
    }

    setChartLoading(true);
    setChartData([]);
    setError(null);

    try {
      const { days } = rangeMap[range];
      const usdData = await fetchComparisonHistory(coinGeckoId, 'usd', days);

      const usdSeries = [];
      const btcSeries = [];
      const ethSeries = [];

      const rawData = (usdData || [])
        .map(([timestamp, usdValue]) => {
          const usdNumber = Number(usdValue);
          const btc = currentBtcPrice ? usdNumber / currentBtcPrice : null;
          const eth = currentEthPrice ? usdNumber / currentEthPrice : null;

          if (usdNumber != null && !Number.isNaN(usdNumber)) usdSeries.push(usdNumber);
          if (btc != null && !Number.isNaN(btc)) btcSeries.push(btc);
          if (eth != null && !Number.isNaN(eth)) ethSeries.push(eth);

          return {
            timestamp,
            time: formatTimeLabel(timestamp, range),
            usd: usdNumber,
            btc,
            eth,
          };
        })
        .filter((item) => item.timestamp && !Number.isNaN(item.usd));

      const usdMin = usdSeries.length ? Math.min(...usdSeries) : 0;
      const usdMax = usdSeries.length ? Math.max(...usdSeries) : 0;
      const btcMin = btcSeries.length ? Math.min(...btcSeries) : 0;
      const btcMax = btcSeries.length ? Math.max(...btcSeries) : 0;
      const ethMin = ethSeries.length ? Math.min(...ethSeries) : 0;
      const ethMax = ethSeries.length ? Math.max(...ethSeries) : 0;

      const visualOffset = 0.012;

      const transformedData = rawData.map((item) => ({
        ...item,
        usdRender: calcRenderValue(item.usd, usdMin, usdMax, visualOffset),
        btcRender: item.btc != null ? calcRenderValue(item.btc, btcMin, btcMax, 0) : null,
        ethRender: item.eth != null ? calcRenderValue(item.eth, ethMin, ethMax, -visualOffset) : null,
      }));

      transformedData.sort((a, b) => a.timestamp - b.timestamp);

      setChartData(transformedData);
    } catch (e) {
      console.error('Unable to fetch comparison chart data:', e);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [range, coinGeckoId, id, currentBtcPrice, currentEthPrice]);

  // Primary data source: look up coin from the already-cached useCoins() list.
  // This avoids a direct CoinStats API call which requires a paid key and
  // was the primary cause of the CoinDetails error screen.
  useEffect(() => {
    if (!id || !coins.length) return;

    setLoading(true);
    setError(null);

    // Find by id, then by symbol (CoinStats ids are lowercase coin names like "bitcoin")
    const match = coins.find(
      (c) => c.id?.toLowerCase() === id.toLowerCase()
        || c.symbol?.toLowerCase() === id.toLowerCase()
        || c.name?.toLowerCase() === id.toLowerCase()
    );

    if (match) {
      setCoin(match);
      setError(null);
    } else {
      // If not in the cached list, try to find a minimal match from the id itself
      // or set a more descriptive error.
      setCoin({
        id: id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        symbol: id.toUpperCase().slice(0, 4),
        price: 0,
        priceChange1d: 0,
        marketCap: 0,
        volume: 0,
        icon: '',
      });
      setError(`Data for "${id}" is currently limited. Showing basic info.`);
    }
    setLoading(false);
  }, [id, coins]);

  useEffect(() => {
    if (!id) return;

    setChartData([]); // reset

    fetchChart();
  }, [id, range, fetchChart]);

  const derivedStats = useMemo(() => {
    if (!coin) return {};
    const marketCap = coin.marketCap || 0;
    const volume = coin.volume || 0;
    const totalSupply = coin.totalSupply || coin.availableSupply || 0;
    const circulatingSupply = coin.availableSupply || 0;
    const fdv = totalSupply && coin.price ? totalSupply * coin.price : 0;
    return {
      marketCap,
      volume,
      totalSupply,
      circulatingSupply,
      fdv,
      volumeToMarketCap: marketCap ? ((volume / marketCap) * 100).toFixed(2) : '0.00',
    };
  }, [coin]);

  const convertedValue = useMemo(() => {
    if (!coin) return '—';
    if (converterMode === 'BTC→USD') {
      return btcCoin?.price ? formatCurrency(converterValue * btcCoin.price) : '—';
    }
    return ethCoin?.price ? `${(converterValue / ethCoin.price).toFixed(6)} ETH` : '—';
  }, [converterMode, converterValue, btcCoin, ethCoin, coin]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex bg-[#0b0f1a] text-white">
          <aside className="w-[280px] shrink-0 border-r border-white/10 p-4 overflow-y-auto">
            <div className="animate-pulse rounded-2xl bg-white/5 h-32" />
          </aside>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-12 gap-6">
                <main className="col-span-12 lg:col-span-8 space-y-6">
                  <div className="animate-pulse rounded-2xl bg-white/5 h-96" />
                </main>
                <aside className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="animate-pulse rounded-2xl bg-white/5 h-64" />
                </aside>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !coin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex bg-[#0b0f1a] text-white">
          <aside className="w-[280px] shrink-0 border-r border-white/10 p-4 overflow-y-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-lg text-white mb-4">Unable to load coin details.</p>
              <p className="text-sm text-slate-400 mb-6">{error || 'Coin information is not available.'}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                Retry
              </button>
            </div>
          </aside>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-12 gap-6">
                <main className="col-span-12 lg:col-span-8 space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-lg text-white mb-4">Unable to load coin details.</p>
                    <p className="text-sm text-slate-400 mb-6">{error || 'Coin information is not available.'}</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                    >
                      Retry
                    </button>
                  </div>
                </main>
                <aside className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-lg text-white mb-4">Unable to load coin details.</p>
                    <p className="text-sm text-slate-400 mb-6">{error || 'Coin information is not available.'}</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                    >
                      Retry
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isPricePositive = coin.priceChange1d >= 0;
  const priceChangeClass = isPricePositive ? 'text-green-400' : 'text-red-400';
  const btcEquivalent = btcCoin?.price ? `${(coin.price / btcCoin.price).toFixed(6)} BTC` : '—';
  const ethEquivalent = ethCoin?.price ? `${(coin.price / ethCoin.price).toFixed(6)} ETH` : '—';
  const sliderFill = coin.priceHigh24h && coin.priceLow24h ? Math.min(100, Math.max(0, ((coin.price - coin.priceLow24h) / (coin.priceHigh24h - coin.priceLow24h)) * 100)) : 50;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0b0f1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-12 gap-6">

            {/* LEFT SIDEBAR */}
            <aside className="col-span-12 lg:col-span-3 h-auto lg:h-[calc(100vh-64px-2rem)] overflow-y-auto scroll-area rounded-3xl border border-white/10 bg-white/5 p-4 min-w-0">
              <div className="space-y-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0 pb-3 border-b border-white/10">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900">
                    {coin.icon ? (
                      <img src={coin.icon} alt={coin.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-lg text-white">?</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 truncate">Rank #{coin.rank ?? '—'}</p>
                    <h1 className="text-lg font-semibold text-white truncate">{coin.name}</h1>
                    <p className="text-xs uppercase text-slate-500 truncate">{coin.symbol}</p>
                  </div>
                </div>

                <div className="space-y-3 pb-3 border-b border-white/10">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Price</p>
                    <p className="mt-2 text-3xl font-semibold text-white truncate">{formatCurrency(coin.price)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <p className={`text-sm font-medium ${(coin.priceChange1d || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {typeof (coin.priceChange1d ?? coin.priceChange24h) === 'number' ? `${(coin.priceChange1d ?? coin.priceChange24h) >= 0 ? '+' : ''}${(coin.priceChange1d ?? coin.priceChange24h).toFixed(2)}%` : '-'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">BTC equivalent: {btcEquivalent}</p>
                  </div>
                </div>

                <div className="space-y-3 pb-3 border-b border-white/10">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Stats</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-900/50 p-3 min-w-0">
                      <p className="text-xs text-slate-400">Market Cap</p>
                      <p className="mt-1 text-sm font-medium text-white truncate">{formatLarge(coin.marketCap)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-900/50 p-3 min-w-0">
                      <p className="text-xs text-slate-400">FDV</p>
                      <p className="mt-1 text-sm font-medium text-white truncate">{formatLarge(coin.fullyDilutedValuation ?? coin.marketCap)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-900/50 p-3 min-w-0">
                      <p className="text-xs text-slate-400">Volume 24h</p>
                      <p className="mt-1 text-sm font-medium text-white truncate">{formatLarge(coin.volume)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-900/50 p-3 min-w-0">
                      <p className="text-xs text-slate-400">Vol / Mkt</p>
                      <p className="mt-1 text-sm font-medium text-white truncate">{coin.marketCap ? `${((coin.volume / coin.marketCap) * 100).toFixed(1)}%` : '-'}</p>
                    </div>
                    <div className="rounded-lg bg-slate-900/50 p-3 min-w-0">
                      <p className="text-xs text-slate-400">Total Supply</p>
                      <p className="mt-1 text-sm font-medium text-white truncate">{formatNumber(coin.totalSupply ?? coin.availableSupply)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-900/50 p-3 min-w-0">
                      <p className="text-xs text-slate-400">Circulating</p>
                      <p className="mt-1 text-sm font-medium text-white truncate">{formatNumber(coin.availableSupply)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pb-3 border-b border-white/10">
                  <p className="text-xs uppercase tracking-wider text-slate-500">24h Range</p>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 min-w-0">
                    <span className="truncate">Low</span>
                    <span className="truncate">{formatCurrency(coin.low24h ?? coin.priceLow24h ?? 0)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-orange-500" style={{ width: `${sliderFill}%` }} />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 min-w-0">
                    <span className="truncate">High</span>
                    <span className="truncate">{formatCurrency(coin.high24h ?? coin.priceHigh24h ?? 0)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400 min-w-0">
                    {[
                      { label: '1h', value: coin.priceChange1h },
                      { label: '24h', value: coin.priceChange1d },
                      { label: '7d', value: coin.priceChange1w ?? coin.priceChange7d },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0">
                        <p className={`text-xs font-medium ${typeof item.value === 'number' && item.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{typeof item.value === 'number' ? `${item.value >= 0 ? '+' : ''}${item.value.toFixed(1)}%` : '-'}</p>
                        <p className="text-xs text-slate-500 truncate">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">About</p>
                  <p className="text-sm leading-relaxed text-slate-300 break-words">{coin.description || `${coin.name} is a cryptocurrency with a market cap of ${formatLarge(coin.marketCap)} and a 24h price change of ${typeof coin.priceChange1d === 'number' ? `${coin.priceChange1d >= 0 ? '+' : ''}${coin.priceChange1d.toFixed(2)}%` : 'N/A'}.`}</p>
                </div>
              </div>
            </aside>

            {/* CENTER CONTENT */}
            <main className="col-span-12 lg:col-span-6 h-auto lg:h-[calc(100vh-64px-2rem)] overflow-y-auto scroll-area min-w-0 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
                <div className="tabs-header">
                <div className="tabs-left">
                  {leftTabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={tabButtonClass(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {showRightTabs && (
                  <div className="tabs-right">
                    {rightTabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={tabButtonClass(tab.value)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>

              {renderMainContent()}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="col-span-12 lg:col-span-3 h-auto lg:h-[calc(100vh-64px-2rem)] overflow-y-auto scroll-area space-y-4 min-w-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
                <p className="text-sm text-slate-400">Connect Wallet</p>
                <button type="button" onClick={openWalletModal} className="relative z-10 mt-4 w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
                  Connect Wallet
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full space-y-3">
                <p className="text-sm text-slate-400">Pay / Receive</p>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-3">
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Pay</label>
                  <select className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-sm text-white outline-none">
                    <option>{coin.symbol}</option>
                    <option>ETH</option>
                    <option>USDT</option>
                  </select>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-3">
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Receive</label>
                  <select className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-sm text-white outline-none">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>BTC</option>
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 via-white/5 to-slate-900 border border-white/10 rounded-2xl p-4 w-full ">
                <p className="text-sm uppercase tracking-[0.35em] text-orange-300">Go Premium</p>
                <h3 className="mt-3 text-xl font-semibold text-white">Trade smarter with premium tools</h3>
                <p className="mt-3 text-sm text-slate-300">Unlock advanced analytics, watchlist alerts, and pro-grade signals for faster decisions.</p>
                <button type="button" className="mt-4 w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
                  Upgrade Now
                </button>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}

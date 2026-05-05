import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCrypto } from '../context/CryptoContext';
import Navbar from '../components/Navbar';

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

const topTabs = ['Overview', 'Market', 'Analytics'];
const subTabs = ['Price', 'Alerts', 'News'];

const formatCurrency = (value, currency = 'USD') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  if (currency === 'USD') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const { coins } = useCrypto();
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTopTab, setActiveTopTab] = useState('Overview');
  const [activeSubTab, setActiveSubTab] = useState('Price');
  const [range, setRange] = useState('24h');
  const [currency, setCurrency] = useState('USD');
  const [noteText, setNoteText] = useState('');
  const [converterValue, setConverterValue] = useState(1);
  const [converterMode, setConverterMode] = useState('BTC→USD');

  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_COINSTATS_API_KEY;
  const btcCoin = useMemo(() => coins.find((c) => c.symbol === 'BTC'), [coins]);
  const ethCoin = useMemo(() => coins.find((c) => c.symbol === 'ETH'), [coins]);

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

  const fetchChart = useCallback(async () => {
    console.log(range);
    setChartLoading(true);
    try {
      const { days, interval } = rangeMap[range];

      let url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;

      if (interval) {
        url += `&interval=${interval}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const formatted = data.prices.map(item => ({
        time: new Date(item[0]).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        price: item[1]
      }));

      console.log(formatted);
      setChartData(formatted);
    } catch (e) {
      console.error(e);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [range, id]);

  useEffect(() => {
    const fetchCoinDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://openapiv1.coinstats.app/coins/${id}`, {
          headers: {
            'X-API-KEY': apiKey,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to load coin: ${response.status}`);
        }
        const data = await response.json();
        setCoin(data.coin ?? data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unable to fetch coin details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCoinDetails();
  }, [id, apiKey]);

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

      <div className="h-screen overflow-hidden bg-[#0b0f1a] text-white">
        <div className="h-full max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-12 gap-6 h-full">

            {/* LEFT SIDEBAR */}
            <aside className="col-span-12 lg:col-span-3 h-full overflow-y-auto pr-2 min-w-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-full overflow-hidden space-y-4 min-w-0">
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
                    <p className={`text-sm font-medium ${coin.priceChange1d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>                      {typeof coin.priceChange1d === 'number' ? `${coin.priceChange1d >= 0 ? '+' : ''}${coin.priceChange1d.toFixed(2)}%` : '-'}
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
        {/* MAIN AREA */}
        <div className="col-span-12 lg:col-span-9 h-full overflow-y-auto pr-2 min-w-0">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* CENTER */}
              <main className="col-span-1 lg:col-span-2 space-y-6 min-w-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      {topTabs.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTopTab(tab)}
                          className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeTopTab === tab ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subTabs.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveSubTab(tab)}
                          className={`rounded-full px-3 py-2 text-sm transition ${activeSubTab === tab ? 'bg-white text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Price chart</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white truncate break-words">{coin.name} price movement</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">{currency}</span>
                      <button
                        type="button"
                        onClick={() => setCurrency(currency === 'USD' ? 'ETH' : 'USD')}
                        className="rounded-full bg-orange-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                      >
                        Toggle {currency === 'USD' ? 'ETH' : 'USD'}
                      </button>
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

                  <div className="mt-4 w-full h-[350px] rounded-3xl border border-white/10 bg-slate-950/80 p-3">
                    {chartLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4}/>
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>

                          <XAxis 
                            dataKey="time"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                          />

                          <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#111827",
                              border: "1px solid #374151",
                              borderRadius: "10px"
                            }}
                            labelStyle={{ color: "#9ca3af" }}
                            formatter={(value) => [`$${value.toLocaleString()}`, "Price"]}
                          />

                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="url(#colorPrice)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-slate-400">Notes</p>
                        <p className="mt-2 text-lg font-semibold text-white">Personal research</p>
                      </div>
                    </div>
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

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
                  <p className="text-sm text-slate-400">Markets</p>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-300">
                      <thead className="border-b border-white/10 text-slate-400">
                        <tr>
                          {['Exchange', 'Pair', 'Volume', 'Volume %', 'Price', 'Last Updated'].map((title) => (
                            <th key={title} className="px-3 py-3">{title}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {['Binance', 'Coinbase', 'Kraken'].map((exchange) => (
                          <tr key={exchange} className="hover:bg-white/5 transition">
                            <td className="px-3 py-3">{exchange}</td>
                            <td className="px-3 py-3">{coin.symbol.toUpperCase()}/USD</td>
                            <td className="px-3 py-3">{formatCurrency(derivedStats.volume)}</td>
                            <td className="px-3 py-3">{(Math.random() * 25).toFixed(1)}%</td>
                            <td className="px-3 py-3">{formatCurrency(coin.price)}</td>
                            <td className="px-3 py-3">{new Date().toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </main>

              {/* RIGHT */}
              <aside className="lg:col-span-1 space-y-4 min-w-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full ">
                  <p className="text-sm text-slate-400">Connect Wallet</p>
                  <button type="button" className="mt-4 w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
                    Connect Wallet
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full  space-y-3">
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
      </div>
    </div>
  </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useCrypto } from '../context/CryptoContext';
import { fetchChartsForCoins } from '../utils/coingeckoChart';

const HomeCoinsPreview = () => {
  const { coins, loading, error } = useCrypto();
  const [charts, setCharts] = useState({});

  const navigate = useNavigate();
  const previewCoins = useMemo(() => coins.slice(0, 5), [coins]);

  // Fetch charts for top 5 coins using CoinGecko API
  useEffect(() => {
    const loadCharts = async () => {
      if (coins.length > 0) {
        const chartsData = await fetchChartsForCoins(coins, 5);
        setCharts(chartsData);
      }
    };

    loadCharts();
  }, [coins.length]);

  const formatPrice = (value) => {
    if (typeof value !== 'number') {
      return '$0.00';
    }
    if (value >= 1) {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${value.toFixed(6)}`;
  };

  const formatChange = (value) => {
    if (typeof value !== 'number') {
      return '—';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeClass = (value) =>
    typeof value !== 'number' ? 'text-slate-400' : value >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <section className="section-spacing bg-background">
      <div className="content-width">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-2">Preview</p>
              <h2 className="text-3xl font-semibold text-white">Top Cryptocurrencies</h2>
              <p className="max-w-2xl text-slate-400 mt-2">
                Explore the top 5 coins by market cap with concise pricing insights and recent momentum.
              </p>
            </div>
            <Link
              to="/coins"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
            >
              See More Coins
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/50">
            <div className="grid grid-cols-[80px_1.5fr_1fr_1fr_1fr] px-6 py-3 text-slate-400 text-sm uppercase tracking-[0.18em]">
              <div className="text-center">Rank</div>
              <div>Name</div>
              <div className="text-right">Price</div>
              <div className="text-right">24h</div>
              <div className="text-right">7D</div>
            </div>

            <div className="divide-y divide-white/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[80px_1.5fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 bg-slate-950/40 rounded-lg animate-pulse"
                  >
                    <div className="text-center">&nbsp;</div>
                    <div className="h-4 rounded bg-slate-800" />
                    <div className="h-4 rounded bg-slate-800 mx-auto w-full max-w-[90px]" />
                    <div className="h-4 rounded bg-slate-800 mx-auto w-full max-w-[80px]" />
                    <div className="w-[120px] h-[40px] flex items-center justify-end">
                      <div className="h-[2px] w-full rounded bg-slate-800" />
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="px-6 py-8 text-center text-rose-300">{error}</div>
              ) : previewCoins.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-400">Loading...</div>
              ) : (
                previewCoins.map((coin, index) => (
                  <div
                    key={coin.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/coin/${coin.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        navigate(`/coin/${coin.id}`);
                      }
                    }}
                    className="grid grid-cols-[80px_1.5fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 border-b border-white/5 cursor-pointer rounded-lg bg-transparent transition duration-200 ease-out hover:bg-white/5 hover:-translate-y-[0.5px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <div className="text-center text-sm font-semibold text-white">{index + 1}</div>
                    <div className="flex items-center gap-3">
                      {coin.icon ? (
                        <img 
                          src={coin.icon} 
                          alt={coin.name} 
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/32";
                          }}
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                          {coin.symbol?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{coin.name}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-white">{formatPrice(coin.price)}</div>
                    <div className={`text-right text-sm font-semibold ${getChangeClass(coin.priceChange1d)}`}>
                      {formatChange(coin.priceChange1d)}
                    </div>
                    <div className="w-[120px] h-[40px] flex items-center justify-end">
                      {charts[coin.symbol] && charts[coin.symbol].length > 5 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={charts[coin.symbol]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
                              stroke={
                                charts[coin.symbol][0].price < charts[coin.symbol][charts[coin.symbol].length - 1].price
                                  ? '#22c55e'
                                  : '#ef4444'
                              }
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                              connectNulls={true}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-[2px] rounded bg-white/10" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCoinsPreview;

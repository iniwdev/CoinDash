import React, { useEffect, useState } from 'react';

const CompactMarketHeatmap = ({ coin }) => {
  const [topCoins, setTopCoins] = useState([]);

  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h'
        );
        if (response.ok) {
          const data = await response.json();
          setTopCoins(data);
        }
      } catch (err) {
        console.error('Error fetching top coins:', err);
        // Fallback data
        setTopCoins([
          { symbol: 'BTC', name: 'Bitcoin', price_change_percentage_24h: 2.8 },
          { symbol: 'ETH', name: 'Ethereum', price_change_percentage_24h: -1.2 },
          { symbol: 'SOL', name: 'Solana', price_change_percentage_24h: 4.1 },
          { symbol: 'XRP', name: 'XRP', price_change_percentage_24h: -0.8 },
          { symbol: 'ADA', name: 'Cardano', price_change_percentage_24h: 1.7 },
          { symbol: 'DOGE', name: 'Dogecoin', price_change_percentage_24h: -0.4 },
          { symbol: 'AVAX', name: 'Avalanche', price_change_percentage_24h: 3.4 },
          { symbol: 'MATIC', name: 'Polygon', price_change_percentage_24h: 0.9 },
        ]);
      }
    };

    fetchTopCoins();
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Market Heatmap</p>
          <p className="mt-1 text-xs text-slate-400">Top 8 cryptocurrencies by market cap</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {topCoins.slice(0, 8).map((coinData) => {
          const change = coinData.price_change_percentage_24h || 0;
          const isUp = change >= 0;
          const intensity = Math.min(Math.abs(change) * 2, 100);

          return (
            <div
              key={coinData.symbol}
              className={`rounded-xl border border-white/5 p-3 transition-colors ${
                isUp ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'bg-rose-500/5 hover:bg-rose-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    {coinData.symbol}
                  </p>
                  <p className="truncate text-sm font-semibold text-white">{coinData.name}</p>
                </div>
                <span className={`ml-2 rounded px-1.5 py-0.5 text-xs font-semibold ${
                  isUp ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {isUp ? '+' : ''}{change.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{ width: `${Math.max(intensity, 10)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactMarketHeatmap;
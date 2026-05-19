import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { intelligenceService } from '@/services/intelligenceService';

const FALLBACK_DATA = {
  fearGreed: 68,
  fearGreedLabel: 'Greed',
  btcDominance: '54.2%',
  sentiment: 'Bullish',
  topGainer: { symbol: 'PEPE', change: '+18.4%', price: '$0.0000084' },
  topLoser: { symbol: 'ARB', change: '-5.2%', price: '$1.04' },
  trending: ['SOL', 'RNDR', 'FET'],
};

export default function MarketSnapshot() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const snapshot = await intelligenceService.getMarketSnapshot();
        setData(snapshot);
      } catch (err) {
        console.warn('[MarketSnapshot] Backend unavailable, using fallback:', err.message);
        setData(FALLBACK_DATA);
        setIsOffline(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSnapshot();

    // Re-fetch every 60s to stay in sync with the Redis TTL on the server
    const interval = setInterval(fetchSnapshot, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Render skeleton while loading
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] p-6 animate-pulse"
      >
        <div className="h-4 w-28 bg-white/10 rounded mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-20 bg-white/5 rounded-2xl" />
          <div className="h-20 bg-white/5 rounded-2xl" />
        </div>
        <div className="space-y-2">
          <div className="h-14 bg-white/5 rounded-xl" />
          <div className="h-14 bg-white/5 rounded-xl" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] p-6 flex flex-col transition-all duration-700 hover:bg-[#0A0E17]/80 hover:border-white/[0.05]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#7C879C] uppercase">Global Macro</h3>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${isOffline ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className={`text-[9px] font-bold tracking-widest uppercase ${isOffline ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isOffline ? 'Cached' : 'Live'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Fear & Greed */}
        <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl group hover:bg-white/[0.02] transition-colors">
          <p className="text-[10px] text-[#64748B] font-bold mb-1 uppercase tracking-widest">Fear & Greed</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[20px] font-bold text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
              {data.fearGreed}
            </p>
            <span className="text-[10px] text-[#10B981]/80 font-bold tracking-widest uppercase">{data.fearGreedLabel}</span>
          </div>
          <div className="w-full h-1 bg-black/40 rounded-full mt-3 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <div className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-1000" style={{ width: `${data.fearGreed}%` }}></div>
          </div>
        </div>

        {/* BTC Dominance */}
        <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl group hover:bg-white/[0.02] transition-colors">
          <p className="text-[10px] text-[#64748B] font-bold mb-1 uppercase tracking-widest">BTC Dominance</p>
          <p className="text-[20px] font-bold text-white drop-shadow-sm">{data.btcDominance}</p>
          <p className="text-[10px] text-[#7C879C] font-semibold mt-1">Sentiment: <span className="text-emerald-400">{data.sentiment}</span></p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Top Gainer */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-xl hover:from-emerald-500/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">↗</div>
            <div>
              <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest leading-none mb-1">Top Gainer</p>
              <p className="text-[12px] font-bold text-white tracking-wide">{data.topGainer.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold text-emerald-400 tracking-wide drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">{data.topGainer.change}</p>
            <p className="text-[10px] text-[#64748B] font-semibold">{data.topGainer.price}</p>
          </div>
        </div>

        {/* Top Loser */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500/5 to-transparent border border-rose-500/10 rounded-xl hover:from-rose-500/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(244,63,94,0.2)]">↘</div>
            <div>
              <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest leading-none mb-1">Top Loser</p>
              <p className="text-[12px] font-bold text-white tracking-wide">{data.topLoser.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold text-rose-400 tracking-wide drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">{data.topLoser.change}</p>
            <p className="text-[10px] text-[#64748B] font-semibold">{data.topLoser.price}</p>
          </div>
        </div>
      </div>

      {/* Trending Footer */}
      <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-3 flex-wrap">
        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest flex items-center gap-1">
          <span className="text-orange-400 text-xs drop-shadow-[0_0_5px_rgba(251,146,60,0.8)]">🔥</span> Trending:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {data.trending.map((coin, i) => (
            <span key={i} className="text-[10px] font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
              {coin}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

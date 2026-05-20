import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Sparkles, 
  ArrowUpRight, 
  Zap,
  Globe
} from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

// Mock high-fidelity data to demonstrate line smoothing and trends
const generateData = (points, startValue, volatility) => {
  let current = startValue;
  return Array.from({ length: points }).map((_, i) => {
    current = current + (Math.random() - 0.45) * volatility;
    return {
      timestamp: `Point ${i}`,
      value: current,
    };
  });
};

const mockData = {
  '1D': generateData(24, 124500, 1500),
  '7D': generateData(48, 120000, 3000),
  '1M': generateData(30, 105000, 5000),
  '3M': generateData(90, 85000, 6000),
  '1Y': generateData(120, 45000, 8000),
  'ALL': generateData(200, 10000, 10000),
};

const timeFilters = ['1D', '7D', '1M', '3M', '1Y', 'ALL'];

/**
 * Custom Tooltip with glassmorphism and premium typography
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl shadow-black/50"
      >
        <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">Portfolio Value</p>
        <p className="text-2xl font-bold text-white tracking-tight">
          ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            <Activity size={12} /> Live
          </span>
        </div>
      </motion.div>
    );
  }
  return null;
};

export default function HeroChartV2() {
  const [activeFilter, setActiveFilter] = useState('1M');
  const [liveData, setLiveData] = useState(() => mockData['1M']);
  
  // Update base data when filter changes
  useEffect(() => {
    setLiveData(mockData[activeFilter]);
  }, [activeFilter]);

  // Live price tick — appends a micro-nudge every 4s to the last data point
  // giving the chart a breathing, real-time sensation
  useEffect(() => {
    const id = setInterval(() => {
      setLiveData(prev => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        const delta = last.value * 0.0008 * (Math.random() * 2 - 1);
        const updated = [...prev.slice(0, -1), { ...last, value: Math.max(0, last.value + delta) }];
        return updated;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [activeFilter]);

  const currentValue = liveData[liveData.length - 1]?.value ?? 0;
  const startValue   = liveData[0]?.value ?? 0;
  const absoluteChange = currentValue - startValue;
  const percentageChange = startValue ? ((absoluteChange / startValue) * 100).toFixed(2) : '0.00';
  const isPositive = absoluteChange >= 0;

  // Smooth animated counter for the hero value — gives Bloomberg-style number transitions
  const animatedValue = useAnimatedCounter(currentValue, 800, 2);

  return (
    <section className="relative w-full rounded-3xl bg-[#030303] border border-white/5 overflow-hidden flex flex-col">
      {/* Cinematic Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- HEADER OVERLAYS --- */}
      {/* Z-30 ensures controls are always on top of charts and floating elements */}
      <div className="relative z-30 flex flex-col md:flex-row justify-between items-start md:items-end p-8 md:p-10 pb-0 gap-6 pointer-events-auto">
        
        {/* Massive Portfolio Value */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-gray-400 text-sm font-semibold tracking-[0.2em] uppercase">Total Balance</h2>
            {/* Live Indicator */}
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-baseline gap-4">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tabular-nums">
              ${animatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>

          {/* Gain/Loss Pill */}
          <div className="flex items-center gap-3 mt-4">
            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} shadow-lg backdrop-blur-md`}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span className="font-semibold tracking-wide">
                {isPositive ? '+' : '-'}${Math.abs(absoluteChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="opacity-75 font-medium border-l border-current pl-1.5 ml-1">
                {Math.abs(percentageChange)}%
              </span>
            </div>
            <span className="text-gray-500 text-sm font-medium">Past {activeFilter}</span>
          </div>
        </motion.div>

        {/* Time Filters - Vercel Style */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10"
        >
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg z-10 ${
                activeFilter === filter ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {activeFilter === filter && (
                <motion.div
                  layoutId="activeFilterBg"
                  className="absolute inset-0 bg-white/10 rounded-lg shadow-sm border border-white/5"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{filter}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* --- FLOATING AI INSIGHT --- */}
      {/* Positioned relative to the chart curve using percentages for responsive scaling */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.5, delay: 0.4 }
        }}
        className="absolute right-[4%] top-[45%] lg:right-[6%] lg:top-[35%] xl:right-[8%] xl:top-[28%] z-20 hidden md:flex items-start gap-3 bg-[#0a0a0a]/60 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl shadow-[0_8px_32px_rgba(16,185,129,0.15)] max-w-[260px] lg:max-w-[300px] pointer-events-auto"
      >
        <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm flex items-center gap-1.5">
            AI Insight <Zap size={14} className="text-emerald-400 fill-emerald-400/50" />
          </h4>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Portfolio volatility dropping. <span className="text-emerald-300">Ethereum</span> showing strong accumulation patterns at current support.
          </p>
        </div>
      </motion.div>

      {/* --- CHART AREA --- */}
      <div className="relative h-[400px] w-full mt-4 flex-grow z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={liveData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              {/* Premium Cinematic Gradient */}
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.35}/>
                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.0}/>
              </linearGradient>
              {/* Glow Filter for the line */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ 
                stroke: 'rgba(255,255,255,0.1)', 
                strokeWidth: 1, 
                strokeDasharray: '4 4' 
              }} 
            />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={1500}
              animationEasing="ease-out"
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </section>
  );
}

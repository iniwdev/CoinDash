import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { intelligenceService } from '@/services/intelligenceService';

// Fallback data shown if the backend is unreachable (e.g., Redis down in dev)
const FALLBACK_INSIGHTS = [
  {
    id: 'fb_1',
    type: 'WARNING',
    title: 'High Concentration Risk',
    summary: 'BTC dominates 92% of your portfolio.',
    details: 'Your portfolio is heavily skewed towards Bitcoin. Allocating 10-15% to high-momentum altcoins could significantly optimize your Sharpe ratio.',
    action: 'Diversify Now',
    color: 'from-rose-500 to-orange-500',
    icon: '⚠️',
  },
  {
    id: 'fb_2',
    type: 'OPPORTUNITY',
    title: 'Momentum Shift Detected',
    summary: 'SOL momentum is increasing rapidly.',
    details: 'On-chain DEX volumes suggest a strong bullish continuation for Solana. Key resistance at $165 has been flipped to support.',
    action: 'Trade SOL',
    color: 'from-violet-500 to-fuchsia-500',
    icon: '⚡',
  },
];

export default function AiInsightFeed() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await intelligenceService.getInsights();
        setInsights(data);
      } catch (err) {
        console.warn('[AiInsightFeed] Backend unavailable, using fallback data:', err.message);
        setError('Live AI analysis unavailable');
        setInsights(FALLBACK_INSIGHTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-[2rem] bg-[#0A0E17]/60 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] p-6 flex flex-col transition-all duration-700 hover:bg-[#0A0E17]/80 hover:border-white/[0.05]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <span className="text-[14px] drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">✨</span>
          </div>
          <h3 className="text-[13px] font-bold tracking-[0.2em] bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent uppercase drop-shadow-sm">AI Insights</h3>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-[9px] text-amber-400/70 font-bold tracking-widest uppercase">Offline</span>
          )}
          {!isLoading && (
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-amber-400' : 'bg-violet-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]'}`}></span>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-white/10 rounded-full"></div>
                  <div className="w-32 h-3 bg-white/10 rounded-full"></div>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full mb-2"></div>
                <div className="w-2/3 h-2 bg-white/10 rounded-full"></div>
              </div>
            ))}
            <div className="text-center mt-4">
              <span className="text-[10px] text-violet-400/60 font-bold uppercase tracking-widest animate-pulse">Analyzing Portfolio Matrix...</span>
            </div>
          </>
        ) : (
          <AnimatePresence>
            {insights.map((insight, index) => {
              const isExpanded = expandedId === insight.id;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                  className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl cursor-pointer group relative overflow-hidden transition-all duration-300 hover:bg-white/[0.03] hover:border-white/[0.08]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${insight.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                  <div className="flex items-start gap-3 relative z-10">
                    <div className="mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md">
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] text-white font-bold tracking-wide mb-1 group-hover:text-violet-200 transition-colors">
                        {insight.title}
                      </p>
                      <p className="text-[11px] text-[#7C879C] leading-relaxed font-medium">
                        {insight.summary}
                      </p>
                    </div>
                    <div className="text-[#475569] group-hover:text-white transition-colors">
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden relative z-10"
                      >
                        <div className="pt-4 mt-3 border-t border-white/[0.05]">
                          <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                            {insight.details}
                          </p>
                          <button
                            className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${insight.color} bg-opacity-20 border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {insight.action}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

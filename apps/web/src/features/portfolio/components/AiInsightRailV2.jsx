import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { intelligenceService } from '@/services/intelligenceService';
import {
  Brain, Sparkles, TrendingUp, TrendingDown, AlertTriangle,
  Zap, Shield, ChevronDown, ChevronRight, Activity,
  Target, Info, Clock, ArrowUpRight
} from 'lucide-react';

// ── Severity config ────────────────────────────────────────────────
const SEVERITY = {
  CRITICAL: {
    label: 'Critical', dot: 'bg-red-500', ring: 'border-red-500/30',
    bg: 'from-red-500/8 to-transparent', badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]', icon: AlertTriangle, iconColor: 'text-red-400',
  },
  WARNING: {
    label: 'Warning', dot: 'bg-amber-500', ring: 'border-amber-500/30',
    bg: 'from-amber-500/8 to-transparent', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', icon: AlertTriangle, iconColor: 'text-amber-400',
  },
  OPPORTUNITY: {
    label: 'Signal', dot: 'bg-emerald-500', ring: 'border-emerald-500/30',
    bg: 'from-emerald-500/8 to-transparent', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', icon: TrendingUp, iconColor: 'text-emerald-400',
  },
  INFO: {
    label: 'Insight', dot: 'bg-violet-500', ring: 'border-violet-500/30',
    bg: 'from-violet-500/8 to-transparent', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]', icon: Brain, iconColor: 'text-violet-400',
  },
};

// ── Rich fallback insight data ─────────────────────────────────────
const FALLBACK_INSIGHTS = [
  {
    id: 'ai_1',
    type: 'CRITICAL',
    title: 'Extreme Concentration Risk',
    summary: 'BTC dominates 92% of your portfolio.',
    details: 'A single-asset concentration above 80% dramatically increases drawdown risk. A 30% BTC correction would wipe 27.6% of your total portfolio value.',
    confidence: 94,
    action: 'Rebalance Portfolio',
    actionVariant: 'danger',
    timeAgo: '2m ago',
    explanation: [
      { label: 'Concentration Score', value: '92%', status: 'bad' },
      { label: 'Optimal Range', value: '40–60%', status: 'neutral' },
      { label: 'Risk Delta', value: '+3.2 Sharpe pts lost', status: 'bad' },
    ],
    recommendation: 'Allocate 15% to ETH and 8% to SOL to reduce concentration to ~69% while maintaining crypto exposure.',
  },
  {
    id: 'ai_2',
    type: 'OPPORTUNITY',
    title: 'SOL Momentum Accelerating',
    summary: 'On-chain activity surged 340% in 7 days.',
    details: 'Solana DEX volumes hit $4.2B weekly — a 340% surge. Active validators increased 12%. Key resistance at $165 flipped to support.',
    confidence: 81,
    action: 'Buy SOL',
    actionVariant: 'success',
    timeAgo: '14m ago',
    explanation: [
      { label: 'DEX Volume (7D)', value: '+340%', status: 'good' },
      { label: 'Validator Growth', value: '+12%', status: 'good' },
      { label: 'Resistance Flip', value: '$165 → Support', status: 'good' },
    ],
    recommendation: 'A 5–8% allocation to SOL offers asymmetric risk/reward given current momentum profile.',
  },
  {
    id: 'ai_3',
    type: 'WARNING',
    title: 'ETH Volatility Spike',
    summary: 'ETH 30-day vol up 28% above baseline.',
    details: 'ETH implied volatility is pricing in larger-than-normal moves ahead of the next protocol upgrade. Options skew suggests downside hedging pressure.',
    confidence: 73,
    action: 'Set Stop-Loss',
    actionVariant: 'warning',
    timeAgo: '1h ago',
    explanation: [
      { label: '30D Volatility', value: '+28% above avg', status: 'bad' },
      { label: 'IV Skew', value: 'Bearish', status: 'bad' },
      { label: 'Suggested Stop', value: '$2,840 (−8%)', status: 'neutral' },
    ],
    recommendation: 'Consider a trailing stop-loss at $2,840 or hedge with a put option expiring next month.',
  },
  {
    id: 'ai_4',
    type: 'INFO',
    title: 'Correlation Cluster Detected',
    summary: 'All holdings move together (ρ = 0.91).',
    details: 'Your assets have a pairwise correlation of 0.91, meaning they rise and fall together. Diversification is nearly zero despite holding multiple coins.',
    confidence: 88,
    action: 'Analyze Correlations',
    actionVariant: 'info',
    timeAgo: '3h ago',
    explanation: [
      { label: 'Avg Correlation', value: 'ρ = 0.91', status: 'bad' },
      { label: 'Ideal Target', value: 'ρ < 0.60', status: 'neutral' },
      { label: 'Effective Assets', value: '1.3 (of 4)', status: 'bad' },
    ],
    recommendation: 'Adding uncorrelated assets (e.g., stablecoins, RWA tokens) would reduce portfolio volatility without sacrificing upside.',
  },
];

// ── Portfolio health score ─────────────────────────────────────────
const HEALTH_SCORE = 61; // 0–100

function HealthRing({ score }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Healthy' : score >= 50 ? 'Moderate' : 'At Risk';
  const circumference = 2 * Math.PI * 22;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <motion.circle
            cx="28" cy="28" r="22" fill="none"
            stroke={color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.5 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] font-black text-white">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest mb-0.5">Portfolio Health</p>
        <p className="text-[14px] font-bold" style={{ color }}>{label}</p>
        <p className="text-[10px] text-[#475569] font-medium mt-0.5">4 signals active</p>
      </div>
    </div>
  );
}

// ── Confidence bar ─────────────────────────────────────────────────
function ConfidenceBar({ confidence }) {
  const color = confidence >= 85 ? '#10B981' : confidence >= 70 ? '#F59E0B' : '#6366F1';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest whitespace-nowrap">AI Confidence</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{confidence}%</span>
    </div>
  );
}

// ── Action button styles ───────────────────────────────────────────
const ACTION_STYLES = {
  danger:  'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-300 hover:shadow-[0_0_16px_rgba(239,68,68,0.2)]',
  success: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300 hover:shadow-[0_0_16px_rgba(16,185,129,0.2)]',
  warning: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300 hover:shadow-[0_0_16px_rgba(245,158,11,0.2)]',
  info:    'from-violet-500/20 to-fuchsia-500/10 border-violet-500/30 text-violet-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.2)]',
};

// ── Explanation status colors ──────────────────────────────────────
const STATUS_COLOR = { good: 'text-emerald-400', bad: 'text-red-400', neutral: 'text-[#94A3B8]' };

// ── Single insight card ────────────────────────────────────────────
function InsightCard({ insight, index, isExpanded, onToggle }) {
  const sev = SEVERITY[insight.type] || SEVERITY.INFO;
  const SevIcon = sev.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`relative rounded-2xl border bg-gradient-to-br ${sev.bg} ${sev.ring} overflow-hidden cursor-pointer transition-all duration-300 ${isExpanded ? sev.glow : ''}`}
      onClick={onToggle}
    >
      {/* Subtle animated ambient glow on the top edge */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent`} />

      {/* Card Header */}
      <div className="p-3.5 flex items-start gap-3">
        {/* Severity icon */}
        <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/8 mt-0.5`}>
          <SevIcon size={14} className={sev.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: badge + time */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-md border ${sev.badge}`}>
              {sev.label}
            </span>
            <span className="text-[9px] text-[#475569] font-medium flex items-center gap-1 ml-auto">
              <Clock size={9} />
              {insight.timeAgo}
            </span>
          </div>

          <p className="text-[12px] font-bold text-white leading-tight mb-1">{insight.title}</p>
          <p className="text-[11px] text-[#7C879C] leading-relaxed font-medium">{insight.summary}</p>

          {/* Confidence bar always visible */}
          <div className="mt-2.5">
            <ConfidenceBar confidence={insight.confidence} />
          </div>
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-[#475569] flex-shrink-0 mt-1"
        >
          <ChevronDown size={15} />
        </motion.div>
      </div>

      {/* Expandable detail panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 border-t border-white/[0.06] pt-3 space-y-3">

              {/* Details text */}
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">{insight.details}</p>

              {/* Explainability grid */}
              <div className="bg-black/20 rounded-xl p-3 border border-white/[0.04] space-y-2">
                <p className="text-[9px] font-black tracking-widest uppercase text-[#475569] flex items-center gap-1.5 mb-2">
                  <Brain size={10} className="text-violet-400" />
                  AI Signal Breakdown
                </p>
                {insight.explanation.map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B] font-medium">{row.label}</span>
                    <span className={`text-[11px] font-bold tabular-nums ${STATUS_COLOR[row.status]}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="bg-violet-500/5 rounded-xl p-3 border border-violet-500/10">
                <p className="text-[9px] font-black tracking-widest uppercase text-violet-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={10} />
                  AI Recommendation
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">{insight.recommendation}</p>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${ACTION_STYLES[insight.actionVariant]} border text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2`}
              >
                {insight.action}
                <ArrowUpRight size={12} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function AiInsightRailV2() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [expandedId, setExpandedId] = useState('ai_1'); // first card open by default
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await intelligenceService.getInsights();
        // Merge with rich fallback metadata for fields the backend may not return yet
        const enriched = data.map((d, i) => ({ ...FALLBACK_INSIGHTS[i % FALLBACK_INSIGHTS.length], ...d }));
        setInsights(enriched);
      } catch {
        setIsOffline(true);
        setInsights(FALLBACK_INSIGHTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const FILTERS = ['ALL', 'CRITICAL', 'OPPORTUNITY', 'WARNING', 'INFO'];
  const visible = activeFilter === 'ALL' ? insights : insights.filter(i => i.type === activeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-[2rem] bg-[#0A0E17]/70 backdrop-blur-3xl border border-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Brain size={16} className="text-violet-300" />
            </div>
            <div>
              <h3 className="text-[12px] font-black tracking-[0.2em] bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent uppercase">
                AI Intelligence
              </h3>
              <p className="text-[9px] text-[#475569] font-medium tracking-wide">Portfolio analysis engine</p>
            </div>
          </div>

          {/* Live / Offline indicator */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold tracking-widest uppercase ${isOffline ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOffline ? 'bg-amber-400' : 'bg-violet-400'}`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOffline ? 'bg-amber-500' : 'bg-violet-500'}`} />
            </span>
            {isOffline ? 'Cached' : 'Live'}
          </div>
        </div>

        {/* Portfolio health ring */}
        <HealthRing score={HEALTH_SCORE} />

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {FILTERS.map((f) => {
            const count = f === 'ALL' ? insights.length : insights.filter(i => i.type === f).length;
            if (count === 0 && f !== 'ALL') return null;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase transition-all ${
                  activeFilter === f
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'text-[#475569] hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                {f} {count > 0 && <span className="opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Insight Cards ────────────────────────────────────────── */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/[0.04] p-4 space-y-2">
                <div className="shimmer h-3 w-20 rounded" />
                <div className="shimmer h-4 w-full rounded" />
                <div className="shimmer h-3 w-3/4 rounded" />
                <div className="shimmer h-1 w-full rounded-full mt-3" />
              </div>
            ))}
            <div className="text-center py-2">
              <p className="text-[9px] text-violet-400/60 font-bold uppercase tracking-widest animate-pulse">
                Analyzing portfolio matrix...
              </p>
            </div>
          </>
        ) : (
          <AnimatePresence>
            {visible.map((insight, i) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                index={i}
                isExpanded={expandedId === insight.id}
                onToggle={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer: regenerate ───────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
        <span className="text-[9px] text-[#475569] font-medium">
          {insights.length} signals · updated just now
        </span>
        <button className="text-[9px] font-black tracking-widest uppercase text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 group">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Activity size={11} className="text-violet-500" />
          </motion.span>
          Refresh
        </button>
      </div>
    </motion.div>
  );
}

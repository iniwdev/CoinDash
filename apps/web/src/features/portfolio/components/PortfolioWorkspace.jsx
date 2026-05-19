import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/store/portfolioStore';
import PortfolioSummary from './PortfolioSummary';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import HoldingsTable from './HoldingsTable';
import ActivityTimeline from './ActivityTimeline';
import TradeModal from './modals/TradeModal';
import AiInsightFeed from './AiInsightFeed';
import MarketSnapshot from './MarketSnapshot';

export default function PortfolioWorkspace() {
  const {
    initializePortfolio,
    isLoading,
    summary,
    holdings,
  } = usePortfolioStore();

  useEffect(() => {
    initializePortfolio();
  }, [initializePortfolio]);

  return (
    // Root: fills viewport, scrolls vertically, clips horizontal bleed.
    // DO NOT put overflow-x-hidden here — it breaks position:sticky in children.
    // Instead, we clip it at this level only, and let the inner wrapper own the width.
    <div className="w-full min-h-screen bg-[#03040B] pt-6 pb-16 relative font-sans selection:bg-[#8B5CF6]/30">

      {/* Ambient glow — fixed so it never causes layout shifts */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-[800px] h-[400px] bg-[#8B5CF6]/[0.03] rounded-full blur-[120px] z-0" />

      {/* Width-constrained inner shell — owns horizontal padding */}
      <div className="relative z-10 w-full max-w-[1920px] 2xl:max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1A2133] pb-6 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[26px] md:text-[30px] font-bold text-[#F8FAFC] tracking-tight mb-1 flex items-center gap-3"
            >
              Intelligence Workspace
              <span className="text-2xl inline-block">👋</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#7C879C] text-sm font-medium tracking-wide"
            >
              Proactive insights, real-time valuation, and automated analytics.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="flex items-center bg-[#0A0E17] rounded-lg p-1 border border-[#1A2133]">
              {['1D', '7D', '1M', '3M', '1Y', 'ALL'].map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1.5 text-[11px] font-bold tracking-wider rounded-md transition-all duration-200 ${
                    filter === '1M'
                      ? 'bg-[#8B5CF6]/10 text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.1)]'
                      : 'text-[#7C879C] hover:text-[#F8FAFC] hover:bg-white/5'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button className="p-2 bg-[#0A0E17] rounded-lg border border-[#1A2133] text-[#7C879C] hover:text-[#F8FAFC] hover:border-[#8B5CF6]/50 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* ── 12-COLUMN WORKSPACE GRID ──────────────────────────────────
            9 cols LEFT + 3 cols RIGHT on all lg+ screens.
            The 9/3 split gives the canvas 75% and rail 25%.
            items-start prevents the right rail from stretching to canvas height.
        ──────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">

          {/* ── LEFT MAIN CANVAS (9 cols) ─────────────────────────────────
            min-w-0: prevents grid child from blowing out its column track.
            overflow-hidden: clips any children that momentarily overflow
            during animation without creating a page-level scrollbar.
          */}
          <div className="lg:col-span-9 min-w-0 overflow-hidden space-y-6 xl:space-y-8">

            {/* 1. Intelligence KPI Cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PortfolioSummary summary={summary} holdings={holdings} isLoading={isLoading} />
            </motion.div>

            {/* 2. Massive Hero Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PortfolioPerformanceChart summary={summary} />
            </motion.div>

            {/* 3. Enhanced Holdings Table
                min-w-0 is critical — without it the table can blow out the grid column
                because the inner table has min-w-[1100px].
            */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="min-w-0"
            >
              <HoldingsTable holdings={holdings} isLoading={isLoading} />
            </motion.div>

          </div>

          {/* ── RIGHT INTELLIGENCE RAIL (3 cols) ──────────────────────
              self-start sticky: pins the rail at the top while scrolling.
              Inner div: max-h bounded to viewport so if rail content is
              taller than the visible area, it scrolls internally (hidden).
              If shorter, no scroll appears — content just sits naturally.
              The grid track (sized by the taller left canvas) ensures the
              sticky element never pokes below the left section's last line.
          */}
          <div className="lg:col-span-3 self-start sticky top-[73px]">
            <div
              className="flex flex-col gap-4 overflow-y-auto"
              style={{
                maxHeight: 'calc(100vh - 73px)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <AiInsightFeed />
              <MarketSnapshot />
              <ActivityTimeline />
            </div>
          </div>

        </div>
      </div>

      <TradeModal />
    </div>
  );
}

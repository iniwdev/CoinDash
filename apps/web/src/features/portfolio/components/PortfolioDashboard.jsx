import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/store/portfolioStore';
import PortfolioSummary from './PortfolioSummary';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import AllocationDonut from './AllocationDonut';
import HoldingsTable from './HoldingsTable';
import RecentTransactions from './RecentTransactions';
import TradeModal from './modals/TradeModal';

export default function PortfolioDashboard() {
  const { 
    initializePortfolio, 
    isLoading, 
    summary, 
    holdings,
    transactions
  } = usePortfolioStore();

  useEffect(() => {
    initializePortfolio();
  }, [initializePortfolio]);

  return (
    <div className="min-h-screen bg-[#03040B] pt-8 pb-24 relative font-sans selection:bg-[#8B5CF6]/30 overflow-x-hidden">
      
      {/* Premium ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[800px] h-[400px] bg-[#8B5CF6]/[0.03] rounded-full blur-[120px]" />
      
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1A2133] pb-6 mb-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[28px] md:text-[32px] font-bold text-[#F8FAFC] tracking-tight mb-2 flex items-center gap-3"
            >
              Portfolio Overview <span className="text-2xl animate-wave origin-[70%_70%] inline-block">👋</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#7C879C] text-sm font-medium tracking-wide"
            >
              Track your crypto wealth and performance in real-time.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Time Filters */}
            <div className="flex items-center bg-[#0A0E17] rounded-lg p-1 border border-[#1A2133] shadow-sm">
              {['1D', '7D', '1M', '3M', '1Y', 'ALL'].map((filter) => (
                <button
                  key={filter}
                  className={`px-3.5 py-1.5 text-[11px] font-bold tracking-wider rounded-md transition-all duration-200 ${
                    filter === '1M' 
                      ? 'bg-[#8B5CF6]/10 text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.1)]' 
                      : 'text-[#7C879C] hover:text-[#F8FAFC] hover:bg-white/5'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {/* Calendar Button */}
            <button className="p-2 bg-[#0A0E17] rounded-lg border border-[#1A2133] text-[#7C879C] hover:text-[#F8FAFC] hover:border-[#8B5CF6]/50 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
          </motion.div>
        </div>

        {/* Top Metric Cards (Row 1) */}
        <PortfolioSummary summary={summary} holdings={holdings} isLoading={isLoading} />

        {/* Charts (Row 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 xl:col-span-9"
          >
            <PortfolioPerformanceChart summary={summary} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 xl:col-span-3 min-h-[420px]"
          >
            <AllocationDonut holdings={holdings} summary={summary} />
          </motion.div>
        </div>

        {/* Tables (Row 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-8 xl:col-span-9 h-full"
          >
            <HoldingsTable holdings={holdings} isLoading={isLoading} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-4 xl:col-span-3 min-h-[500px]"
          >
            <RecentTransactions transactions={transactions} />
          </motion.div>
        </div>

      </div>

      <TradeModal />
    </div>
  );
}

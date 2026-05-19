import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/store/portfolioStore';
import PortfolioSummary from './PortfolioSummary';
import AllocationDonut from './AllocationDonut';
import HoldingsTable from './HoldingsTable';
import TradeModal from './modals/TradeModal';

export default function PortfolioDashboard() {
  const { 
    initializePortfolio, 
    isLoading, 
    summary, 
    holdings,
    activePortfolio
  } = usePortfolioStore();

  useEffect(() => {
    initializePortfolio();
  }, [initializePortfolio]);

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-600/10 to-transparent blur-3xl" />
      
      <div className="content-width relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2"
            >
              {activePortfolio ? activePortfolio.name : 'Portfolio Dashboard'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400"
            >
              Manage your holdings, track real-time performance, and execute trades.
            </motion.p>
          </div>
        </div>

        {/* Top Metrics */}
        <PortfolioSummary summary={summary} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Holdings Table */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HoldingsTable holdings={holdings} isLoading={isLoading} />
            </motion.div>
          </div>

          {/* Right Column - Analytics & Insights */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="h-[400px]"
            >
              <AllocationDonut holdings={holdings} />
            </motion.div>
          </div>
          
        </div>
      </div>

      <TradeModal />
    </div>
  );
}

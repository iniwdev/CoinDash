import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from "@/store/uiStore";
import { useAi } from "@/context/AiContext";

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const cardHover = {
  scale: 1.08,
  y: -10,
  boxShadow: '0_0_100px_rgba(124,58,237,0.4), 0_0_100px_rgba(245,158,11,0.2)',
  transition: { duration: 0.3, ease: 'easeOut' },
};

const PortfolioWalletCards = () => {
  const { openAiModal } = useAi();
  const { openWalletModal } = useUIStore();
  const navigate = useNavigate();

  const handleWalletNavigation = (walletPath) => {
    // Scroll to top before navigation
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    
    // Navigate to wallet page
    navigate(walletPath);
  };

  return (
    <motion.div
      className="mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <motion.div
        className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_50px_rgba(124,58,237,0.35)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]"
        variants={staggerItem}
        whileHover={cardHover}
        onClick={() => handleWalletNavigation('/wallet/binance')}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
              <svg className="h-8 w-8 text-yellow-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Exchange</p>
              <p className="mt-1 text-lg font-semibold text-white">Binance</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-300">Live</span>
        </div>
        <div className="mt-4 h-px w-full bg-white/10" />
        <div className="mt-5 text-sm font-semibold text-primary">Connect →</div>
      </motion.div>

      <motion.div
        className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_50px_rgba(124,58,237,0.35)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]"
        variants={staggerItem}
        whileHover={cardHover}
        onClick={() => handleWalletNavigation('/wallet/coinbase-wallet')}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
              <svg className="h-8 w-8 text-orange-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Wallet</p>
              <p className="mt-1 text-lg font-semibold text-white">Coinbase Wallet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('AI badge clicked');
              openAiModal();
            }}
            className="rounded-full bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-sky-200 hover:bg-sky-400/20 transition-colors cursor-pointer"
          >
            AI
          </button>
        </div>
        <div className="mt-4 h-px w-full bg-white/10" />
        <div className="mt-5 text-sm font-semibold text-primary">Connect →</div>
      </motion.div>

      <motion.div
        className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_50px_rgba(124,58,237,0.35)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]"
        variants={staggerItem}
        whileHover={cardHover}
        onClick={() => handleWalletNavigation('/wallet/trust-wallet')}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/20 to-sky-500/10 border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
              <svg className="h-8 w-8 text-cyan-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Wallet</p>
              <p className="mt-1 text-lg font-semibold text-white">Trust Wallet</p>
            </div>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-cyan-200">Real-time</span>
        </div>
        <div className="mt-4 h-px w-full bg-white/10" />
        <div className="mt-5 text-sm font-semibold text-primary">Connect →</div>
      </motion.div>

      <motion.div
        className="group relative p-6 rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(124,58,237,0.3)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(124,58,237,0.15)]"
        variants={staggerItem}
        whileHover={cardHover}
        onClick={openWalletModal}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-400/30 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
            <svg className="h-8 w-8 text-violet-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">More</p>
            <p className="mt-1 text-lg font-semibold text-white">Add other sources</p>
          </div>
        </div>
        <div className="mt-6 text-sm font-semibold text-primary">Connect →</div>
      </motion.div>
    </motion.div>
  );
};

export default PortfolioWalletCards;

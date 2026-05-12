import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from "@/features/market-data/pages/Home";
import CoinDetails from "@/features/market-data/pages/CoinDetails";
import CoinAlerts from "@/features/alerts/pages/CoinAlerts";
import CoinsPage from "@/features/market-data/pages/CoinsPage";
import Portfolio from "@/features/portfolio/pages/Portfolio";
import Watchlist from "@/features/watchlist/pages/Watchlist";
import WalletConnectPage from "@/features/portfolio/pages/WalletConnectPage";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/features/auth/components/AuthModal";
import WalletConnectModal from "@/features/portfolio/components/WalletConnectModal";
import GlobalAiButton from "@/components/ui/GlobalAiButton";
import CoinDashAI from "@/features/ai-chat/components/CoinDashAI";
import { useAi } from "@/context/AiContext";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from 'react';

function App() {
  const { isAIModalOpen, closeAiModal } = useAi();
  const { token, checkAuth } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth(token);
    }
  }, []);

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coin/:id" element={<CoinDetails />} />
          <Route path="/coin/:id/alerts" element={<CoinAlerts />} />
          <Route path="/coins" element={<CoinsPage />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/wallet/:walletId" element={<WalletConnectPage />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
      <WalletConnectModal />
      <GlobalAiButton />
      <AnimatePresence>
        {isAIModalOpen && (
          <CoinDashAI key="coindash-ai-modal" onClose={closeAiModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

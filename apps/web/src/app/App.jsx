import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
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
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { useAi } from "@/context/AiContext";
import { useAuthStore } from "@/store/authStore";

function App() {
  const { isAIModalOpen, closeAiModal } = useAi();
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Validate persisted token once on app boot (after hydration)
  useEffect(() => {
    if (hasHydrated) {
      console.log('[App] Store hydrated, restoring session...');
      
      // Safeguard: force unauthenticated if restoration hangs for > 10s
      const timeout = setTimeout(() => {
        const currentStatus = useAuthStore.getState().authStatus;
        if (currentStatus === 'loading' || currentStatus === 'idle') {
          console.warn('[App] Session restoration timed out');
          useAuthStore.setState({ authStatus: 'unauthenticated' });
        }
      }, 10000);

      restoreSession().finally(() => clearTimeout(timeout));
    }
  }, [hasHydrated, restoreSession]);

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          {/* ── Public routes ──────────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/coin/:id" element={<CoinDetails />} />
          <Route path="/coin/:id/alerts" element={<CoinAlerts />} />
          <Route path="/coins" element={<CoinsPage />} />

          {/* ── Protected routes ───────────────────────────────────────── */}
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route
            path="/wallet/:walletId"
            element={
              <ProtectedRoute>
                <WalletConnectPage />
              </ProtectedRoute>
            }
          />
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

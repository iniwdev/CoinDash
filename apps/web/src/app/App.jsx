import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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

// ── Server wakeup banner ──────────────────────────────────────────────────────
// Shows a premium toast when the backend is cold-starting (Render free tier).
// Polls /health every 3 seconds until the server responds, then auto-hides.
function ServerWakeupBanner() {
  const [waking, setWaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
      : '';

    let attempts = 0;
    let intervalId;
    let timerIntervalId;

    const ping = async () => {
      attempts++;
      try {
        const res = await fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          setWaking(false);
          clearInterval(intervalId);
          clearInterval(timerIntervalId);
          return;
        }
      } catch {
        // Server not yet ready
      }
      // Only show banner after second failed attempt — avoids flash on fast networks
      if (attempts >= 2) setWaking(true);
    };

    ping();
    intervalId = setInterval(ping, 3000);
    timerIntervalId = setInterval(() => setElapsed(e => e + 1), 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(timerIntervalId);
    };
  }, []);

  if (!waking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.97) 100%)',
        border: '1px solid rgba(251,146,60,0.3)',
        borderRadius: '16px',
        padding: '14px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(251,146,60,0.1)',
        minWidth: '320px',
      }}
    >
      <div style={{
        width: '20px', height: '20px', flexShrink: 0,
        border: '2px solid rgba(251,146,60,0.2)',
        borderTop: '2px solid #fb923c',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div>
        <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '13px' }}>
          🚀 Server waking up…
        </div>
        <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
          Free tier cold start — {elapsed}s elapsed. Data loads automatically.
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const { isAIModalOpen, closeAiModal } = useAi();
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Validate persisted token once on app boot (after hydration)
  useEffect(() => {
    if (hasHydrated) {
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

      {/* Server wakeup notification for Render free-tier cold starts */}
      <AnimatePresence>
        <ServerWakeupBanner key="wakeup-banner" />
      </AnimatePresence>

      <AnimatePresence>
        {isAIModalOpen && (
          <CoinDashAI key="coindash-ai-modal" onClose={closeAiModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

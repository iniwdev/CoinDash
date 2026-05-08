import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import CoinDetails from './pages/CoinDetails';
import CoinAlerts from './pages/CoinAlerts';
import CoinsPage from './pages/CoinsPage';
import Portfolio from './pages/Portfolio';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import WalletConnectModal from './components/WalletConnectModal';
import GlobalAiButton from './components/global/GlobalAiButton';
import CoinDashAI from './components/ai/CoinDashAI';
import { useAi } from './context/AiContext.jsx';

function App() {
  const { isAIModalOpen, closeAiModal } = useAi();

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coin/:id" element={<CoinDetails />} />
          <Route path="/coin/:id/alerts" element={<CoinAlerts />} />
          <Route path="/coins" element={<CoinsPage />} />
          <Route path="/portfolio" element={<Portfolio />} />
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

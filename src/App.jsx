import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CoinDetails from './pages/CoinDetails';
import CoinsPage from './pages/CoinsPage';
import Portfolio from './pages/Portfolio';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import WalletConnectModal from './components/WalletConnectModal';

function App() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coin/:id" element={<CoinDetails />} />
          <Route path="/coins" element={<CoinsPage />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
      <WalletConnectModal />
    </div>
  );
}

export default App;

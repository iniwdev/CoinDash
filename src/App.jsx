import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CoinDetails from './pages/CoinDetails';
import CoinsPage from './pages/CoinsPage';
import Portfolio from './pages/Portfolio';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coin/:id" element={<CoinDetails />} />
          <Route path="/coins" element={<CoinsPage />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

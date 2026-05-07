import { useEffect, useMemo, useState } from 'react';
import { useSearch } from '../context/SearchContext.jsx';
import Layout from '../components/Layout';
import StatsCards from '../components/StatsCards';
import Tabs from '../components/Tabs';
import CoinsTable from '../components/CoinsTable';
import Pagination from '../components/Pagination';
import { fetchChartsForCoins } from '../utils/coingeckoChart';
import './CoinsPage.css';

const CoinsPage = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('cryptocurrencies');
  const [charts, setCharts] = useState({});
  const { query } = useSearch();

  const coinsPerPage = 10;

  const tabs = [
    { id: 'cryptocurrencies', label: 'Cryptocurrencies' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'exchanges', label: 'Exchanges' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'categories', label: 'Categories' },
  ];

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://openapiv1.coinstats.app/coins?limit=100', {
          headers: {
            'X-API-KEY': import.meta.env.VITE_COINSTATS_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`CoinStats API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        let coinsList = [];
        if (Array.isArray(data)) {
          coinsList = data;
        } else if (Array.isArray(data.coins)) {
          coinsList = data.coins;
        } else if (Array.isArray(data.result)) {
          coinsList = data.result;
        } else if (Array.isArray(data.data)) {
          coinsList = data.data;
        }

        const normalizedCoins = coinsList.map((coin, index) => ({
          id: coin.id || `coin-${index}`,
          rank: coin.rank ?? index + 1,
          name: coin.name || 'Unknown',
          symbol: coin.symbol || '---',
          price: typeof coin.price === 'number' ? coin.price : 0,
          priceChange1h: typeof coin.priceChange1h === 'number' ? coin.priceChange1h : 0,
          priceChange24h: typeof coin.priceChange24h === 'number' ? coin.priceChange24h : coin.priceChange1d ?? 0,
          priceChange7d: typeof coin.priceChange7d === 'number' ? coin.priceChange7d : coin.priceChange1w ?? 0,
          marketCap: coin.marketCap ?? 0,
          volume: coin.volume ?? 0,
          icon: coin.icon || coin.image || coin.iconUrl || '',
          sparkline: Array.isArray(coin.sparkline) ? coin.sparkline : [],
        }));

        setCoins(normalizedCoins);
      } catch (fetchError) {
        console.error('CoinsPage fetch error:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load coins');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Fetch charts for top 20 coins using CoinGecko API
  useEffect(() => {
    const loadCharts = async () => {
      if (coins.length > 0) {
        const chartsData = await fetchChartsForCoins(coins, 20);
        setCharts(chartsData);
      }
    };

    loadCharts();
  }, [coins.length]); // Only re-run when coins length changes

  const filteredCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return coins;
    }

    return coins.filter((coin) => {
      const name = String(coin.name ?? '').toLowerCase();
      const symbol = String(coin.symbol ?? '').toLowerCase();
      return name.includes(normalizedQuery) || symbol.includes(normalizedQuery);
    });
  }, [coins, query]);

  const selectedCoins = useMemo(() => {
    if (query.trim()) {
      return filteredCoins;
    }

    if (activeTab === 'favorites') {
      return coins.filter((_, index) => index < 10);
    }

    if (activeTab === 'exchanges') {
      return coins.slice(0, 10);
    }

    if (activeTab === 'heatmap') {
      return coins.slice(0, 10);
    }

    if (activeTab === 'categories') {
      return coins.slice(0, 10);
    }

    return coins;
  }, [activeTab, coins, filteredCoins, query]);

  useEffect(() => {
    if (currentPage > 1 && selectedCoins.length <= (currentPage - 1) * coinsPerPage) {
      setCurrentPage(1);
    }
  }, [selectedCoins.length, currentPage]);

  const paginatedCoins = useMemo(() => {
    const startIndex = (currentPage - 1) * coinsPerPage;
    return selectedCoins.slice(startIndex, startIndex + coinsPerPage);
  }, [selectedCoins, currentPage]);

  const totalPages = Math.max(1, Math.ceil(selectedCoins.length / coinsPerPage));

  const marketStats = useMemo(() => {
    if (!coins.length) {
      return {
        marketCap: 0,
        marketCapChange: 0,
        volume24h: 0,
        volumeChange: 0,
        btcDominance: 0,
        btcDominanceChange: 0,
      };
    }

    const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.marketCap || 0), 0);
    const totalVolume = coins.reduce((sum, coin) => sum + (coin.volume || 0), 0);
    const btcCoin = coins.find((coin) => coin.symbol === 'BTC');
    const btcDominance = btcCoin && totalMarketCap > 0 ? (btcCoin.marketCap / totalMarketCap) * 100 : 0;

    return {
      marketCap: totalMarketCap,
      marketCapChange: 2.4,
      volume24h: totalVolume,
      volumeChange: -1.3,
      btcDominance: btcDominance,
      btcDominanceChange: 0.8,
    };
  }, [coins]);

  return (
    <Layout>
      <div className="coins-page section-spacing bg-background">
        <div className="content-width">
          <div className="coins-page__hero">
            <p className="uppercase tracking-[0.3em] text-sm text-blue-300 mb-4">Market data</p>
            <h1 className="coins-page__hero-title">
              Today's Crypto Prices by Market Cap
            </h1>
            <p className="coins-page__hero-copy">
              Explore live market data for the top cryptocurrencies with premium insights, volume, dominance, and recent price momentum.
            </p>
          </div>

          <StatsCards stats={marketStats} />
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="coins-page__table-wrapper">
            <CoinsTable coins={paginatedCoins} loading={loading} error={error} charts={charts} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoinsPage;

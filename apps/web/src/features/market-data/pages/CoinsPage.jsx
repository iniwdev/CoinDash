import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUIStore } from "@/store/uiStore";
import { useWatchlistStore } from "@/store/useWatchlistStore";
import Layout from "@/components/layout/Layout";
import StatsCards from "@/features/market-data/components/StatsCards";
import Tabs from "@/features/market-data/components/Tabs";
import CoinsTable from "@/features/market-data/components/CoinsTable";
import ExchangesTable from "@/features/market-data/components/ExchangesTable";
import Heatmap from "@/features/market-data/components/Heatmap";
import Pagination from "@/components/ui/Pagination";
import { fetchChartsForCoins } from "@/utils/coingeckoChart";
import { useCoins } from "@/features/market-data/api/useCoins";
import './CoinsPage.css';

const CoinsPage = () => {
  const { data: coins = [], isLoading: loading, error } = useCoins();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('cryptocurrencies');
  const [exchanges, setExchanges] = useState([]);
  const watchlist = useWatchlistStore((state) => state.watchlist);
  const toggleWatchlist = useWatchlistStore((state) => state.toggleWatchlist);
  const watchlistIds = useMemo(() => new Set(watchlist.map((item) => item.id)), [watchlist]);
  const [exchangesLoading, setExchangesLoading] = useState(true);
  const [exchangesError, setExchangesError] = useState(null);
  const [charts, setCharts] = useState({});
  const { searchQuery: query } = useUIStore();

  const coinsPerPage = 10;

  const tabs = [
    { id: 'cryptocurrencies', label: 'Cryptocurrencies' },
    { id: 'favorites', label: `Favorites${watchlist.length > 0 ? ` (${watchlist.length})` : ''}` },
    { id: 'exchanges', label: 'Exchanges' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'categories', label: 'Categories' },
  ];


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

  const loadExchanges = useCallback(async () => {
    try {
      setExchangesLoading(true);
      setExchangesError(null);

      // Use the proxied backend endpoint instead of direct CoinGecko call
      const response = await fetch('/api/market/exchanges?per_page=250&page=1');
      if (!response.ok) {
        throw new Error(`Exchanges API error: ${response.status}`);
      }

      const data = await response.json();
      const normalized = Array.isArray(data)
        ? data.map((exchange, index) => {
            const volume24h = typeof exchange.trade_volume_24h_btc === 'number' ? exchange.trade_volume_24h_btc : 0;
            const weeklyMultiplier = 6.8 + ((index % 5) * 0.12);
            const monthlyMultiplier = 27 + ((index % 6) * 0.35);
            const change24h = typeof exchange.trust_score === 'number' ? (Math.random() * 2 - 1) : 0; // Mock change if not provided

            return {
              id: exchange.id,
              name: exchange.name,
              image: exchange.image,
              rank: exchange.trust_score_rank ?? index + 1,
              trustScoreRank: exchange.trust_score_rank ?? Number.MAX_SAFE_INTEGER,
              volume24h,
              volume7d: volume24h * weeklyMultiplier,
              volume30d: volume24h * monthlyMultiplier,
              markets: typeof exchange.trading_pairs === 'number' ? exchange.trading_pairs : 0,
              founded: exchange.year_established || '—',
              change24h: change24h,
              url: exchange.url || '#',
            };
          })
        : [];

      const sorted = normalized.sort((a, b) => (a.trustScoreRank || Number.MAX_SAFE_INTEGER) - (b.trustScoreRank || Number.MAX_SAFE_INTEGER));
      setExchanges(sorted);
    } catch (fetchError) {
      console.error('Exchanges fetch error:', fetchError);
      setExchangesError('Failed to load exchanges. Please try again.');
    } finally {
      setExchangesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExchanges();
  }, [loadExchanges]);

  const toggleFavorite = (coin) => {
    toggleWatchlist(coin);
  };

  useEffect(() => {
    console.log('Watchlist (CoinsPage):', watchlist);
  }, [watchlist]);

  const filteredExchanges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return exchanges;

    return exchanges.filter((exchange) => {
      const name = String(exchange.name ?? '').toLowerCase();
      const country = String(exchange.country ?? '').toLowerCase();
      return name.includes(normalizedQuery) || country.includes(normalizedQuery);
    });
  }, [exchanges, query]);

  const selectedCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const baseCoins = (() => {
      if (activeTab === 'favorites') {
        return coins.filter((coin) => watchlistIds.has(coin.id));
      }
      if (activeTab === 'heatmap') {
        return coins.slice(0, 10);
      }
      if (activeTab === 'categories') {
        return coins.slice(0, 10);
      }
      return coins;
    })();

    if (!normalizedQuery) {
      return baseCoins;
    }

    return baseCoins.filter((coin) => {
      const name = String(coin.name ?? '').toLowerCase();
      const symbol = String(coin.symbol ?? '').toLowerCase();
      return name.includes(normalizedQuery) || symbol.includes(normalizedQuery);
    });
  }, [activeTab, coins, query, watchlistIds]);

  useEffect(() => {
    const currentLength = activeTab === 'exchanges' ? filteredExchanges.length : selectedCoins.length;
    if (currentPage > 1 && currentLength <= (currentPage - 1) * coinsPerPage) {
      setCurrentPage(1);
    }
  }, [selectedCoins.length, filteredExchanges.length, currentPage, activeTab]);

  const paginatedCoins = useMemo(() => {
    const startIndex = (currentPage - 1) * coinsPerPage;
    return selectedCoins.slice(startIndex, startIndex + coinsPerPage);
  }, [selectedCoins, currentPage]);

  const paginatedExchanges = useMemo(() => {
    const startIndex = (currentPage - 1) * coinsPerPage;
    return filteredExchanges.slice(startIndex, startIndex + coinsPerPage);
  }, [filteredExchanges, currentPage]);

  const totalPages = Math.max(1, Math.ceil(selectedCoins.length / coinsPerPage));
  const exchangesTotalPages = Math.max(1, Math.ceil(filteredExchanges.length / coinsPerPage));

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

          {activeTab === 'exchanges' ? (
            <div className="coins-page__table-wrapper px-0">
              <ExchangesTable
                exchanges={paginatedExchanges}
                loading={exchangesLoading}
                error={exchangesError}
                noResults={!exchangesLoading && !exchangesError && filteredExchanges.length === 0}
                onRetry={loadExchanges}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={exchangesTotalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : activeTab === 'heatmap' ? (
            <Heatmap />
          ) : (
            <div className="coins-page__table-wrapper">
              <CoinsTable
                coins={paginatedCoins}
                loading={loading}
                error={error}
                charts={charts}
                onToggleFavorite={toggleFavorite}
                activeTab={activeTab}
              />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CoinsPage;

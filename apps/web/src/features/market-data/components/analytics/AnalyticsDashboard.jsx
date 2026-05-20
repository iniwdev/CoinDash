import { useEffect, useMemo, useState } from 'react';
import AnalyticsHero from "@/features/market-data/components/analytics/AnalyticsHero";
import CompactMetrics from "@/features/market-data/components/analytics/CompactMetrics";
import TradingAnalytics from "@/features/market-data/components/analytics/TradingAnalytics";
import CompactTechnicalIndicators from "@/features/market-data/components/analytics/CompactTechnicalIndicators";
import CompactMarketHeatmap from "@/features/market-data/components/analytics/CompactMarketHeatmap";
import CompactCryptoNews from "@/features/market-data/components/analytics/CompactCryptoNews";
import AnalyticsLoader from "@/features/market-data/components/analytics/AnalyticsLoader";
import {
  fetchCoinHistoricalPrices,
  fetchCoinMarketData,
  fetchCoinNews,
  fetchGlobalData,
  fetchFearGreedIndex,
} from "@/utils/coinDataFetcher";
import {
  calculateRSI,
  calculateMACD,
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateVolatility,
  determineTrend,
} from "@/utils/technicalIndicators";

const AnalyticsDashboard = ({ coin }) => {
  const [coinData, setCoinData] = useState(null);
  const [globalData, setGlobalData] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [technicalData, setTechnicalData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Use allSettled so a single rate-limited or failed call doesn't crash everything
        const [marketRes, globalRes, fearGreedRes, pricesRes] = await Promise.allSettled([
          fetchCoinMarketData(coin.id),
          fetchGlobalData(),
          fetchFearGreedIndex(),
          fetchCoinHistoricalPrices(coin.id, 90),
        ]);

        const marketData = marketRes.status === 'fulfilled' ? marketRes.value : null;
        const globalData  = globalRes.status  === 'fulfilled' ? globalRes.value  : null;
        const fearGreed   = fearGreedRes.status === 'fulfilled' ? fearGreedRes.value : null;
        const prices      = pricesRes.status === 'fulfilled' ? pricesRes.value : [];

        if (marketRes.status === 'rejected')  console.warn('[Analytics] marketData failed:', marketRes.reason);
        if (globalRes.status === 'rejected')  console.warn('[Analytics] globalData failed:', globalRes.reason);
        if (pricesRes.status === 'rejected')  console.warn('[Analytics] priceHistory failed:', pricesRes.reason);

        setCoinData(marketData);
        setGlobalData(globalData);
        setFearGreed(fearGreed);

        // Calculate technical indicators only if we have enough price history
        if (Array.isArray(prices) && prices.length >= 26) {
          const rsi = calculateRSI(prices);
          const macd = calculateMACD(prices);
          const sma = calculateSMA(prices);
          const ema = calculateEMA(prices);
          const bb = calculateBollingerBands(prices);
          const volatility = calculateVolatility(prices);
          const trend = determineTrend(rsi, macd, sma, ema, prices[prices.length - 1]);

          setTechnicalData({
            rsi, macd, sma, ema, bb, volatility, trend,
            currentPrice: prices[prices.length - 1],
            priceHistory: prices,
          });
        }

        // Fetch news separately (non-blocking — don't let it stall the dashboard)
        fetchCoinNews(coin.id, 3)
          .then(setNews)
          .catch((e) => console.warn('[Analytics] news fetch failed:', e));

      } catch (err) {
        console.error('[Analytics] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (coin?.id) {
      fetchAllData();
    }
  }, [coin]);

  if (loading) {
    return <AnalyticsLoader />;
  }

  return (
    <div className="space-y-3">
      {/* Compact hero with coin name */}
      <AnalyticsHero coin={coinData} />

      {/* Compact metrics grid - 4 cards in 2 columns on mobile, 4 on desktop */}
      <CompactMetrics coin={coinData} globalData={globalData} fearGreed={fearGreed} />

      {/* Trading analytics with smaller chart */}
      <TradingAnalytics coin={coin} technicalData={technicalData} />

      {/* Compact technical indicators - horizontal layout */}
      <CompactTechnicalIndicators technicalData={technicalData} />

      {/* Compact market heatmap - 4 coins visible */}
      <CompactMarketHeatmap coin={coinData} />

      {/* Compact news - 2-3 articles in compact rows */}
      <CompactCryptoNews articles={news} />
    </div>
  );
};

export default AnalyticsDashboard;

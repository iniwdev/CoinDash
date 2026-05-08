import { useEffect, useMemo, useState } from 'react';
import AnalyticsHero from './AnalyticsHero';
import CompactMetrics from './CompactMetrics';
import TradingAnalytics from './TradingAnalytics';
import CompactTechnicalIndicators from './CompactTechnicalIndicators';
import CompactMarketHeatmap from './CompactMarketHeatmap';
import CompactCryptoNews from './CompactCryptoNews';
import AnalyticsLoader from './AnalyticsLoader';
import {
  fetchCoinHistoricalPrices,
  fetchCoinMarketData,
  fetchCoinNews,
  fetchGlobalData,
  fetchFearGreedIndex,
} from '../../utils/coinDataFetcher';
import {
  calculateRSI,
  calculateMACD,
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateVolatility,
  determineTrend,
} from '../../utils/technicalIndicators';

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
        // Fetch coin-specific data, global data, and fear&greed in parallel
        const [marketData, globalRes, fearGreedRes, pricesRes] = await Promise.all([
          fetchCoinMarketData(coin.id),
          fetchGlobalData(),
          fetchFearGreedIndex(),
          fetchCoinHistoricalPrices(coin.id, 90),
        ]);

        setCoinData(marketData);
        setGlobalData(globalRes);
        setFearGreed(fearGreedRes);

        // Calculate technical indicators from prices
        if (pricesRes?.length >= 26) {
          const rsi = calculateRSI(pricesRes);
          const macd = calculateMACD(pricesRes);
          const sma = calculateSMA(pricesRes);
          const ema = calculateEMA(pricesRes);
          const bb = calculateBollingerBands(pricesRes);
          const volatility = calculateVolatility(pricesRes);
          const trend = determineTrend(rsi, macd, sma, ema, pricesRes[pricesRes.length - 1]);

          setTechnicalData({
            rsi,
            macd,
            sma,
            ema,
            bb,
            volatility,
            trend,
            currentPrice: pricesRes[pricesRes.length - 1],
            priceHistory: pricesRes,
          });
        }

        // Fetch coin-specific news
        const coinNews = await fetchCoinNews(coin.id, 3);
        setNews(coinNews);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
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

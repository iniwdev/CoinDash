const express = require('express');
const router = express.Router();

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Proxy route for CoinGecko market chart data
router.get('/coins/:coinId/market_chart', async (req, res) => {
  try {
    const { coinId } = req.params;
    const { vs_currency, days } = req.query;
    const cacheKey = `${coinId}-${vs_currency}-${days}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`Serving from cache: ${cacheKey}`);
      return res.json(cached.data);
    }

    console.log(`Fetching market chart for ${coinId}, currency: ${vs_currency}, days: ${days}`);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vs_currency}&days=${days}`
    );

    console.log(`CoinGecko response status: ${response.status}`);

    if (response.status === 429) {
      // Rate limited - serve from cache if available, otherwise return error
      if (cached) {
        console.log(`Rate limited, serving stale cache: ${cacheKey}`);
        return res.json(cached.data);
      }
      throw new Error('Rate limited by CoinGecko API');
    }

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Data received, prices length: ${data.prices?.length}`);

    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    res.json(data);
  } catch (error) {
    console.error('Market chart proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch market chart data' });
  }
});


// Mock data for fallback when rate limited
const getMockMarketData = (limit = 20) => {
  const mockCoins = [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67234.50, market_cap: 1324567890000, total_volume: 34234890123, price_change_percentage_24h_in_currency: 2.45, price_change_percentage_24h: 2.45, price_change_24h: 1234.56 },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3456.78, market_cap: 415678901234, total_volume: 23456789012, price_change_percentage_24h_in_currency: -1.23, price_change_percentage_24h: -1.23, price_change_24h: -42.34 },
    { id: 'binancecoin', symbol: 'bnb', name: 'Binance Coin', current_price: 612.34, market_cap: 93456789012, total_volume: 1234567890, price_change_percentage_24h_in_currency: 0.56, price_change_percentage_24h: 0.56, price_change_24h: 3.45 },
    { id: 'ripple', symbol: 'xrp', name: 'Ripple', current_price: 2.45, market_cap: 130456789012, total_volume: 2345678901, price_change_percentage_24h_in_currency: 3.21, price_change_percentage_24h: 3.21, price_change_24h: 0.07 },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145.67, market_cap: 61234567890, total_volume: 3456789012, price_change_percentage_24h_in_currency: -2.34, price_change_percentage_24h: -2.34, price_change_24h: -3.45 },
    { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.98, market_cap: 35234567890, total_volume: 456789012, price_change_percentage_24h_in_currency: 1.23, price_change_percentage_24h: 1.23, price_change_24h: 0.01 },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.34, market_cap: 49234567890, total_volume: 6789012345, price_change_percentage_24h_in_currency: -0.45, price_change_percentage_24h: -0.45, price_change_24h: -0.001 },
    { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 7.89, market_cap: 10234567890, total_volume: 345678901, price_change_percentage_24h_in_currency: 2.15, price_change_percentage_24h: 2.15, price_change_24h: 0.16 },
    { id: 'polygon', symbol: 'matic', name: 'Polygon', current_price: 0.56, market_cap: 5234567890, total_volume: 234567890, price_change_percentage_24h_in_currency: 1.67, price_change_percentage_24h: 1.67, price_change_24h: 0.009 },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 34.56, market_cap: 12234567890, total_volume: 567890123, price_change_percentage_24h_in_currency: -1.89, price_change_percentage_24h: -1.89, price_change_24h: -0.67 },
    { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 28.90, market_cap: 13456789012, total_volume: 789012345, price_change_percentage_24h_in_currency: 3.45, price_change_percentage_24h: 3.45, price_change_24h: 0.96 },
    { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 15.67, market_cap: 5789012345, total_volume: 234567890, price_change_percentage_24h_in_currency: 2.34, price_change_percentage_24h: 2.34, price_change_24h: 0.36 },
    { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 89.23, market_cap: 11234567890, total_volume: 456789012, price_change_percentage_24h_in_currency: 0.78, price_change_percentage_24h: 0.78, price_change_24h: 0.70 },
    { id: 'stellar', symbol: 'xlm', name: 'Stellar', current_price: 0.123, market_cap: 3234567890, total_volume: 123456789, price_change_percentage_24h_in_currency: 1.34, price_change_percentage_24h: 1.34, price_change_24h: 0.0016 },
    { id: 'monero', symbol: 'xmr', name: 'Monero', current_price: 167.45, market_cap: 2934567890, total_volume: 89012345, price_change_percentage_24h_in_currency: -2.12, price_change_percentage_24h: -2.12, price_change_24h: -3.65 },
    { id: 'cosmos', symbol: 'atom', name: 'Cosmos', current_price: 9.87, market_cap: 2834567890, total_volume: 156789012, price_change_percentage_24h_in_currency: 1.95, price_change_percentage_24h: 1.95, price_change_24h: 0.19 },
    { id: 'helium', symbol: 'hnt', name: 'Helium', current_price: 8.56, market_cap: 1234567890, total_volume: 89012345, price_change_percentage_24h_in_currency: -1.56, price_change_percentage_24h: -1.56, price_change_24h: -0.13 },
    { id: 'near', symbol: 'near', name: 'NEAR Protocol', current_price: 7.34, market_cap: 1123456789, total_volume: 234567890, price_change_percentage_24h_in_currency: 2.45, price_change_percentage_24h: 2.45, price_change_24h: 0.18 },
    { id: 'aptos', symbol: 'apt', name: 'Aptos', current_price: 12.45, market_cap: 1023456789, total_volume: 345678901, price_change_percentage_24h_in_currency: -0.89, price_change_percentage_24h: -0.89, price_change_24h: -0.11 },
    { id: 'sui', symbol: 'sui', name: 'Sui', current_price: 4.56, market_cap: 834567890, total_volume: 456789012, price_change_percentage_24h_in_currency: 3.67, price_change_percentage_24h: 3.67, price_change_24h: 0.16 },
  ];
  return mockCoins.slice(0, Math.min(limit, mockCoins.length));
};

// Proxy route for CoinGecko coin markets data
router.get('/coins/markets', async (req, res) => {
  try {
    const { vs_currency, order, per_page, page, sparkline, price_change_percentage } = req.query;
    const perPageNum = parseInt(per_page || '20', 10);
    const params = new URLSearchParams({
      vs_currency: vs_currency || 'usd',
      order: order || 'market_cap_desc',
      per_page: per_page || '20',
      page: page || '1',
      sparkline: sparkline || 'false',
      price_change_percentage: price_change_percentage || '24h',
    }).toString();

    const cacheKey = `coins-markets-${params}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Serving cached markets data: ${cacheKey}`);
      return res.json(cached.data);
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?${params}`
    );

    if (response.status === 429) {
      console.log(`Rate limited on markets request, returning mock data`);
      const mockData = getMockMarketData(perPageNum);
      return res.json(mockData);
    }

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (error) {
    console.error('Market proxy error:', error);
    // Return mock data on error
    const perPageNum = parseInt(req.query.per_page || '20', 10);
    const mockData = getMockMarketData(perPageNum);
    res.json(mockData);
  }
});

module.exports = router;
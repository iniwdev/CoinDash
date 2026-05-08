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

module.exports = router;
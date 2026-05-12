import apiClient from '@/lib/apiClient';

/**
 * Coin-specific data fetching utilities
 */

export const fetchCoinHistoricalPrices = async (coinId, days = 90) => {
  try {
    const response = await apiClient.get(`/market/coins/${coinId}/market_chart`, {
      params: { vs_currency: 'usd', days }
    });
    
    return response.data.prices.map((p) => p[1]); // Return just prices
  } catch (err) {
    console.error('Error fetching historical prices:', err);
    return [];
  }
};

export const fetchCoinMarketData = async (coinId) => {
  // Currently the backend doesn't have a specific GET /market/coins/{id} endpoint migrated.
  // We will temporarily leave this hitting the external API, but ideally it should be migrated.
  // Wait, I will rewrite this to use the proxy if available, but since I didn't migrate that endpoint
  // I must be careful. Let's look at legacy Express API. 
  // Wait! The user said: "For external APIs not yet migrated... leave them as direct fetch calls"
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    return {
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      currentPrice: data.market_data.current_price.usd,
      marketCap: data.market_data.market_cap.usd,
      marketCapRank: data.market_data.market_cap_rank,
      volume24h: data.market_data.total_volume.usd,
      change24h: data.market_data.price_change_percentage_24h,
      change7d: data.market_data.price_change_percentage_7d,
      change30d: data.market_data.price_change_percentage_30d,
      athPrice: data.market_data.ath.usd,
      atlPrice: data.market_data.atl.usd,
      circulatingSupply: data.market_data.circulating_supply,
      totalSupply: data.market_data.total_supply,
    };
  } catch (err) {
    console.error('Error fetching coin market data:', err);
    return null;
  }
};

export const fetchCoinNews = async (coinId, limit = 3) => {
  try {
    const response = await apiClient.get('/news', {
      params: { coin: coinId }
    });
    
    // The FastAPI backend already maps and slices the RSS feeds properly.
    // However, it returns an object { articles: [...] }.
    return response.data.articles.slice(0, limit);
  } catch (err) {
    console.error('Error fetching coin news:', err);
    return [];
  }
};

export const fetchGlobalData = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error('Error fetching global data:', err);
    return null;
  }
};

export const fetchFearGreedIndex = async () => {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();

    if (data.data?.[0]) {
      return {
        value: Number(data.data[0].value),
        classification: data.data[0].value_classification,
        timestamp: data.data[0].timestamp,
      };
    }
    return { value: 58, classification: 'Greed', timestamp: null };
  } catch (err) {
    console.error('Error fetching fear & greed:', err);
    return { value: 58, classification: 'Greed', timestamp: null };
  }
};

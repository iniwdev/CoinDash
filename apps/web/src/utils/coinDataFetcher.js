import apiClient from '@/lib/apiClient';

/**
 * Coin-specific data fetching utilities
 */

export const fetchCoinHistoricalPrices = async (coinId, days = 90) => {
  try {
    const response = await apiClient.get(`/market/coins/${coinId}/market_chart`, {
      params: { vs_currency: 'usd', days }
    });
    
    const prices = response.data?.prices;
    if (!Array.isArray(prices)) return [];
    return prices.map((p) => p[1]); // Return just prices
  } catch (err) {
    console.error('Error fetching historical prices:', err);
    return [];
  }
};

export const fetchCoinMarketData = async (coinId) => {
  try {
    const response = await apiClient.get(`/market/coins/${coinId}`);
    const data = response.data;
    
    if (!data || !data.market_data) {
      console.error('Invalid coin market data received');
      return null;
    }

    return {
      id: data.id,
      symbol: data.symbol?.toUpperCase() || '',
      name: data.name || '',
      currentPrice: data.market_data.current_price?.usd || 0,
      price: data.market_data.current_price?.usd || 0, // Alias
      marketCap: data.market_data.market_cap?.usd || 0,
      marketCapRank: data.market_data.market_cap_rank || 0,
      rank: data.market_data.market_cap_rank || 0, // Alias
      volume24h: data.market_data.total_volume?.usd || 0,
      volume: data.market_data.total_volume?.usd || 0, // Alias
      change24h: data.market_data.price_change_percentage_24h || 0,
      priceChange1d: data.market_data.price_change_percentage_24h || 0, // Alias
      change7d: data.market_data.price_change_percentage_7d || 0,
      change30d: data.market_data.price_change_percentage_30d || 0,
      athPrice: data.market_data.ath?.usd || 0,
      atlPrice: data.market_data.atl?.usd || 0,
      circulatingSupply: data.market_data.circulating_supply || 0,
      availableSupply: data.market_data.circulating_supply || 0, // Alias
      totalSupply: data.market_data.total_supply || 0,
      maxSupply: data.market_data.max_supply || 0,
      icon: data.image?.large || data.image?.small || data.image?.thumb || '',
      description: data.description?.en || '',
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
    
    const articles = response.data?.articles;
    if (!Array.isArray(articles)) return [];
    return articles.slice(0, limit);
  } catch (err) {
    console.error('Error fetching coin news:', err);
    return [];
  }
};

export const fetchGlobalData = async () => {
  try {
    const response = await apiClient.get('/market/global');
    return response.data;
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

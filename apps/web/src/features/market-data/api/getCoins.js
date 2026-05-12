import apiClient from '@/lib/apiClient';

/**
 * Normalizes coin data from CoinStats format
 */
const normalizeCoinStats = (coin, index) => ({
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
});

/**
 * Normalizes coin data from CoinGecko format
 */
const normalizeCoinGecko = (coin, index) => {
  const priceChange24h = typeof coin.price_change_percentage_24h === 'number' ? coin.price_change_percentage_24h : 0;
  
  return {
    id: coin.id || `coin-${index}`,
    rank: coin.market_cap_rank ?? index + 1,
    name: coin.name || 'Unknown',
    symbol: (coin.symbol || '---').toUpperCase(),
    price: typeof coin.current_price === 'number' ? coin.current_price : 0,
    priceChange1h: typeof coin.price_change_percentage_1h_in_currency === 'number' ? coin.price_change_percentage_1h_in_currency : 0,
    priceChange24h: priceChange24h,
    priceChange1d: priceChange24h, // Alias for component compatibility
    priceChange7d: typeof coin.price_change_percentage_7d_in_currency === 'number' ? coin.price_change_percentage_7d_in_currency : 0,
    marketCap: coin.market_cap ?? 0,
    volume: coin.total_volume ?? 0,
    low24h: coin.low_24h ?? 0,
    high24h: coin.high_24h ?? 0,
    priceLow24h: coin.low_24h ?? 0,
    priceHigh24h: coin.high_24h ?? 0,
    totalSupply: coin.total_supply ?? 0,
    availableSupply: coin.circulating_supply ?? 0,
    icon: coin.image || '',
    sparkline: coin.sparkline_in_7d?.price || [],
  };
};

export const getCoins = async () => {
  try {
    // Route traffic through the Vite proxy to our FastAPI backend
    const response = await apiClient.get('/market/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: true,
        price_change_percentage: '1h,24h,7d'
      }
    });

    // The backend mirrors the CoinGecko response contract
    return response.data.map(normalizeCoinGecko);
  } catch (error) {
    console.error('API fetch failure:', error);
    throw error;
  }
};

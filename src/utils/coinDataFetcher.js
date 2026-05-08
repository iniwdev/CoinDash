/**
 * Coin-specific data fetching utilities
 */

export const fetchCoinHistoricalPrices = async (coinId, days = 90) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    return data.prices.map((p) => p[1]); // Return just prices
  } catch (err) {
    console.error('Error fetching historical prices:', err);
    return [];
  }
};

export const fetchCoinMarketData = async (coinId) => {
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
    const response = await fetch('https://api.coinstats.app/public/v1/news');
    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    // Filter news that might be relevant to the coin
    return data.news
      .filter((item) =>
        item.title.toLowerCase().includes(coinId.toLowerCase()) ||
        item.title.toLowerCase().includes(coinId.slice(0, 3))
      )
      .slice(0, limit)
      .map((item) => ({
        title: item.title,
        source: item.source || item.publisher || 'Crypto News',
        date: item.pubDate || item.timeSince || 'Recent',
        link: item.link || item.url,
        image: item.imgURL || item.imageUrl,
      }));
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

/**
 * Convert CoinStats coin data to CoinGecko ID
 * Maps coin names to their CoinGecko identifiers
 */
export const getCoinGeckoId = (coin) => {
  // Symbol mapping for common coins with ambiguous names
  const symbolMap = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    XRP: 'ripple',
    BNB: 'binancecoin',
    SOL: 'solana',
    USDC: 'usd-coin',
  };

  if (coin.symbol && symbolMap[coin.symbol]) {
    return symbolMap[coin.symbol];
  }

  // Manual mapping for common coins that might not follow the simple name.toLowerCase() pattern
  const coinMap = {
    "Bitcoin": "bitcoin",
    "Ethereum": "ethereum",
    "Binance Coin": "binancecoin",
    "Ripple": "ripple",
    "Cardano": "cardano",
    "Solana": "solana",
    "Polkadot": "polkadot",
    "Dogecoin": "dogecoin",
    "Polygon": "matic-network",
    "Litecoin": "litecoin",
    "Chainlink": "chainlink",
    "Uniswap": "uniswap",
    "Avalanche": "avalanche-2",
    "Cosmos": "cosmos",
    "Monero": "monero",
    "Tron": "tron",
    "VeChain": "vechain",
    "Stellar": "stellar",
    "Hedera": "hedera-hashgraph",
    "Theta": "theta-token",
    "Algorand": "algorand",
    "Internet Computer": "internet-computer",
    "Filecoin": "filecoin",
    "The Graph": "the-graph",
    "Aave": "aave",
    "Curve": "curve-dao-token",
    "Maker": "maker",
    "Compound": "compound",
    "Yearn Finance": "yearn-finance",
    "1inch": "1inch",
    "Synthetix": "synthetix-network-token",
    "Balancer": "balancer",
    "Gnosis": "gnosis",
    "Lido": "lido-dao",
    "Convex Finance": "convex-finance",
    "Arbitrum": "arbitrum",
    "Optimism": "optimism",
    "zkSync": "zksync",
    "Starkware": "starknet",
    "Sui": "sui",
    "Aptos": "aptos",
    "Immutable": "immutable-x",
    "Blur": "blur",
    "Rocket Pool": "rocket-pool",
    "Loom Network": "loom-network-new",
    "Ens": "ethereum-name-service",
    "Worldcoin": "worldcoin",
    "Render": "render-token",
    "Arweave": "arweave",
    "Helium": "helium",
    "Decentraland": "decentraland",
    "The Sandbox": "the-sandbox",
    "Axie Infinity": "axie-infinity",
    "Gala": "gala",
  };

  // Check manual mapping first
  if (coinMap[coin.name]) {
    return coinMap[coin.name];
  }

  // Fallback: convert name to lowercase, remove invalid chars, and replace spaces with hyphens
  return coin.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format CoinGecko prices with timestamps
 * CoinGecko returns [timestamp_ms, price] tuples
 */
const formatChartData = (prices) => {
  return prices.map((p) => ({
    time: p[0], // timestamp in milliseconds (IMPORTANT for XAxis)
    price: p[1],
  }));
};

import apiClient from '@/lib/apiClient';

/**
 * Fetch 7-day chart data from CoinGecko proxy
 * Returns array of price points with timestamps for the last 7 days
 */
export const fetchChartData = async (coinGeckoId) => {
  try {
    const response = await apiClient.get(`/market/coins/${coinGeckoId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: 7
      }
    });

    const data = response.data;

    if (!data.prices || !Array.isArray(data.prices)) {
      return [];
    }

    const formatted = formatChartData(data.prices);
    
    // Debug: log data structure
    console.log(`Fetched ${formatted.length} price points for ${coinGeckoId}:`, {
      firstPrice: formatted[0],
      lastPrice: formatted[formatted.length - 1],
    });

    return formatted;
  } catch (error) {
    console.error(`Failed to fetch chart data for ${coinGeckoId}:`, error);
    return [];
  }
};

/**
 * Batch fetch chart data for multiple coins
 * Limit to specified number to avoid rate limiting
 */
export const fetchChartsForCoins = async (coins, limit = 20) => {
  const chartsData = {};
  const coinsToFetch = coins.slice(0, limit);

  try {
    await Promise.all(
      coinsToFetch.map(async (coin, index) => {
        console.log('Fetching:', coin.symbol, coin.name);
        await delay(index * 300);

        const geckoId = getCoinGeckoId(coin);
        const chartData = await fetchChartData(geckoId);

        if (!Array.isArray(chartData) || chartData.length === 0) {
          console.warn('FAILED:', coin.symbol, coin.name, geckoId);
          chartsData[coin.symbol] = [];
        } else {
          chartsData[coin.symbol] = chartData;
        }

        console.log('Data:', coin.symbol, chartData?.length ?? 0);
      })
    );
  } catch (error) {
    console.error('Error fetching charts:', error);
  }

  console.log('Charts loaded:', chartsData);
  return chartsData;
};

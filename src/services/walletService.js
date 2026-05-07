// Comprehensive wallet data - in production, this would be fetched from an API
const WALLET_DATA = [
  // Popular & Multi-Chain
  { id: 'metamask', name: 'MetaMask', category: 'Wallets', chains: ['EVM'], logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', verified: true },
  { id: 'trust-wallet', name: 'Trust Wallet', category: 'Wallets', chains: ['EVM', 'Solana', 'Cosmos'], logo: 'https://trustwallet.com/assets/images/trust-wallet-logo.svg', verified: true },
  { id: 'coinbase-wallet', name: 'Coinbase Wallet', category: 'Exchanges', chains: ['EVM', 'Solana'], logo: 'https://www.coinbase.com/assets/cb-logo.svg', verified: true },
  { id: 'rainbow', name: 'Rainbow', category: 'Wallets', chains: ['EVM'], logo: 'https://avatars.githubusercontent.com/u/81504108', verified: true },
  { id: 'phantom', name: 'Phantom', category: 'Wallets', chains: ['Solana', 'EVM'], logo: 'https://avatars.githubusercontent.com/u/86202433', verified: true },
  
  // Exchange Wallets
  { id: 'binance', name: 'Binance Wallet', category: 'Exchanges', chains: ['EVM'], logo: 'https://www.binance.com/img/fav-icon.png', verified: true },
  { id: 'okx', name: 'OKX Wallet', category: 'Exchanges', chains: ['EVM', 'Solana', 'Bitcoin'], logo: 'https://www.okx.com/cdn/assets/imgs/202303/a726abf5b37a4b32.png', verified: true },
  { id: 'bybit', name: 'Bybit Wallet', category: 'Exchanges', chains: ['EVM', 'Bitcoin'], logo: 'https://www.bybit.com/favicon.ico', verified: true },
  { id: 'bitget', name: 'Bitget Wallet', category: 'Exchanges', chains: ['EVM', 'Solana'], logo: 'https://www.bitget.com/favicon.ico', verified: true },
  { id: 'kraken', name: 'Kraken Wallet', category: 'Exchanges', chains: ['EVM', 'Bitcoin'], logo: 'https://www.kraken.com/favicon-32x32.png', verified: true },
  { id: 'gate-io', name: 'Gate.io Wallet', category: 'Exchanges', chains: ['EVM'], logo: 'https://www.gate.io/favicon.ico', verified: true },
  { id: 'kucoin', name: 'KuCoin Wallet', category: 'Exchanges', chains: ['EVM', 'Solana'], logo: 'https://www.kucoin.com/_nuxt/img/favicon.ico', verified: true },
  { id: 'crypto-com', name: 'Crypto.com Wallet', category: 'Exchanges', chains: ['EVM'], logo: 'https://www.crypto.com/favicon.ico', verified: true },
  
  // Hardware Wallets
  { id: 'ledger', name: 'Ledger', category: 'Hardware', chains: ['EVM', 'Bitcoin', 'Solana'], logo: 'https://www.ledger.com/wp-content/uploads/2022/03/ledger_sticker_1_180x180-150x150.png', verified: true },
  { id: 'trezor', name: 'Trezor', category: 'Hardware', chains: ['EVM', 'Bitcoin'], logo: 'https://trezor.io/static/images/trezor-logo.svg', verified: true },
  { id: 'onekey', name: 'OneKey', category: 'Hardware', chains: ['EVM', 'Bitcoin', 'Solana'], logo: 'https://onekey.so/static/images/logo.svg', verified: true },
  { id: 'ellipal', name: 'Ellipal', category: 'Hardware', chains: ['EVM', 'Bitcoin'], logo: 'https://www.ellipal.com/favicon.ico', verified: true },
  { id: 'safeheron', name: 'Safeheron', category: 'Hardware', chains: ['EVM', 'Bitcoin'], logo: 'https://safeheron.com/favicon.ico', verified: true },
  
  // Solana Ecosystem
  { id: 'solflare', name: 'Solflare', category: 'Wallets', chains: ['Solana'], logo: 'https://avatars.githubusercontent.com/u/81504108', verified: true },
  { id: 'backpack', name: 'Backpack', category: 'Wallets', chains: ['Solana'], logo: 'https://avatars.githubusercontent.com/u/89033329', verified: true },
  { id: 'slope', name: 'Slope', category: 'Wallets', chains: ['Solana'], logo: 'https://slope.finance/logo.png', verified: true },
  { id: 'mariton', name: 'Martian', category: 'Wallets', chains: ['Solana'], logo: 'https://martian.im/favicon.ico', verified: true },
  { id: 'glow', name: 'Glow', category: 'Wallets', chains: ['Solana'], logo: 'https://glow.app/favicon.ico', verified: true },
  { id: 'solanium', name: 'Solanium', category: 'Wallets', chains: ['Solana'], logo: 'https://solanium.io/favicon.ico', verified: true },
  
  // Cosmos Ecosystem
  { id: 'keplr', name: 'Keplr', category: 'Wallets', chains: ['Cosmos'], logo: 'https://keplr.app/favicon.ico', verified: true },
  { id: 'leap', name: 'Leap', category: 'Wallets', chains: ['Cosmos'], logo: 'https://leapwallet.io/favicon.ico', verified: true },
  { id: 'cosmostation', name: 'Cosmostation', category: 'Wallets', chains: ['Cosmos'], logo: 'https://cosmostation.io/favicon.ico', verified: true },
  
  // Advanced Multi-Chain
  { id: 'rabby', name: 'Rabby', category: 'Wallets', chains: ['EVM'], logo: 'https://rabby.io/favicon.ico', verified: true },
  { id: 'zerion', name: 'Zerion', category: 'Wallets', chains: ['EVM'], logo: 'https://zerion.io/favicon.ico', verified: true },
  { id: 'gnosis-safe', name: 'Safe (Gnosis)', category: 'Wallets', chains: ['EVM'], logo: 'https://safe.global/favicon.ico', verified: true },
  { id: 'argent', name: 'Argent', category: 'Wallets', chains: ['EVM'], logo: 'https://www.argent.xyz/favicon.ico', verified: true },
  { id: 'frame', name: 'Frame', category: 'Wallets', chains: ['EVM'], logo: 'https://frame.sh/favicon.ico', verified: true },
  { id: 'exodus', name: 'Exodus', category: 'Wallets', chains: ['EVM', 'Bitcoin', 'Solana'], logo: 'https://www.exodus.io/favicon.ico', verified: true },
  { id: 'atomic', name: 'Atomic Wallet', category: 'Wallets', chains: ['EVM', 'Bitcoin'], logo: 'https://atomicwallet.io/favicon.ico', verified: true },
  { id: 'safepal', name: 'SafePal', category: 'Wallets', chains: ['EVM', 'Bitcoin', 'Solana'], logo: 'https://www.safepal.io/favicon.ico', verified: true },
  
  // Token-Specific & Regional
  { id: 'token-pocket', name: 'TokenPocket', category: 'Wallets', chains: ['EVM', 'Solana'], logo: 'https://www.tokenpocket.pro/favicon.ico', verified: true },
  { id: 'imtoken', name: 'imToken', category: 'Wallets', chains: ['EVM', 'Bitcoin'], logo: 'https://www.imtoken.io/favicon.ico', verified: true },
  { id: 'coin98', name: 'Coin98', category: 'Wallets', chains: ['EVM', 'Solana'], logo: 'https://coin98.com/favicon.ico', verified: true },
  { id: 'mathwallet', name: 'MathWallet', category: 'Wallets', chains: ['EVM', 'Solana', 'Cosmos'], logo: 'https://mathwallet.org/favicon.ico', verified: true },
  { id: 'bitkeep', name: 'BitKeep', category: 'Wallets', chains: ['EVM', 'Bitcoin', 'Solana'], logo: 'https://www.bitkeep.com/favicon.ico', verified: true },
  { id: 'xdefi', name: 'XDEFI', category: 'Wallets', chains: ['EVM', 'Bitcoin'], logo: 'https://www.xdefi.io/favicon.ico', verified: true },
  { id: 'core', name: 'Core', category: 'Wallets', chains: ['EVM'], logo: 'https://core.app/favicon.ico', verified: true },
  { id: 'infinityy', name: 'Infinity Wallet', category: 'Wallets', chains: ['EVM', 'Bitcoin', 'Solana'], logo: 'https://infinitywallet.io/favicon.ico', verified: true },
  { id: 'frontier', name: 'Frontier', category: 'Wallets', chains: ['EVM', 'Solana'], logo: 'https://www.frontierwallet.com/favicon.ico', verified: true },
  
  // Browser-Based
  { id: 'brave', name: 'Brave Wallet', category: 'Wallets', chains: ['EVM'], logo: 'https://brave.com/favicon.ico', verified: true },
  { id: 'opera', name: 'Opera Wallet', category: 'Wallets', chains: ['EVM'], logo: 'https://www.opera.com/favicon.ico', verified: true },
  
  // Newer Options
  { id: 'uniswap-wallet', name: 'Uniswap Wallet', category: 'Wallets', chains: ['EVM'], logo: 'https://app.uniswap.org/favicon.ico', verified: true },
  { id: 'taho', name: 'Taho', category: 'Wallets', chains: ['EVM'], logo: 'https://taho.xyz/favicon.ico', verified: false },
  { id: 'ronin', name: 'Ronin Wallet', category: 'Wallets', chains: ['EVM'], logo: 'https://wallet.roninchain.com/favicon.ico', verified: true },
];

const CATEGORIES = ['All', 'Wallets', 'Exchanges', 'Hardware'];
const CHAINS = ['All', 'EVM', 'Solana', 'Bitcoin', 'Cosmos'];

/**
 * Fetch all available wallets
 */
export const fetchWallets = async () => {
  // Simulating API call - in production, fetch from real API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(WALLET_DATA);
    }, 300);
  });
};

/**
 * Search wallets by name
 */
export const searchWallets = (wallets, query) => {
  if (!query.trim()) return wallets;
  const q = query.toLowerCase();
  return wallets.filter((w) =>
    w.name.toLowerCase().includes(q) ||
    w.category.toLowerCase().includes(q) ||
    w.chains.some((c) => c.toLowerCase().includes(q))
  );
};

/**
 * Filter wallets by category
 */
export const filterByCategory = (wallets, category) => {
  if (category === 'All') return wallets;
  return wallets.filter((w) => w.category === category);
};

/**
 * Filter wallets by chain
 */
export const filterByChain = (wallets, chain) => {
  if (chain === 'All') return wallets;
  return wallets.filter((w) => w.chains.includes(chain));
};

/**
 * Get all categories
 */
export const getCategories = () => CATEGORIES;

/**
 * Get all chains
 */
export const getChains = () => CHAINS;

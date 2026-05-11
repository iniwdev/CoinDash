/**
 * Export watchlist data to CSV
 */
export const exportWatchlistToCSV = (coins, watchlistName = 'watchlist') => {
  const headers = [
    'Name',
    'Symbol',
    'Current Price',
    '1h Change %',
    '24h Change %',
    '7d Change %',
    'Market Cap',
    'Volume',
  ];

  const rows = coins.map((coin) => [
    coin.name,
    coin.symbol.toUpperCase(),
    coin.current_price,
    coin.price_change_percentage_1h_in_currency || 'N/A',
    coin.price_change_percentage_24h || 'N/A',
    coin.price_change_percentage_7d_in_currency || 'N/A',
    coin.market_cap || 'N/A',
    coin.total_volume || 'N/A',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => `"${cell}"`)
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${watchlistName}-${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export watchlist as JSON
 */
export const exportWatchlistToJSON = (coins, watchlistName = 'watchlist') => {
  const data = {
    name: watchlistName,
    exportedAt: new Date().toISOString(),
    coins: coins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      change24h: coin.price_change_percentage_24h,
      image: coin.image,
    })),
    totalValue: coins.reduce((sum, coin) => sum + (coin.current_price * 1), 0),
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${watchlistName}-${new Date().toISOString().split('T')[0]}.json`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate shareable watchlist URL
 */
export const generateShareableWatchlistURL = (coins) => {
  const coinIds = coins.map((c) => c.id).join(',');
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/watchlist?shared=${btoa(coinIds)}`;
  return shareUrl;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      return true;
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

/**
 * Format number to readable format
 */
export const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

/**
 * Format percentage change
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value) return '0.00%';
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Get color based on percentage change
 */
export const getChangeColor = (value) => {
  if (!value) return 'text-slate-400';
  return value > 0 ? 'text-emerald-400' : 'text-rose-400';
};

/**
 * Get background color based on percentage change
 */
export const getChangeBgColor = (value) => {
  if (!value) return 'bg-slate-800/50';
  return value > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10';
};

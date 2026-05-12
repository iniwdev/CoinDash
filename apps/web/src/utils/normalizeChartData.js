import dayjs from 'dayjs';

export const normalizeChartData = (usdData, btcData, ethData, range) => {
  if (!usdData || !Array.isArray(usdData.prices)) return [];

  const usdPrices = usdData.prices;
  const btcPrices = btcData?.prices || [];
  const ethPrices = ethData?.prices || [];

  // Create maps for quick lookup
  const btcMap = new Map(btcPrices.map(([ts, val]) => [ts, val]));
  const ethMap = new Map(ethPrices.map(([ts, val]) => [ts, val]));

  // Use USD timestamps as base
  return usdPrices.map(([timestamp, usdValue]) => {
    const btcValue = btcMap.get(timestamp) || null;
    const ethValue = ethMap.get(timestamp) || null;

    return {
      timestamp,
      usd: usdValue,
      btc: btcValue,
      eth: ethValue,
      time: formatTimeLabel(timestamp, range),
    };
  });
};

const formatTimeLabel = (timestamp, range) => {
  const date = dayjs(timestamp);
  switch (range) {
    case '1h':
    case '24h':
      return date.format('HH:mm');
    case '1w':
    case '1m':
    case '3m':
    case '6m':
      return date.format('MMM D');
    case '1y':
      return date.format('MMM');
    case 'all':
      return date.format('YYYY');
    default:
      return date.format('MMM D');
  }
};
export const getComparisonOptions = (coinId) => {
  const key = String(coinId || '').toLowerCase();
  if (key === 'bitcoin') return ['usd', 'eth'];
  if (key === 'ethereum') return ['usd', 'btc'];
  return ['usd', 'btc', 'eth'];
};

const formatComparisonLabel = (timestamp, range) => {
  const date = new Date(timestamp);
  if (range === '1h' || range === '24h') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (range === '1w' || range === '1m' || range === '3m' || range === '6m') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const fetchComparisonHistory = async (coinId, vsCurrency, days) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/market/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
    );
    if (!response.ok) throw new Error(`Market chart request failed for ${vsCurrency}`);
    const data = await response.json();
    return Array.isArray(data.prices) ? data.prices.map(([timestamp, value]) => [timestamp, Number(value)]) : [];
  } catch (err) {
    console.warn(err);
    return [];
  }
};

export const mergeComparisonChartData = (seriesByCurrency, range) => {
  const allTimestamps = new Set();
  Object.values(seriesByCurrency).forEach((series) => {
    if (Array.isArray(series)) {
      series.forEach(([timestamp]) => {
        if (timestamp != null) allTimestamps.add(timestamp);
      });
    }
  });

  const sortedTimestamps = [...allTimestamps].sort((a, b) => a - b);
  const seriesMaps = Object.fromEntries(
    Object.entries(seriesByCurrency).map(([currency, series]) => [
      currency,
      new Map((Array.isArray(series) ? series : []).map(([timestamp, value]) => [timestamp, Number(value)])),
    ])
  );

  return sortedTimestamps.map((timestamp) => {
    const point = {
      timestamp,
      time: formatComparisonLabel(timestamp, range),
    };

    Object.keys(seriesByCurrency).forEach((currency) => {
      point[currency] = seriesMaps[currency].has(timestamp)
        ? seriesMaps[currency].get(timestamp)
        : null;
    });

    return point;
  });
};

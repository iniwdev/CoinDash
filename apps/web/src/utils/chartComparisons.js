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

// Build the absolute API base URL — works in local dev AND on Vercel/Cloudflare
// In dev: VITE_API_BASE_URL is usually http://localhost:8000
// In prod: VITE_API_BASE_URL is https://coindash.onrender.com
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '';

export const fetchComparisonHistory = async (coinId, vsCurrency, days) => {
  try {
    const url = `${API_BASE}/api/v1/market/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
    const response = await fetch(url);

    // Guard: if server returned HTML (e.g. a 404 page), don't try to parse as JSON
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      console.warn(`[chart] Non-JSON response for ${coinId}/${vsCurrency}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data.prices)
      ? data.prices.map(([timestamp, value]) => [timestamp, Number(value)])
      : [];
  } catch (err) {
    console.warn(`[chart] fetchComparisonHistory failed for ${coinId}/${vsCurrency}:`, err.message);
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

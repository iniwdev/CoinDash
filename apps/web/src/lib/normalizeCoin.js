/**
 * normalizeCoin.js
 *
 * THE SINGLE CANONICAL COIN NORMALIZATION FUNCTION FOR ALL OF COINDASH.
 *
 * All data entering the frontend from ANY source (CoinGecko API via FastAPI,
 * mock fallback data, Zustand watchlist store) must pass through this function.
 *
 * This guarantees every component across the app receives exactly the same
 * coin object shape — no more mismatched field names, no more broken renders.
 *
 * CONTRACT (every coin object in the app has these fields):
 * ─────────────────────────────────────────────────────────
 * id            : string   — CoinGecko slug (e.g. "bitcoin")
 * rank          : number   — market cap rank
 * name          : string   — display name (e.g. "Bitcoin")
 * symbol        : string   — UPPERCASE ticker (e.g. "BTC")
 * image         : string   — logo URL (CoinGecko CDN, with CoinCap fallback)
 *
 * price         : number   — current price in USD
 * priceChange1h : number   — % change last 1 hour
 * priceChange24h: number   — % change last 24 hours (canonical)
 * priceChange7d : number   — % change last 7 days
 *
 * marketCap     : number   — market cap in USD
 * volume        : number   — 24h volume in USD
 * low24h        : number   — 24h low price
 * high24h       : number   — 24h high price
 *
 * totalSupply   : number
 * maxSupply     : number
 * circulatingSupply : number
 * fullyDilutedValuation : number
 *
 * sparkline     : number[] — array of prices for 7d sparkline
 */

/**
 * Derives a CDN image URL from a coin symbol as a reliable fallback.
 * Uses the CoinCap Asset CDN which covers all top coins.
 */
function deriveImageUrl(symbol) {
  if (!symbol) return '';
  return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

/**
 * Safely extracts a number from a value, returning `fallback` (default 0) if invalid.
 */
function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Normalizes a raw coin object from ANY source into the canonical CoinDash contract.
 *
 * Handles these incoming shapes:
 *   1. CoinGecko /coins/markets response (via FastAPI proxy)
 *   2. Backend rate-limit mock fallback (no `image` field)
 *   3. Zustand watchlist store (persisted, partially normalized)
 *   4. CoinStats legacy format
 */
export function normalizeCoin(raw, index = 0) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // ── Symbol ────────────────────────────────────────────────────────────────
  const symbolRaw = raw.symbol || '';
  const symbolUpper = symbolRaw.toUpperCase();
  const symbolLower = symbolRaw.toLowerCase();

  // ── Image: prefer CoinGecko CDN, fall back to CoinCap CDN ────────────────
  const image = raw.image || raw.icon || raw.iconUrl || raw.logo || deriveImageUrl(symbolLower);

  // ── Price changes: handle both CoinGecko snake_case and normalized camelCase ─
  const priceChange24h =
    safeNum(raw.priceChange24h) ||
    safeNum(raw.price_change_percentage_24h) ||
    safeNum(raw.priceChange1d) ||
    0;

  const priceChange1h =
    safeNum(raw.priceChange1h) ||
    safeNum(raw.price_change_percentage_1h_in_currency) ||
    0;

  const priceChange7d =
    safeNum(raw.priceChange7d) ||
    safeNum(raw.priceChange1w) ||
    safeNum(raw.price_change_percentage_7d_in_currency) ||
    0;

  // ── Price ─────────────────────────────────────────────────────────────────
  const price =
    safeNum(raw.price) ||
    safeNum(raw.current_price) ||
    0;

  // ── Market metrics ────────────────────────────────────────────────────────
  const marketCap = safeNum(raw.marketCap) || safeNum(raw.market_cap);
  const volume = safeNum(raw.volume) || safeNum(raw.total_volume) || safeNum(raw.volume24h);
  const low24h = safeNum(raw.low24h) || safeNum(raw.priceLow24h) || safeNum(raw.low_24h);
  const high24h = safeNum(raw.high24h) || safeNum(raw.priceHigh24h) || safeNum(raw.high_24h);

  // ── Supply ────────────────────────────────────────────────────────────────
  const totalSupply = safeNum(raw.totalSupply) || safeNum(raw.total_supply);
  const maxSupply = safeNum(raw.maxSupply) || safeNum(raw.max_supply);
  const circulatingSupply =
    safeNum(raw.circulatingSupply) ||
    safeNum(raw.availableSupply) ||
    safeNum(raw.circulating_supply);
  const fullyDilutedValuation =
    safeNum(raw.fullyDilutedValuation) ||
    safeNum(raw.fully_diluted_valuation) ||
    (totalSupply && price ? totalSupply * price : marketCap);

  // ── Sparkline ─────────────────────────────────────────────────────────────
  const sparkline =
    (Array.isArray(raw.sparkline) && raw.sparkline.length > 0 ? raw.sparkline : null) ||
    (Array.isArray(raw.sparkline_in_7d?.price) && raw.sparkline_in_7d.price.length > 0 ? raw.sparkline_in_7d.price : null) ||
    [];

  // ── Rank ──────────────────────────────────────────────────────────────────
  const rank =
    safeNum(raw.rank) ||
    safeNum(raw.market_cap_rank) ||
    index + 1;

  return {
    // Core identity
    id: raw.id || `coin-${index}`,
    rank,
    name: raw.name || raw.title || 'Unknown',
    symbol: symbolUpper,
    image,                          // SINGLE image field, always populated

    // Pricing
    price,
    priceChange1h,
    priceChange24h,
    priceChange7d,
    low24h,
    high24h,

    // Market
    marketCap,
    volume,
    totalSupply,
    maxSupply,
    circulatingSupply,
    fullyDilutedValuation,

    // Chart
    sparkline,

    // ── BACKWARD-COMPAT ALIASES ─────────────────────────────────────────────
    // Older components that weren't yet migrated reference these legacy fields.
    // Keeping them prevents crashes while we unify incrementally.
    icon: image,
    current_price: price,
    market_cap: marketCap,
    total_volume: volume,
    market_cap_rank: rank,
    price_change_percentage_24h: priceChange24h,
    price_change_percentage_1h_in_currency: priceChange1h,
    price_change_percentage_7d_in_currency: priceChange7d,
    priceChange1d: priceChange24h,
    priceChange1w: priceChange7d,
    volume24h: volume,
    priceLow24h: low24h,
    priceHigh24h: high24h,
    low_24h: low24h,
    high_24h: high24h,
    availableSupply: circulatingSupply,
    sparkline_in_7d: sparkline.length > 0 ? { price: sparkline } : raw.sparkline_in_7d ?? null,
  };
}

/**
 * Normalizes an array of raw coins, filtering out any null results.
 */
export function normalizeCoins(rawArray) {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(normalizeCoin).filter(Boolean);
}

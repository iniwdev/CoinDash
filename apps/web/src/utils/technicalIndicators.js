/**
 * Technical Indicators Calculator
 * Calculates RSI, MACD, SMA, EMA, Bollinger Bands from historical price data
 */

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (prices, period = 14) => {
  if (prices.length < period) return 50; // neutral if not enough data

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[prices.length - i] - prices[prices.length - i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.round(rsi * 10) / 10;
};

// Calculate SMA (Simple Moving Average)
export const calculateSMA = (prices, period = 20) => {
  if (prices.length < period) return prices[prices.length - 1];
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
};

// Calculate EMA (Exponential Moving Average)
export const calculateEMA = (prices, period = 12) => {
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }

  return Math.round(ema * 100) / 100;
};

// Calculate MACD (Moving Average Convergence Divergence)
export const calculateMACD = (prices) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  return Math.round(macd * 100) / 100;
};

// Calculate Bollinger Bands
export const calculateBollingerBands = (prices, period = 20, stdDev = 2) => {
  const sma = calculateSMA(prices, period);
  const variance =
    prices
      .slice(-period)
      .reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const std = Math.sqrt(variance);

  return {
    upper: Math.round((sma + std * stdDev) * 100) / 100,
    middle: sma,
    lower: Math.round((sma - std * stdDev) * 100) / 100,
  };
};

// Calculate volatility (Standard Deviation)
export const calculateVolatility = (prices, period = 20) => {
  if (prices.length < period) return 0;
  const recentPrices = prices.slice(-period);
  const mean = recentPrices.reduce((a, b) => a + b, 0) / period;
  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  const volatility = (stdDev / mean) * 100;
  return Math.round(volatility * 100) / 100;
};

// Determine trend direction
export const determineTrend = (rsi, macd, sma, ema, currentPrice) => {
  let bullishSignals = 0;
  const totalSignals = 4;

  if (rsi < 70 && rsi > 50) bullishSignals++; // RSI in upper half but not overbought
  if (macd > 0) bullishSignals++; // MACD positive
  if (currentPrice > sma) bullishSignals++; // Price above SMA
  if (currentPrice > ema) bullishSignals++; // Price above EMA

  const bullishPercent = (bullishSignals / totalSignals) * 100;

  if (bullishPercent >= 75) return 'Strong Bullish';
  if (bullishPercent >= 50) return 'Bullish';
  if (bullishPercent >= 25) return 'Neutral';
  return 'Bearish';
};

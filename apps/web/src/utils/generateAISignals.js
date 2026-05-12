export const generateAISignals = ({ coin = {}, derivedStats = {}, technical = {} }) => {
  const symbol = (coin.symbol || 'COIN').toUpperCase();
  const change24h = Number(coin.priceChange1d ?? coin.priceChange24h ?? 0);
  const change7d = Number(coin.priceChange1w ?? coin.priceChange7d ?? 0);
  const change1h = Number(coin.priceChange1h ?? 0);
  const volume = Number(coin.volume ?? derivedStats.volume ?? 0);
  const marketCap = Number(derivedStats.marketCap ?? 0);
  const rsi = Number(technical?.rsi ?? 50);
  const macd = Number(technical?.macd ?? 0);
  const signals = [];
  const volumeRatio = marketCap ? (volume / marketCap) * 100 : 0;
  const absChange24h = Math.abs(change24h);

  if (change24h >= 7) {
    signals.push({
      type: 'Momentum',
      title: `${symbol} bullish momentum`,
      description: `Strong upside momentum detected after a ${change24h.toFixed(2)}% 24h gain. Watch for continuation or early profit-taking zones.`,
      badge: 'Bullish',
    });
  } else if (change24h <= -7) {
    signals.push({
      type: 'Momentum',
      title: `${symbol} bearish momentum`,
      description: `Downside pressure is strong with a ${change24h.toFixed(2)}% 24h drop. Monitor support levels closely.`,
      badge: 'Bearish',
    });
  } else if (change24h >= 2) {
    signals.push({
      type: 'Momentum',
      title: `${symbol} is gaining momentum`,
      description: `A ${change24h.toFixed(2)}% 24h rise points to accelerating buying interest. Look for follow-through action.`,
      badge: 'Positive',
    });
  } else if (change24h <= -2) {
    signals.push({
      type: 'Momentum',
      title: `${symbol} momentum fading`,
      description: `A ${change24h.toFixed(2)}% decline in 24h suggests sellers are active. Check whether support holds.`,
      badge: 'Caution',
    });
  }

  if (volumeRatio >= 8 || volume > 50000000000) {
    signals.push({
      type: 'Volume Spike',
      title: `${symbol} volume surge`,
      description: `Trading volume is elevated relative to market cap, indicating strong market participation.`,
      badge: 'High Volatility',
    });
  } else if (volumeRatio >= 4) {
    signals.push({
      type: 'Volume Alert',
      title: `${symbol} steady liquidity`,
      description: `Liquidity remains healthy with volume at ${volumeRatio.toFixed(1)}% of market cap. Good for active setups.`,
      badge: 'Neutral',
    });
  }

  if (!Number.isNaN(rsi)) {
    if (rsi >= 70) {
      signals.push({
        type: 'RSI',
        title: `${symbol} moving into overbought`,
        description: `RSI is at ${rsi.toFixed(1)}, suggesting the trend is strong but momentum may be stretched.`,
        badge: 'Overbought',
      });
    } else if (rsi <= 30) {
      signals.push({
        type: 'RSI',
        title: `${symbol} showing oversold conditions`,
        description: `RSI is at ${rsi.toFixed(1)}, which may indicate a potential rebound if support holds.`,
        badge: 'Oversold',
      });
    }
  }

  if (!Number.isNaN(macd)) {
    if (macd >= 0.2) {
      signals.push({
        type: 'MACD',
        title: `${symbol} bullish momentum signal`,
        description: `MACD is positive, reinforcing the current uptrend and momentum strength.`,
        badge: 'Momentum',
      });
    } else if (macd <= -0.2) {
      signals.push({
        type: 'MACD',
        title: `${symbol} bearish momentum signal`,
        description: `MACD is negative, signaling sustained downward pressure in the short term.`,
        badge: 'Bearish',
      });
    }
  }

  if (absChange24h < 2 && absChange24h >= 0.3) {
    signals.push({
      type: 'Volatility',
      title: `${symbol} trading in a range`,
      description: `Price action is contained within a tight range, suggesting a potential breakout setup.`,
      badge: 'Range',
    });
  }

  if (signals.length < 4) {
    signals.push({
      type: 'Market Pulse',
      title: `${symbol} market pulse`,
      description: `Current 24h change is ${change24h.toFixed(2)}% with ${volumeRatio.toFixed(1)}% volume-to-market-cap. Monitor momentum shifts closely.`,
      badge: 'Live',
    });
  }

  return signals.slice(0, 4);
};

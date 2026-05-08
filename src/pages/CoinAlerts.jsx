import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchCoinHistoricalPrices, fetchCoinMarketData, fetchFearGreedIndex } from '../utils/coinDataFetcher';
import { calculateRSI, calculateMACD, calculateSMA, calculateEMA, calculateVolatility, determineTrend } from '../utils/technicalIndicators';

const alertTypeOptions = [
  { value: 'price', label: 'Price threshold', description: 'Trigger when price crosses a target level.' },
  { value: 'percent', label: 'Daily momentum', description: 'Trigger when 24h percent change crosses your threshold.' },
  { value: 'volume', label: 'Volume spike', description: 'Trigger when trading volume passes your threshold.' },
  { value: 'marketCap', label: 'Market cap watch', description: 'Trigger when market cap crosses a target level.' },
  { value: 'rsi', label: 'RSI levels', description: 'Trigger when RSI enters overbought or oversold territory.' },
  { value: 'macd', label: 'MACD crossover', description: 'Trigger on bullish or bearish momentum shifts.' },
];

const conditionOptions = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatLarge = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${Number(value).toLocaleString()}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${Number(value).toFixed(2)}%`;
};

const getAlertDescription = (alert) => {
  switch (alert.type) {
    case 'price':
      return `${alert.condition === 'above' ? 'Above' : 'Below'} ${formatCurrency(alert.target)}`;
    case 'percent':
      return `${alert.condition === 'above' ? 'Gain' : 'Drop'} ${formatPercent(alert.target)} over 24h`;
    case 'volume':
      return `${alert.condition === 'above' ? 'Above' : 'Below'} ${formatLarge(alert.target)} volume`;
    case 'marketCap':
      return `${alert.condition === 'above' ? 'Above' : 'Below'} ${formatLarge(alert.target)} market cap`;
    case 'rsi':
      return `RSI ${alert.condition === 'above' ? '>' : '<'} ${alert.target}`;
    case 'macd':
      return `MACD ${alert.condition === 'above' ? 'positive' : 'negative'}`;
    default:
      return 'Custom alert';
  }
};

const buildSmartSuggestions = (coin, liveData, technical, fearGreed) => {
  if (!coin || !liveData || !technical) return [];

  const suggestions = [];
  const change24h = liveData.change24h;
  const rsi = technical.rsi;
  const macd = technical.macd;
  const volatility = technical.volatility;

  if (change24h >= 6) {
    suggestions.push({
      title: 'Strong momentum detected',
      description: 'Price is up more than 6% in 24h. Watch for a pullback or ride the trend with a trailing alert.',
      action: `Set a price alert below ${formatCurrency(liveData.currentPrice * 0.97)}`,
    });
  }

  if (change24h <= -5) {
    suggestions.push({
      title: 'Sell-side pressure',
      description: 'Your coin has dropped significantly in the last day. Use a rebound alert near support.',
      action: `Set a price alert above ${formatCurrency(liveData.currentPrice * 0.98)}`,
    });
  }

  if (rsi >= 70) {
    suggestions.push({
      title: 'Overbought signal',
      description: 'RSI is above 70, meaning momentum may be stretched. Track a sell-target or wait for cool-off.',
      action: `Monitor if RSI drops below 65`,
    });
  }

  if (rsi <= 30) {
    suggestions.push({
      title: 'Oversold conditions',
      description: 'RSI is below 30, which can indicate a reversal opportunity. Set a buy-alert above current support.',
      action: `Set a price alert above ${formatCurrency(liveData.currentPrice * 1.03)}`,
    });
  }

  if (macd > 0 && volatility <= 4) {
    suggestions.push({
      title: 'Steady bullish momentum',
      description: 'MACD is positive and volatility is muted. Good setup for breakout alerts.',
      action: `Use a price alert above ${formatCurrency(liveData.currentPrice * 1.04)}`,
    });
  }

  if (fearGreed) {
    suggestions.push({
      title: `Market sentiment: ${fearGreed.classification}`,
      description: `Fear & Greed Index is ${fearGreed.value}. Use this context when sizing alerts.`, 
      action: `Review alerts with market bias`,
    });
  }

  return suggestions.slice(0, 4);
};

const getNotificationPermissionState = () => {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
};

const playPing = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQcAAAAA');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  } catch (error) {
    // ignore audio errors
  }
};

export default function CoinAlerts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_COINSTATS_API_KEY;

  const [coin, setCoin] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [technical, setTechnical] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    type: 'price',
    condition: 'above',
    target: '',
    note: '',
    repeat: false,
  });
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermissionState());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const storageKey = `coindash-alerts-${id}`;
  const historyKey = `coindash-alert-history-${id}`;

  const formattedAlertCount = alerts.filter((item) => item.enabled && item.status !== 'triggered').length;
  const triggeredToday = history.filter((item) => new Date(item.triggeredAt).toDateString() === new Date().toDateString()).length;

  const suggestions = useMemo(() => buildSmartSuggestions(coin, liveData, technical, fearGreed), [coin, liveData, technical, fearGreed]);

  const loadStoredData = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const historyRaw = localStorage.getItem(historyKey);
      if (raw) setAlerts(JSON.parse(raw));
      if (historyRaw) setHistory(JSON.parse(historyRaw));
    } catch (err) {
      console.warn('Unable to parse stored alerts', err);
    }
  }, [storageKey, historyKey]);

  const saveAlerts = useCallback((nextAlerts) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextAlerts));
    } catch (err) {
      console.warn('Unable to save alerts', err);
    }
  }, [storageKey]);

  const saveHistory = useCallback((nextHistory) => {
    try {
      localStorage.setItem(historyKey, JSON.stringify(nextHistory));
    } catch (err) {
      console.warn('Unable to save history', err);
    }
  }, [historyKey]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setNotificationPermission('unsupported');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }, []);

  const notifyUser = useCallback((title, body) => {
    if (notificationPermission === 'granted') {
      new Notification(title, { body });
    }

    if (soundEnabled) {
      playPing();
    }
  }, [notificationPermission, soundEnabled]);

  const createAlert = useCallback((alert) => {
    const newAlert = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: alert.type,
      condition: alert.condition,
      target: Number(alert.target),
      note: alert.note,
      repeat: alert.repeat,
      enabled: true,
      status: 'active',
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
    };
    const nextAlerts = [newAlert, ...alerts];
    setAlerts(nextAlerts);
    saveAlerts(nextAlerts);
  }, [alerts, saveAlerts]);

  const updateAlert = useCallback((alertId, changes) => {
    const nextAlerts = alerts.map((alert) => (alert.id === alertId ? { ...alert, ...changes } : alert));
    setAlerts(nextAlerts);
    saveAlerts(nextAlerts);
  }, [alerts, saveAlerts]);

  const removeAlert = useCallback((alertId) => {
    const nextAlerts = alerts.filter((alert) => alert.id !== alertId);
    setAlerts(nextAlerts);
    saveAlerts(nextAlerts);
  }, [alerts, saveAlerts]);

  const fetchCoinDetails = useCallback(async () => {
    try {
      const response = await fetch(`https://openapiv1.coinstats.app/coins/${id}`, {
        headers: { 'X-API-KEY': apiKey },
      });
      if (!response.ok) throw new Error('Unable to fetch coin details');
      const data = await response.json();
      setCoin(data.coin ?? data);
    } catch (err) {
      console.error(err);
      setError('Unable to load coin details.');
    }
  }, [apiKey, id]);

  const refreshLiveData = useCallback(async () => {
    try {
      const live = await fetchCoinMarketData(id);
      setLiveData(live);
      return live;
    } catch (err) {
      console.error(err);
      setError('Unable to fetch live market data.');
      return null;
    }
  }, [id]);

  const refreshTechnical = useCallback(async (currentPrice) => {
    try {
      const prices = await fetchCoinHistoricalPrices(id, 90);
      if (prices.length === 0) return null;
      const rsi = calculateRSI(prices);
      const macd = calculateMACD(prices);
      const sma = calculateSMA(prices, 20);
      const ema = calculateEMA(prices, 20);
      const volatility = calculateVolatility(prices, 20);
      const trend = determineTrend(rsi, macd, sma, ema, currentPrice ?? prices[prices.length - 1]);
      const result = { prices, rsi, macd, sma, ema, volatility, trend };
      setTechnical(result);
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [id]);

  const refreshAnalytics = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const live = await refreshLiveData();
      const tech = await refreshTechnical(live?.currentPrice);
      const fear = await fetchFearGreedIndex();
      setFearGreed(fear);
      if (!live || !tech) {
        setError('Unable to fetch complete alerts analytics.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to refresh alerts dashboard.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshLiveData, refreshTechnical]);

  const triggerAlert = useCallback((alert, message) => {
    const nextHistory = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        alertId: alert.id,
        alertType: alert.type,
        message,
        triggeredAt: new Date().toISOString(),
      },
      ...history,
    ];
    setHistory(nextHistory);
    saveHistory(nextHistory);

    if (!alert.repeat) {
      updateAlert(alert.id, { status: 'triggered', enabled: false, lastTriggeredAt: new Date().toISOString() });
    } else {
      updateAlert(alert.id, { lastTriggeredAt: new Date().toISOString() });
    }

    notifyUser(`Alert triggered for ${coin?.name ?? 'coin'}`, message);
  }, [coin, history, notifyUser, saveHistory, updateAlert]);

  const evaluateAlerts = useCallback((currentLiveData, currentTechnical) => {
    if (!currentLiveData || alerts.length === 0) return;

    alerts.forEach((alert) => {
      if (!alert.enabled || alert.status === 'triggered') return;

      const currentValue = (() => {
        switch (alert.type) {
          case 'price':
            return currentLiveData.currentPrice;
          case 'percent':
            return currentLiveData.change24h;
          case 'volume':
            return currentLiveData.volume24h;
          case 'marketCap':
            return currentLiveData.marketCap;
          case 'rsi':
            return currentTechnical?.rsi;
          case 'macd':
            return currentTechnical?.macd;
          default:
            return null;
        }
      })();

      if (currentValue === null || currentValue === undefined) return;

      const hasTriggered = alert.condition === 'above'
        ? currentValue >= alert.target
        : currentValue <= alert.target;

      const lastTriggered = alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt).getTime() : 0;
      const now = Date.now();
      const shouldSkipRepeat = alert.repeat && lastTriggered && now - lastTriggered < 15 * 60 * 1000;

      if (hasTriggered && !shouldSkipRepeat) {
        const description = getAlertDescription(alert);
        triggerAlert(alert, `${coin?.symbol ?? ''} ${description} (${formatCurrency(currentLiveData.currentPrice)})`);
      }
    });
  }, [alerts, coin, triggerAlert]);

  useEffect(() => {
    loadStoredData();
    requestNotificationPermission();
  }, [loadStoredData, requestNotificationPermission]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchCoinDetails();
      await refreshAnalytics();
      setIsLoading(false);
    };
    initialize();
  }, [fetchCoinDetails, refreshAnalytics]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      const freshLive = await refreshLiveData();
      const freshTech = await refreshTechnical(freshLive?.currentPrice);
      evaluateAlerts(freshLive, freshTech);
    }, 20000);
    return () => window.clearInterval(intervalId);
  }, [evaluateAlerts, refreshLiveData, refreshTechnical]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!formState.target && formState.type !== 'macd') return;

    createAlert(formState);
    setFormState({ type: 'price', condition: 'above', target: '', note: '', repeat: false });
    setIsFormOpen(false);
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const activeAlerts = alerts.filter((alert) => alert.enabled && alert.status !== 'triggered');
  const triggeredAlerts = history.slice(0, 6);

  const backToCoin = () => navigate(`/coin/${id}`);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0b0f1a] text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="animate-pulse rounded-3xl bg-white/5 h-[640px] border border-white/10" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0b0f1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <button
                type="button"
                onClick={backToCoin}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
              >
                ← Back to {coin?.symbol || 'Coin'} overview
              </button>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Alerts Dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">{coin?.name || 'Coin'} alerts</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">Track price, momentum, volume, and market-cap targets. Alerts are saved locally and checked automatically every 20 seconds.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                Create alert
              </button>
              <button
                type="button"
                onClick={refreshAnalytics}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
              >
                {isRefreshing ? 'Refreshing…' : 'Refresh data'}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 mb-6">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active alerts</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{formattedAlertCount}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Triggered today</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{triggeredToday}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Current price</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(liveData?.currentPrice)}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">24h change</p>
                  <p className={`mt-4 text-3xl font-semibold ${liveData?.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatPercent(liveData?.change24h)}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Market context</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Live alert signals</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                    <span className="rounded-full bg-slate-900/70 px-3 py-2">Market cap {formatLarge(liveData?.marketCap)}</span>
                    <span className="rounded-full bg-slate-900/70 px-3 py-2">Volume {formatLarge(liveData?.volume24h)}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">RSI</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{technical?.rsi ?? '—'}</p>
                    <p className="mt-2 text-sm text-slate-400">{technical?.rsi >= 70 ? 'Overbought' : technical?.rsi <= 30 ? 'Oversold' : 'Neutral'}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MACD</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{technical?.macd ?? '—'}</p>
                    <p className="mt-2 text-sm text-slate-400">{technical?.trend ?? 'Loading'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Smart suggestions</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">AI sentiment & alert ideas</h2>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">{fearGreed?.classification || 'Neutral'}</span>
                </div>
                <div className="mt-5 space-y-4">
                  {suggestions.length === 0 ? (
                    <p className="text-sm text-slate-400">No smart suggestions available right now.</p>
                  ) : (
                    suggestions.map((suggestion) => (
                      <div key={suggestion.title} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-sm font-semibold text-white">{suggestion.title}</p>
                        <p className="mt-2 text-sm text-slate-400">{suggestion.description}</p>
                        <p className="mt-3 text-sm text-slate-300">{suggestion.action}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Notifications</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Preferences</h2>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-300">Browser alerts</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-400">Permission</span>
                      <button
                        type="button"
                        onClick={requestNotificationPermission}
                        className="rounded-full bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
                      >
                        {notificationPermission === 'granted' ? 'Granted' : 'Request'}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-300">Sound alerts</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-400">Play sound on trigger</span>
                      <button
                        type="button"
                        onClick={() => setSoundEnabled((current) => !current)}
                        className={`rounded-full px-3 py-2 text-sm transition ${soundEnabled ? 'bg-orange-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                      >
                        {soundEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent triggers</p>
                <div className="mt-5 space-y-3">
                  {triggeredAlerts.length === 0 ? (
                    <p className="text-sm text-slate-400">No alerts have triggered yet.</p>
                  ) : (
                    triggeredAlerts.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-sm font-semibold text-white">{item.message}</p>
                        <p className="mt-2 text-xs text-slate-500">{new Date(item.triggeredAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Alerts manager</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Your active alert rules</h2>
              </div>
              <span className="rounded-full bg-slate-900/70 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">{activeAlerts.length} active rule{activeAlerts.length === 1 ? '' : 's'}</span>
            </div>

            <div className="mt-6 space-y-4">
              {alerts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-8 text-center">
                  <p className="text-sm text-slate-400">Create rules to monitor price, volume, and momentum without leaving the dashboard.</p>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="mt-5 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                  >
                    Add first alert
                  </button>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">{alertTypeOptions.find((item) => item.value === alert.type)?.label || 'Alert'}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{getAlertDescription(alert)}</p>
                        {alert.note && <p className="mt-2 text-sm text-slate-400">{alert.note}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateAlert(alert.id, { enabled: !alert.enabled })}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${alert.enabled ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        >
                          {alert.enabled ? 'Enabled' : 'Paused'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAlert(alert.id)}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-400 sm:grid-cols-3">
                      <div>
                        <p className="uppercase tracking-[0.3em]">Status</p>
                        <p className={`mt-1 ${alert.status === 'triggered' ? 'text-rose-400' : 'text-emerald-400'}`}>{alert.status === 'triggered' ? 'Triggered' : 'Active'}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.3em]">Repeat</p>
                        <p className="mt-1 text-slate-300">{alert.repeat ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.3em]">Created</p>
                        <p className="mt-1 text-slate-300">{new Date(alert.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">Create alert rule</h2>
                <p className="mt-2 text-sm text-slate-400">Add a rule that will be monitored automatically for {coin?.name}.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-400">Alert type</span>
                  <select
                    value={formState.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                  >
                    {alertTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-400">Condition</span>
                  <select
                    value={formState.condition}
                    onChange={(e) => handleFormChange('condition', e.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                  >
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-400">Target value</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formState.target}
                    onChange={(e) => handleFormChange('target', e.target.value)}
                    placeholder={formState.type === 'price' ? 'USD price target' : formState.type === 'percent' ? '24h change target' : formState.type === 'volume' ? 'Volume threshold' : formState.type === 'marketCap' ? 'Market cap target' : formState.type === 'rsi' ? 'RSI threshold' : 'MACD threshold'}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-400">Repeat</span>
                  <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={formState.repeat}
                      onChange={(e) => handleFormChange('repeat', e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-slate-900 text-orange-500"
                    />
                    <span className="text-sm text-slate-300">Trigger every time the rule matches</span>
                  </div>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm text-slate-400">Notes (optional)</span>
                <textarea
                  value={formState.note}
                  onChange={(e) => handleFormChange('note', e.target.value)}
                  rows={3}
                  placeholder="Example: sell target, breakout watch, support zone"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                >
                  Save alert
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

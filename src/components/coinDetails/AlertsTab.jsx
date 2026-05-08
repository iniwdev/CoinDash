import { useEffect, useMemo, useState, useCallback } from 'react';
import { fetchCoinHistoricalPrices } from '../../utils/coinDataFetcher';
import { calculateRSI, calculateMACD } from '../../utils/technicalIndicators';
import { generateAISignals } from '../../utils/generateAISignals';

const alertTypes = [
  { value: 'price', label: 'Price threshold' },
  { value: 'percent', label: 'Percent change' },
  { value: 'rsi', label: 'RSI level' },
  { value: 'macd', label: 'MACD momentum' },
  { value: 'volume', label: 'Volume spike' },
];

const conditionLabels = {
  above: 'Above',
  below: 'Below',
};

const notificationMethods = [
  { value: 'browser', label: 'Browser Notification' },
  { value: 'inApp', label: 'In-App Alert' },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${Number(value).toFixed(2)}%`;
};

const getNotificationPermissionState = () => {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
};

const playTone = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQcAAAAA');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  } catch (error) {
    // ignore audio issues
  }
};

const getAlertDescription = (alert) => {
  switch (alert.type) {
    case 'price':
      return `${conditionLabels[alert.condition] || 'At'} ${formatCurrency(alert.value)}`;
    case 'percent':
      return `${conditionLabels[alert.condition] || 'When'} ${formatPercent(alert.value)} 24h`; 
    case 'rsi':
      return `${conditionLabels[alert.condition] || 'At'} RSI ${alert.value}`;
    case 'macd':
      return `${conditionLabels[alert.condition] || 'At'} MACD ${alert.condition === 'above' ? 'positive' : 'negative'}`;
    case 'volume':
      return `${conditionLabels[alert.condition] || 'At'} ${formatCurrency(alert.value)} volume`;
    default:
      return 'Custom alert';
  }
};

const getAlertProgress = (alert, livePrice) => {
  if (!livePrice || !alert.value) return 0;
  if (alert.type === 'price') {
    const ratio = alert.condition === 'above' ? livePrice / alert.value : alert.value / livePrice;
    return Math.min(100, Math.max(0, ratio * 100));
  }
  if (alert.type === 'percent') {
    const ratio = Math.min(100, Math.max(0, Math.abs(livePrice) / Math.abs(alert.value || 1) * 100));
    return ratio;
  }
  if (alert.type === 'volume') {
    return Math.min(100, Math.max(0, (livePrice / alert.value) * 100));
  }
  return 0;
};

const getSummaryStat = (alerts) => {
  const today = new Date().toDateString();
  return {
    total: alerts.length,
    triggeredToday: alerts.filter((item) => item.triggered && new Date(item.triggeredAt).toDateString() === today).length,
    active: alerts.filter((item) => item.enabled && !item.triggered).length,
  };
};

const AlertsTab = ({ coin, coinData, marketData, price, symbol }) => {
  const coinId = coin?.id || symbol?.toLowerCase();
  const storageKey = `coindash-alerts-${coinId}`;
  const historyKey = `coindash-alert-history-${coinId}`;

  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [technical, setTechnical] = useState(null);
  const [livePrice, setLivePrice] = useState(price);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermissionState());
  const [form, setForm] = useState({ type: 'price', condition: 'above', value: '', method: 'browser' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const aiSignals = useMemo(() => generateAISignals({ coin: marketData, derivedStats: coinData, technical }), [marketData, coinData, technical]);
  const stats = useMemo(() => getSummaryStat(alerts), [alerts]);

  const saveAlerts = useCallback((nextAlerts) => {
    setAlerts(nextAlerts);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextAlerts));
    } catch (err) {
      console.warn('Unable to save alerts', err);
    }
  }, [storageKey]);

  const saveHistory = useCallback((nextHistory) => {
    setHistory(nextHistory);
    try {
      localStorage.setItem(historyKey, JSON.stringify(nextHistory));
    } catch (err) {
      console.warn('Unable to save history', err);
    }
  }, [historyKey]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const storedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      setAlerts(Array.isArray(stored) ? stored : []);
      setHistory(Array.isArray(storedHistory) ? storedHistory : []);
    } catch (err) {
      console.warn('Unable to load alerts storage', err);
      setAlerts([]);
      setHistory([]);
    }
  }, [storageKey, historyKey]);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const notify = useCallback((title, body) => {
    if (permission === 'granted') {
      new Notification(title, { body });
    }
    playTone();
  }, [permission]);

  const triggerAlert = useCallback((alert, message) => {
    const triggeredAt = new Date().toISOString();
    const nextHistory = [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, alertId: alert.id, message, triggeredAt },
      ...history,
    ];
    saveHistory(nextHistory);

    const nextAlerts = alerts.map((item) => {
      if (item.id !== alert.id) return item;
      return {
        ...item,
        triggered: true,
        enabled: false,
        triggeredAt,
      };
    });
    saveAlerts(nextAlerts);
    notify(`${coin?.name || 'Coin'} Alert`, message);
  }, [alerts, history, coin?.name, notify, saveAlerts, saveHistory]);

  const evaluateAlerts = useCallback((currentPrice) => {
    if (!currentPrice || alerts.length === 0) return;

    alerts.forEach((alert) => {
      if (!alert.enabled || alert.triggered) return;
      const value = Number(alert.value);
      let currentValue = currentPrice;
      if (alert.type === 'percent') {
        currentValue = coinData?.priceChange1d ?? 0;
      } else if (alert.type === 'volume') {
        currentValue = coinData?.volume ?? 0;
      } else if (alert.type === 'rsi') {
        currentValue = technical?.rsi ?? 50;
      } else if (alert.type === 'macd') {
        currentValue = technical?.macd ?? 0;
      }
      const conditionMet = alert.condition === 'above' ? currentValue >= value : currentValue <= value;
      if (conditionMet) {
        triggerAlert(alert, `${symbol} ${getAlertDescription(alert)} — live ${formatCurrency(currentPrice)}`);
      }
    });
  }, [alerts, coinData, symbol, triggerAlert]);

  const refreshLivePrice = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`https://openapiv1.coinstats.app/coins/${coinId}`);
      if (!response.ok) throw new Error('Unable to refresh price');
      const data = await response.json();
      const nextPrice = data.coin?.price ?? data.price ?? price;
      setLivePrice(nextPrice);
      setLastUpdatedAt(new Date());
      evaluateAlerts(nextPrice);
    } catch (err) {
      console.warn('Price refresh failed', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [coinId, evaluateAlerts, price]);

  useEffect(() => {
    setLivePrice(price);
  }, [price]);

  useEffect(() => {
    let mounted = true;

    const loadTechnicalData = async () => {
      try {
        const prices = await fetchCoinHistoricalPrices(coinId, 90);
        if (!mounted || !prices.length) return;
        setTechnical({
          rsi: calculateRSI(prices),
          macd: calculateMACD(prices),
        });
      } catch (err) {
        console.warn('Unable to load technical indicators', err);
      }
    };

    loadTechnicalData();
    return () => {
      mounted = false;
    };
  }, [coinId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshLivePrice();
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [refreshLivePrice]);

  const createAlert = (event) => {
    event.preventDefault();
    const nextAlert = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      coinId,
      symbol,
      type: form.type,
      condition: form.condition,
      value: Number(form.value),
      method: form.method,
      enabled: true,
      triggered: false,
      createdAt: new Date().toISOString(),
      triggeredAt: null,
    };
    saveAlerts([nextAlert, ...alerts]);
    setIsModalOpen(false);
    setForm({ type: 'price', condition: 'above', value: '', method: 'browser' });
  };

  const toggleAlert = (alertId) => {
    saveAlerts(alerts.map((alert) => alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert));
  };

  const deleteAlert = (alertId) => {
    saveAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  const activeMonitoring = alerts.some((alert) => alert.enabled && !alert.triggered);
  const volatileCoin = marketData?.priceChange1d && Math.abs(marketData.priceChange1d) > 4 ? symbol?.toUpperCase() : 'BTC';
  const triggeredHistory = history.slice(0, 6);

  if (!coin) return null;

  return (
    <div className="space-y-6 alerts-container">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.9)] alert-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Alerts center</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{coin.name} monitoring</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Live alert rules, monitoring, and triggered history for {coin.name}. Saved locally in your browser.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 mr-2" />Live price active
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-20px_rgba(251,146,60,0.85)] transition hover:scale-[1.01]"
            >
              + Create Alert
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total alerts</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Triggered today</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.triggeredToday}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active monitoring</p>
            <p className={`mt-4 text-3xl font-semibold ${activeMonitoring ? 'text-emerald-400' : 'text-slate-300'}`}>{activeMonitoring ? 'Enabled' : 'Paused'}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Most volatile coin</p>
            <p className="mt-4 text-3xl font-semibold text-white">{volatileCoin}</p>
          </div>
        </div>
      </div>

      <div className="alerts-grid">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live price</p>
                <h3 className="mt-3 text-4xl font-semibold text-white">{formatCurrency(livePrice)}</h3>
                <p className="mt-2 text-sm text-slate-400">{symbol?.toUpperCase()} current price</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                <p className="font-semibold text-white">Market update</p>
                <p className="mt-2 text-xs text-slate-400">{isRefreshing ? 'Refreshing data…' : 'Auto-refreshes every 15 seconds'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-6 text-center">
                <p className="text-sm text-slate-400">No active alerts yet.</p>
                <p className="mt-3 text-lg font-semibold text-white">Create a new rule to monitor this coin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`rounded-3xl border p-5 transition alert-card ${alert.enabled ? 'border-orange-500/30 bg-slate-950/80 shadow-[0_16px_32px_-20px_rgba(251,146,60,0.55)]' : 'border-white/10 bg-slate-900/70'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900/80 text-xl text-white">{symbol?.charAt(0)}</div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{conditionLabels[alert.condition]} {alert.type.toUpperCase()}</p>
                          <p className="mt-2 text-lg font-semibold text-white">{getAlertDescription(alert)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAlert(alert.id)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${alert.enabled ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        >
                          {alert.enabled ? 'Enabled' : 'Paused'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAlert(alert.id)}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-3xl bg-slate-900/80 p-3">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                          <span>Live target progress</span>
                          <span>{Math.round(getAlertProgress(alert, livePrice))}%</span>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300 transition-all" style={{ width: `${getAlertProgress(alert, livePrice)}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-400 sm:grid-cols-3">
                        <div>
                          <p className="uppercase tracking-[0.28em]">Target</p>
                          <p className="mt-1 text-white">{alert.type === 'price' ? formatCurrency(alert.value) : alert.type === 'percent' ? formatPercent(alert.value) : alert.type === 'volume' ? `${formatCurrency(alert.value)} volume` : `${alert.value}`}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.28em]">Live price</p>
                          <p className="mt-1 text-white">{formatCurrency(livePrice)}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.28em]">Status</p>
                          <p className={`mt-1 ${alert.enabled ? 'text-emerald-400' : 'text-slate-400'}`}>{alert.enabled ? 'Monitoring' : 'Paused'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Triggered alerts</p>
                <h3 className="mt-2 text-xl font-semibold text-white">History</h3>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">Latest</span>
            </div>
            <div className="mt-5 space-y-3">
              {triggeredHistory.length === 0 ? (
                <p className="text-sm text-slate-400">No triggered alerts yet. Add a rule to start monitoring.</p>
              ) : (
                triggeredHistory.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 alert-card">
                    <p className="text-sm font-semibold text-white">{item.message}</p>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{new Date(item.triggeredAt).toLocaleString()}</span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-200">Triggered</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Tools</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-sm text-slate-300">Notification</p>
                <p className="mt-2 text-sm text-slate-400">{permission === 'granted' ? 'Browser alerts enabled' : permission === 'denied' ? 'Notifications blocked' : 'Allow browser notifications'}</p>
              </div>
              <button
                type="button"
                onClick={requestPermission}
                className="w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                {permission === 'granted' ? 'Re-check permission' : 'Enable notifications'}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="alerts-grid">
        {aiSignals.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/10 via-slate-950/70 to-slate-900/90 p-5 shadow-[0_20px_60px_-45px_rgba(251,146,60,0.75)] transition hover:-translate-y-1 alert-card">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-300">{item.badge}</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full alert-modal rounded-[32px] border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Create alert for</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{coin.name}</h2>
                <p className="mt-2 text-sm text-slate-400">Set up a live rule, then leave this tab open to monitor automatically.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={createAlert} className="mt-8 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Alert type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                  >
                    {alertTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Condition</span>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm((prev) => ({ ...prev, condition: e.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Target value</span>
                  <input
                    value={form.value}
                    onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                    type="number"
                    step="any"
                    min="0"
                    placeholder={form.type === 'price' ? 'USD price target' : form.type === 'percent' ? '24h percent change' : form.type === 'volume' ? 'Volume target' : form.type === 'rsi' ? 'RSI threshold' : 'MACD threshold'}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Notification method</span>
                  <select
                    value={form.method}
                    onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none"
                  >
                    {notificationMethods.map((method) => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                >
                  Save Alert
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsTab;

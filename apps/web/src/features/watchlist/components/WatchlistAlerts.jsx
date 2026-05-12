import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useWatchlistState } from "@/store/watchlistStateStore";

const WatchlistAlerts = ({ coins }) => {
  const { alerts, removeAlert, addAlert } = useWatchlistState();
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    coinId: '',
    type: 'price_above',
    value: '',
  });

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (formData.coinId && formData.value) {
      addAlert(formData.coinId, formData.type, parseFloat(formData.value));
      setFormData({ coinId: '', type: 'price_above', value: '' });
    }
  };

  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.coinId]) {
      acc[alert.coinId] = [];
    }
    acc[alert.coinId].push(alert);
    return acc;
  }, {});

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'price_above':
        return 'Price Above';
      case 'price_below':
        return 'Price Below';
      case 'change_percent':
        return '% Change';
      default:
        return type;
    }
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'price_above':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'price_below':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'change_percent':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getAlertIcon = (alert) => {
    if (alert.triggered) return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  };

  const getCoinInfo = (coinId) => {
    return coins.find(coin => coin.id === coinId) || { symbol: coinId.toUpperCase(), name: coinId };
  };

  return (
    <motion.div
      className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] overflow-hidden"
      whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-6 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-blue-400" />
            {alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs flex items-center justify-center rounded-full font-bold shadow-lg shadow-rose-500/25">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white">Price Alerts</h2>
            <p className="text-slate-400 text-sm mt-1">
              {alerts.length === 0
                ? 'No alerts set'
                : `${alerts.length} alert${alerts.length !== 1 ? 's' : ''} active`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/6 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Alert Form */}
              <motion.form
                onSubmit={handleAddAlert}
                className="bg-black/40 border border-white/6 rounded-[28px] p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400" />
                  Create New Alert
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <select
                      value={formData.coinId}
                      onChange={(e) =>
                        setFormData({ ...formData, coinId: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-[28px] text-white focus:outline-none focus:border-blue-500/40 appearance-none"
                    >
                      <option value="" className="bg-[#0b1120]">Select Coin</option>
                      {coins.map((coin) => (
                        <option key={coin.id} value={coin.id} className="bg-[#0b1120]">
                          {coin.symbol.toUpperCase()} - {coin.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-[28px] text-white focus:outline-none focus:border-blue-500/40 appearance-none"
                    >
                      <option value="price_above" className="bg-[#0b1120]">Price Above</option>
                      <option value="price_below" className="bg-[#0b1120]">Price Below</option>
                      <option value="change_percent" className="bg-[#0b1120]">% Change</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Value"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-[28px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                  />

                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-[28px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Alert
                  </motion.button>
                </div>
              </motion.form>

              {/* Alerts List */}
              {Object.keys(groupedAlerts).length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No alerts yet. Create one to get started!</p>
                  <p className="text-slate-500 text-sm mt-2">Get notified when prices hit your targets</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedAlerts).map(([coinId, coinAlerts], groupIdx) => {
                    const coin = getCoinInfo(coinId);
                    return (
                      <motion.div
                        key={coinId}
                        className="bg-black/40 border border-white/6 rounded-[28px] p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIdx * 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-white font-semibold">{coin.symbol.toUpperCase()}</p>
                            <p className="text-slate-400 text-sm">{coin.name}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {coinAlerts.map((alert, alertIdx) => (
                            <motion.div
                              key={alert.id}
                              className={`flex items-center justify-between p-4 rounded-[28px] border ${getAlertTypeColor(alert.type)}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (groupIdx * 0.1) + (alertIdx * 0.05) }}
                            >
                              <div className="flex items-center gap-3">
                                {getAlertIcon(alert)}
                                <div>
                                  <span className="text-white font-semibold text-sm">
                                    {getAlertTypeLabel(alert.type)}
                                  </span>
                                  <span className="text-slate-300 text-sm ml-2">
                                    {alert.type === 'change_percent' ? `${alert.value}%` : `$${alert.value}`}
                                  </span>
                                  {alert.triggered && (
                                    <div className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Triggered
                                    </div>
                                  )}
                                </div>
                              </div>

                              <motion.button
                                onClick={() => removeAlert(alert.id)}
                                className="p-2 hover:bg-rose-500/20 rounded-[28px] transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="w-4 h-4 text-rose-400" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WatchlistAlerts;
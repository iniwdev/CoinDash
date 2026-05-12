import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, FileText, Save, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import { useWatchlistState } from "@/store/watchlistStateStore";

const CoinDrawer = ({ coin, onClose }) => {
  const { getNote, addNote, removeNote, removeCoinFromWatchlist, addAlert, getAlertsForCoin } = useWatchlistState();
  const [coinDetails, setCoinDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(getNote(coin.id) || '');
  const [showNoteEdit, setShowNoteEdit] = useState(false);
  const [alertForm, setAlertForm] = useState({ type: 'price_above', value: '' });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
        );
        setCoinDetails(response.data);
      } catch (error) {
        console.error('Error fetching coin details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [coin.id]);

  const handleSaveNote = () => {
    if (note.trim()) {
      addNote(coin.id, note);
    } else if (note === '') {
      removeNote(coin.id);
    }
    setShowNoteEdit(false);
  };

  const handleAddAlert = () => {
    if (alertForm.value) {
      addAlert(coin.id, alertForm.type, parseFloat(alertForm.value));
      setAlertForm({ type: 'price_above', value: '' });
    }
  };

  const alerts = getAlertsForCoin(coin.id);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Drawer */}
      <motion.div
        className="relative w-full max-w-md max-h-screen overflow-y-auto bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl"
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
              <p className="text-slate-400">{coin.symbol.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500/50 border-t-blue-500 rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Price Info */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                <p className="text-slate-400 text-sm mb-2">Current Price</p>
                <p className="text-3xl font-bold text-white mb-3">
                  ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-slate-400 text-xs">24h Change</p>
                    <p className={`font-semibold ${coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">7d Change</p>
                    <p className={`font-semibold ${coin.price_change_percentage_7d_in_currency > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_7d_in_currency > 0 ? '+' : ''}{coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Market Cap</p>
                    <p className="font-semibold text-white">
                      ${coin.market_cap ? (coin.market_cap / 1000000000).toFixed(2) + 'B' : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Data */}
              {coinDetails && (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 space-y-3">
                  <h3 className="font-semibold text-white">Market Data</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>ATH</span>
                      <span className="font-semibold">
                        ${coinDetails.market_data?.ath?.usd?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>ATL</span>
                      <span className="font-semibold">
                        ${coinDetails.market_data?.atl?.usd?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Volume 24h</span>
                      <span className="font-semibold">
                        ${(coinDetails.market_data?.total_volume?.usd / 1000000000).toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Supply</span>
                      <span className="font-semibold">
                        {coinDetails.market_data?.circulating_supply?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  Price Alerts
                </h3>
                {alerts.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between bg-slate-600/20 p-2 rounded text-sm">
                        <span className="text-slate-300">{alert.type}: {alert.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm mb-3">No alerts set</p>
                )}
                <div className="flex gap-2">
                  <select
                    value={alertForm.type}
                    onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                    className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="price_above">Price Above</option>
                    <option value="price_below">Price Below</option>
                    <option value="change_percent">% Change</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Value"
                    value={alertForm.value}
                    onChange={(e) => setAlertForm({ ...alertForm, value: e.target.value })}
                    className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddAlert}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Personal Notes
                </h3>
                {showNoteEdit ? (
                  <div className="space-y-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add your notes..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNote}
                        className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowNoteEdit(false);
                          setNote(getNote(coin.id) || '');
                        }}
                        className="flex-1 px-3 py-1 bg-slate-600/50 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowNoteEdit(true)}
                    className="p-3 bg-slate-800/50 rounded border border-slate-600/30 hover:border-blue-500/50 cursor-pointer transition-colors min-h-[80px]"
                  >
                    {note ? (
                      <p className="text-slate-300 text-sm">{note}</p>
                    ) : (
                      <p className="text-slate-500 text-sm italic">Click to add notes...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Remove from Watchlist */}
              <button
                onClick={() => {
                  removeCoinFromWatchlist(coin.id);
                  onClose();
                }}
                className="w-full px-4 py-3 bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove from Watchlist
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CoinDrawer;

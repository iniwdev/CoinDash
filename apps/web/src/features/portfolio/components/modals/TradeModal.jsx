import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioStore } from '@/store/portfolioStore';

export default function TradeModal() {
  const { 
    tradeModalOpen, 
    closeTradeModal, 
    selectedCoinForTrade, 
    tradeType, 
    setTradeType,
    executeTrade,
    isTrading,
    holdings
  } = usePortfolioStore();

  const [coinId, setCoinId] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  // When modal opens or selected coin changes, prepopulate data
  useEffect(() => {
    if (selectedCoinForTrade) {
      setCoinId(selectedCoinForTrade);
      const holding = holdings.find(h => h.coin_id === selectedCoinForTrade);
      if (holding) {
        setCoinSymbol(holding.coin_symbol);
        setPrice(Number(holding.current_price).toFixed(6));
      }
    } else {
      setCoinId('');
      setCoinSymbol('');
      setQuantity('');
      setPrice('');
    }
  }, [selectedCoinForTrade, holdings, tradeModalOpen]);

  // Handle outside click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeTradeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coinId || !coinSymbol || !quantity || !price) return;
    
    await executeTrade({
      coin_id: coinId.toLowerCase(),
      coin_symbol: coinSymbol.toUpperCase(),
      type: tradeType,
      quantity: Number(quantity),
      price_per_unit: Number(price)
    });
  };

  // Validation
  const holding = holdings.find(h => h.coin_id === coinId.toLowerCase());
  const maxQty = holding ? Number(holding.quantity) : 0;
  const isSellDisabled = tradeType === 'SELL' && (Number(quantity) > maxQty || maxQty === 0);
  const totalValue = (Number(quantity) || 0) * (Number(price) || 0);

  if (!tradeModalOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex bg-slate-900/80 border-b border-white/10">
            <button
              type="button"
              onClick={() => setTradeType('BUY')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${tradeType === 'BUY' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setTradeType('SELL')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${tradeType === 'SELL' ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              SELL
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase">Coin ID</label>
                <input 
                  type="text" 
                  value={coinId}
                  onChange={(e) => setCoinId(e.target.value)}
                  placeholder="bitcoin"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase">Symbol</label>
                <input 
                  type="text" 
                  value={coinSymbol}
                  onChange={(e) => setCoinSymbol(e.target.value)}
                  placeholder="BTC"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase flex justify-between">
                <span>Quantity</span>
                {tradeType === 'SELL' && maxQty > 0 && (
                  <span className="text-slate-500 cursor-pointer hover:text-primary" onClick={() => setQuantity(maxQty.toString())}>
                    Max: {maxQty}
                  </span>
                )}
              </label>
              <input 
                type="number" 
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                required
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${isSellDisabled ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50'}`}
              />
              {isSellDisabled && (
                <p className="text-xs text-rose-400 mt-1">Insufficient balance to sell</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase flex justify-between">
                <span>Price per Unit (USD)</span>
              </label>
              <input 
                type="number" 
                step="any"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-slate-400">Total Value</span>
              <span className="text-xl font-bold text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeTradeModal}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTrading || isSellDisabled || !quantity || !price}
                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                  isTrading || isSellDisabled || !quantity || !price
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : tradeType === 'BUY'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                }`}
              >
                {isTrading ? 'Executing...' : `Confirm ${tradeType}`}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

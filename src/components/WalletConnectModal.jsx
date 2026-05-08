import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IoClose } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import {
  fetchWallets,
  searchWallets,
  filterByCategory,
  filterByChain,
  getCategories,
  getChains,
} from '../services/walletService';

// Skeleton Loader Component
const WalletSkeleton = () => (
  <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-800" />
      <div className="flex-1">
        <div className="h-4 w-24 bg-slate-800 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-800/60 rounded" />
      </div>
    </div>
  </div>
);

const WalletConnectModal = () => {
  const { isWalletModalOpen, closeWalletModal } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [filteredWallets, setFilteredWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedChain, setSelectedChain] = useState('All');
  const [categories, setCategories] = useState([]);
  const [chains, setChains] = useState([]);

  // Load wallets and filters on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWallets();
        setWallets(data);
        setFilteredWallets(data);
        setCategories(getCategories());
        setChains(getChains());
        if (data.length > 0) {
          setSelectedKey(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isWalletModalOpen) {
      // Scroll to top and lock body scroll when modal opens
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      document.body.style.overflow = "hidden";
      loadData();
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isWalletModalOpen]);

  // Filter wallets based on search and filters
  useEffect(() => {
    let result = wallets;
    result = filterByCategory(result, selectedCategory);
    result = filterByChain(result, selectedChain);
    result = searchWallets(result, searchQuery);
    setFilteredWallets(result);
  }, [wallets, searchQuery, selectedCategory, selectedChain]);

  const selectedWallet = wallets.find((w) => w.id === selectedKey);

  const handleClose = () => {
    setStatusMessage('');
    setIsConnecting(false);
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedChain('All');
    closeWalletModal();
  };

  const handleConnect = async () => {
    if (isConnecting || !selectedWallet) return;
    setIsConnecting(true);
    setStatusMessage('');

    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsConnecting(false);
    setStatusMessage(`${selectedWallet.name} connected successfully!`);

    // Navigate to wallet connection page
    closeWalletModal();
    navigate(`/wallet/${selectedWallet.id}`);
  };

  return (
    <AnimatePresence>
      {isWalletModalOpen && (
        <>
          {/* Premium Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[9998] bg-black/72 backdrop-blur-xl"
            onClick={handleClose}
          />

          {/* Animated Glow Orbs */}
          <div className="fixed inset-0 z-[9997] pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Premium Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8"
          >
            <div
              className="relative w-full max-w-[1080px] h-[90vh] max-h-[90vh] overflow-hidden rounded-[28px] border border-white/8 bg-gradient-to-b from-[#111827] to-[#060b17] backdrop-blur-[24px] shadow-[0_0_60px_rgba(0,0,0,0.55),0_0_25px_rgba(59,130,246,0.12)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.08),transparent_30%)] pointer-events-none" />

              {/* CLOSE BUTTON - ABSOLUTELY POSITIONED, HIGH Z-INDEX */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-[#111827]/80 text-slate-300 transition hover:border-orange-400/60 hover:text-orange-400 hover:bg-[#1a2641]"
              >
                <IoClose className="h-6 w-6" />
              </button>

              {/* GRID LAYOUT: Header + Filters on left, Selected on right */}
              <div className="relative h-full flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-0">
                {/* LEFT SECTION: WALLET SELECTION */}
                <div className="flex flex-col overflow-hidden">
                  {/* HEADER - FIXED */}
                  <div className="relative z-10 flex-shrink-0 border-b border-white/10 bg-gradient-to-b from-[#111827]/95 to-[#060b17]/95 backdrop-blur px-6 py-6 sm:px-8 sm:py-7">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white sm:text-3xl leading-tight">
                          WalletConnect
                        </h2>
                        <p className="text-sm text-slate-400">Secure Web3 Portfolio Sync</p>
                      </div>
                    </div>
                    <p className="max-w-2xl text-slate-300 text-sm leading-relaxed">
                      Track balances, DeFi positions, NFTs and multi-chain assets securely. Choose from {wallets.length}+ wallet providers with read-only access.
                    </p>
                  </div>

                  {/* SEARCH - FIXED */}
                  <div className="relative z-10 flex-shrink-0 border-b border-white/10 bg-[#0b1221]/95 backdrop-blur px-6 py-3 sm:px-8">
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search wallets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-white/10 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/15 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* FILTER TABS - FIXED */}
                  <div className="relative z-10 flex-shrink-0 border-b border-white/10 bg-[#0b1221]/95 backdrop-blur px-6 py-2 sm:px-8">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-500 w-full mb-0.5">Category</span>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition ${
                              selectedCategory === cat
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-400/40'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:border-orange-400/30'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-500 w-full mb-0.5">Blockchain</span>
                        {chains.map((chain) => (
                          <button
                            key={chain}
                            onClick={() => setSelectedChain(chain)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition ${
                              selectedChain === chain
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:border-purple-400/30'
                            }`}
                          >
                            {chain}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* WALLET GRID - SCROLLABLE ONLY THIS SECTION */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-8">
                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <WalletSkeleton key={i} />
                        ))}
                      </div>
                    ) : filteredWallets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-slate-400 text-lg mb-2">No wallets found</p>
                        <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {filteredWallets.map((wallet) => {
                          const isSelected = selectedKey === wallet.id;
                          return (
                            <motion.button
                              key={wallet.id}
                              onClick={() => {
                                setSelectedKey(wallet.id);
                                setStatusMessage('');
                              }}
                              whileHover={{ y: -4 }}
                              transition={{ duration: 0.2 }}
                              className={`group relative overflow-hidden rounded-3xl p-5 text-left transition-all duration-300 ${
                                isSelected
                                  ? 'border border-blue-400/35 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_10px_30px_rgba(59,130,246,0.15)]'
                                  : 'border border-white/6 bg-gradient-to-br from-white/4 to-white/2 hover:border-blue-400/35 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]'
                              }`}
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0">
                                  <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent)] blur-sm" />
                                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 flex items-center justify-center overflow-hidden">
                                      {wallet.logo && wallet.logo.startsWith('http') ? (
                                        <img
                                          src={wallet.logo}
                                          alt={wallet.name}
                                          className="h-8 w-8 object-contain"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div className={`flex items-center justify-center ${wallet.logo && wallet.logo.startsWith('http') ? 'hidden' : ''}`}>
                                        <span className="text-sm font-bold text-white">
                                          {wallet.name.substring(0, 2).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-1">{wallet.category}</p>
                                  <h3 className={`font-semibold leading-tight ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                                    {wallet.name}
                                  </h3>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Supports {wallet.chains.slice(0, 2).join(', ')}{wallet.chains.length > 2 ? ` +${wallet.chains.length - 2}` : ''}
                                  </p>
                                </div>
                                {wallet.verified && (
                                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {wallet.chains.slice(0, 3).map((chain) => (
                                  <span
                                    key={chain}
                                    className="text-[10px] uppercase tracking-[0.15em] font-medium px-2 py-1 rounded-full bg-slate-800/60 text-slate-300 border border-white/5"
                                  >
                                    {chain}
                                  </span>
                                ))}
                                {wallet.chains.length > 3 && (
                                  <span className="text-[10px] uppercase tracking-[0.15em] font-medium px-2 py-1 rounded-full bg-slate-800/60 text-slate-400 border border-white/5">
                                    +{wallet.chains.length - 3}
                                  </span>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SECTION: SELECTED WALLET INFO - FIXED */}
                <div className="hidden lg:flex flex-col border-l border-white/10 bg-[#0b1221]/95 backdrop-blur overflow-hidden">
                  {/* Header */}
                  <div className="flex-shrink-0 border-b border-white/10 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Selected</p>
                  </div>

                  {/* Selected Wallet Display */}
                  <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
                    {selectedWallet ? (
                      <>
                        <div className="flex flex-col items-center text-center">
                          {selectedWallet.logo ? (
                            <img
                              src={selectedWallet.logo}
                              alt={selectedWallet.name}
                              className="h-20 w-20 rounded-3xl object-cover mb-3 bg-white/10"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-orange-500/30 to-purple-500/30 flex items-center justify-center mb-3">
                              <span className="text-lg font-bold text-white">
                                {selectedWallet.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <h3 className="text-xl font-semibold text-white">{selectedWallet.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{selectedWallet.category}</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-4 space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Supported Chains</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedWallet.chains.map((chain) => (
                                <span
                                  key={chain}
                                  className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                >
                                  {chain}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl bg-[#111827] p-4 space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Features</p>
                            <ul className="space-y-2 text-xs text-slate-300">
                              <li className="flex gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Read-only access</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Encrypted connection</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Real-time sync</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleConnect}
                          disabled={isConnecting}
                          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-4 text-sm font-semibold text-slate-950 transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(251,146,60,0.45)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                          {isConnecting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                              Connecting...
                            </>
                          ) : statusMessage ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Connected ✓
                            </>
                          ) : (
                            'Connect Wallet'
                          )}
                        </button>

                        {statusMessage && (
                          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200 text-center">
                            {statusMessage}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center">
                        <p className="text-slate-500">Select a wallet to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MOBILE CONNECT BUTTON - Below scrollable area */}
              {selectedWallet && (
                <div className="lg:hidden relative z-20 border-t border-white/10 bg-[#0b1221]/95 backdrop-blur px-6 py-4 sm:px-8 space-y-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-4 text-sm font-semibold text-slate-950 transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(251,146,60,0.45)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : statusMessage ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Connected ✓
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                  {statusMessage && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200 text-center">
                      {statusMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;

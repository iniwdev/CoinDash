import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from "@/components/layout/Layout";
import { fetchWallets } from "@/services/walletService";

const WalletConnectPage = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Find wallet by ID from fetched wallets
  const wallet = wallets.find(w => w.id === walletId);

  // Create address validation function based on wallet chains
  const getAddressValidation = (chains) => {
    return (address) => {
      if (!address) return false;

      // If wallet supports Solana, check for Solana address format
      if (chains.includes('Solana')) {
        if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return true;
      }

      // If wallet supports EVM chains, check for Ethereum address format
      if (chains.includes('EVM')) {
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) return true;
      }

      // For other chains or mixed support, accept both formats
      return /^0x[a-fA-F0-9]{40}$/.test(address) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    };
  };

  // Get networks from chains
  const getNetworks = (chains) => {
    const networkMap = {
      'EVM': ['Ethereum', 'BNB Chain', 'Polygon', 'Arbitrum', 'Base', 'Avalanche'],
      'Solana': ['Solana'],
      'Bitcoin': ['Bitcoin'],
      'Cosmos': ['Cosmos']
    };

    const networks = [];
    chains.forEach(chain => {
      if (networkMap[chain]) {
        networks.push(...networkMap[chain]);
      }
    });
    return [...new Set(networks)]; // Remove duplicates
  };

  const [formData, setFormData] = useState({
    walletName: '',
    network: '',
    walletAddress: '',
    syncMode: 'read-only',
    autoRefresh: true,
    notifications: {
      priceAlerts: true,
      whaleMovement: false,
      portfolioAlerts: true,
      securityAlerts: true,
    },
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch wallets on mount
  useEffect(() => {
    const loadWallets = async () => {
      try {
        const fetchedWallets = await fetchWallets();
        setWallets(fetchedWallets);
      } catch (error) {
        console.error('Failed to fetch wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWallets();
  }, []);

  // Update form data when wallet is found
  useEffect(() => {
    if (wallet) {
      const networks = getNetworks(wallet.chains);
      setFormData(prev => ({
        ...prev,
        walletName: wallet.name,
        network: networks[0] || '',
      }));
    }
  }, [wallet]);

  // Redirect if wallet not found
  useEffect(() => {
    if (!loading && !wallet) {
      navigate('/');
    }
  }, [loading, wallet, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading wallet...</div>
        </div>
      </Layout>
    );
  }

  if (!wallet) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name in formData.notifications) {
        setFormData(prev => ({
          ...prev,
          notifications: { ...prev.notifications, [name]: checked },
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    } else {
      const addressValidation = getAddressValidation(wallet.chains);
      if (!addressValidation(formData.walletAddress)) {
        newErrors.walletAddress = 'Invalid wallet address format';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;

    setIsConnecting(true);
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsConnecting(false);
    setConnectionSuccess(true);

    // Optional redirect after success
    setTimeout(() => {
      navigate('/portfolio');
    }, 2000);
  };

  const handleImportPortfolio = () => {
    // Simulate import
    alert('Importing existing portfolio...');
  };

  return (
    <div className="wallet-connect-page min-h-screen" style={{
      background: `
        radial-gradient(circle at top, rgba(59,130,246,0.06), transparent 35%),
        linear-gradient(180deg, #020617 0%, #030712 45%, #000814 100%)
      `
    }}>
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative max-w-2xl w-full"
          >
            {/* Cinematic Background Orbs */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/8 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-orange-500/6 rounded-full blur-[120px]" />

            {/* Premium Main Card */}
            <div className="relative" style={{
              background: 'linear-gradient(145deg, rgba(17,24,39,0.96), rgba(3,7,18,0.98))',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.65), 0 0 35px rgba(59,130,246,0.08)',
              borderRadius: '28px',
              backdropFilter: 'blur(20px)'
            }}>
              <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-400/30 shadow-[0_0_40px_rgba(249,115,22,0.12)] mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {wallet.logo.startsWith('http') ? (
                    <img src={wallet.logo} alt={wallet.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <span className="text-4xl">{wallet.logo}</span>
                  )}
                </motion.div>
                <h1 className="text-3xl font-bold mb-2" style={{
                  fontWeight: '800',
                  letterSpacing: '-0.03em',
                  color: '#f8fafc'
                }}>{wallet.name} Connection</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{
                  background: 'rgba(16,185,129,0.10)',
                  border: '1px solid rgba(16,185,129,0.28)',
                  color: '#6ee7b7'
                }}>
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Secure Connection</span>
                </div>
              </div>

              {/* Onboarding steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>Step 1: Configure</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>Step 2: Connect</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>Step 3: Sync</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{
                    background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
                    boxShadow: '0 0 20px rgba(251,146,60,0.35)'
                  }}>1</div>
                  <div className="flex-1 h-1 bg-orange-500/50 mx-2" />
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 text-sm font-bold" style={{
                    background: 'rgba(255,255,255,0.08)'
                  }}>2</div>
                  <div className="flex-1 h-1 bg-slate-600 mx-2" />
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 text-sm font-bold" style={{
                    background: 'rgba(255,255,255,0.08)'
                  }}>3</div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.58)' }}>Wallet Name</label>
                  <input
                    type="text"
                    name="walletName"
                    value={formData.walletName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-400 transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)'
                    }}
                    placeholder="Enter wallet name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.58)' }}>Network</label>
                  <select
                    name="network"
                    value={formData.network}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl text-white transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)'
                    }}
                  >
                    {getNetworks(wallet.chains).map(network => (
                      <option key={network} value={network} className="bg-slate-800">{network}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.58)' }}>Wallet Address</label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl text-white placeholder-slate-400 transition-all duration-200 ${
                      errors.walletAddress ? '' : ''
                    }`}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: errors.walletAddress ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: errors.walletAddress ? '0 0 0 4px rgba(239,68,68,0.08)' : 'none'
                    }}
                    placeholder={`Enter ${wallet.name} address`}
                  />
                  {errors.walletAddress && <p className="text-red-400 text-sm mt-1">{errors.walletAddress}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.58)' }}>Portfolio Sync Mode</label>
                  <select
                    name="syncMode"
                    value={formData.syncMode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl text-white transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)'
                    }}
                  >
                    <option value="read-only" className="bg-slate-800">Read-only</option>
                    <option value="track-balances" className="bg-slate-800">Track balances</option>
                    <option value="track-nfts" className="bg-slate-800">Track NFTs</option>
                    <option value="track-defi" className="bg-slate-800">Track DeFi positions</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.58)' }}>Auto Refresh (every 30s)</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoRefresh"
                      checked={formData.autoRefresh}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.58)' }}>Notification Preferences</label>
                  <div className="space-y-2">
                    {Object.entries(formData.notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={key}
                          checked={value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="ml-2 text-sm capitalize" style={{ color: 'rgba(255,255,255,0.68)' }}>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="mt-8 p-4 rounded-xl" style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.15)'
              }}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#6ee7b7' }}>Your wallet remains fully encrypted</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(110,231,183,0.7)' }}>CoinDash never stores private keys or seed phrases. All connections are read-only and secure.</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 space-y-4">
                <motion.button
                  onClick={handleConnect}
                  disabled={isConnecting || connectionSuccess}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                    connectionSuccess
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : ''
                  }`}
                  style={{
                    background: connectionSuccess
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #f59e0b, #fb923c)',
                    boxShadow: connectionSuccess
                      ? '0 4px 20px rgba(16,185,129,0.25)'
                      : '0 4px 20px rgba(251,146,60,0.25)'
                  }}
                  whileHover={!isConnecting && !connectionSuccess ? { scale: 1.02 } : {}}
                  whileTap={!isConnecting && !connectionSuccess ? { scale: 0.98 } : {}}
                >
                  {isConnecting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </div>
                  ) : connectionSuccess ? (
                    'Wallet Connected Successfully ✓'
                  ) : (
                    'Connect Wallet'
                  )}
                </motion.button>

                <button
                  onClick={handleImportPortfolio}
                  className="w-full py-3 px-6 rounded-xl font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.68)'
                  }}
                >
                  Import Existing Portfolio
                </button>
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </div>
  );
};

export default WalletConnectPage;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { FaApple, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { RiWallet3Fill } from 'react-icons/ri';
import { SiCoinbase } from 'react-icons/si';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';

const AuthModal = () => {
  const { login, signup } = useAuthStore();
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState(authModalMode);

  useEffect(() => {
    setCurrentTab(authModalMode);
  }, [authModalMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = currentTab === 'login'
      ? await login(email, password)
      : await signup(email, password);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  const switchTab = (tab) => {
    setCurrentTab(tab);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9998] bg-[#111315]/95 backdrop-blur-xl"
            onClick={closeAuthModal}
          />

          {/* Premium Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-[480px] bg-[#111317]/95 border border-white/10 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(255,159,47,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.06),transparent_30%)] pointer-events-none" />

              {/* Header Tabs */}
              <div className="relative flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-8">
                  <button
                    onClick={() => switchTab('login')}
                    className={`relative text-[34px] font-semibold transition-all duration-300 ${
                      currentTab === 'login'
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Log In
                    {currentTab === 'login' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-4 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-orange-400 to-purple-500"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => switchTab('signup')}
                    className={`relative text-[34px] font-semibold transition-all duration-300 ${
                      currentTab === 'signup'
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sign Up
                    {currentTab === 'signup' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-4 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-orange-400 to-purple-500"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      />
                    )}
                  </button>
                </div>

                {/* Premium Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeAuthModal}
                  className="p-3 text-slate-400 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,159,47,0.3)]"
                >
                  <IoClose className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="relative px-8 py-8">
                <AnimatePresence mode="wait">
                  {currentTab === 'login' ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Login Form */}
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-[#0b0f1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/15 transition-all duration-300 text-base backdrop-blur-sm"
                            placeholder="Email"
                            required
                          />
                        </div>

                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 pr-12 bg-[#0b0f1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/15 transition-all duration-300 text-base backdrop-blur-sm"
                            placeholder="Password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-400 transition-colors duration-200"
                          >
                            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-sm text-gray-500 hover:text-orange-400 transition-colors duration-200 hover:shadow-[0_0_10px_rgba(255,159,47,0.3)]"
                          >
                            Forgot Password?
                          </button>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3 backdrop-blur-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:from-orange-400/50 disabled:to-orange-500/50 text-slate-950 font-bold py-4 px-6 rounded-xl transition duration-300 ease-out flex items-center justify-center gap-2 shadow-sm hover:brightness-110 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full"
                              />
                              Signing in...
                            </>
                          ) : (
                            'Log In'
                          )}
                        </motion.button>
                      </form>

                      {/* Divider */}
                      <div className="flex items-center my-8">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="px-4 text-sm text-gray-500 font-medium">or</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      </div>

                      {/* Continue with Wallet */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#111827] hover:bg-[#1f2937] border border-white/10 hover:border-orange-400/30 text-white font-medium py-4 px-6 rounded-xl transition duration-300 ease-out flex items-center justify-center gap-3 mb-6 shadow-sm hover:brightness-110"
                      >
                        <RiWallet3Fill className="w-5 h-5 text-orange-400" />
                        Continue with Wallet
                      </motion.button>

                      {/* Social Buttons */}
                      <div className="flex items-center justify-center gap-6">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FaXTwitter className="text-[24px] text-slate-100" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FaFacebookF className="text-[24px] text-[#1877f2]" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FcGoogle className="text-[24px]" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FaApple className="text-[24px] text-white" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Signup Form */}
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-[#0b0f1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/15 transition-all duration-300 text-base backdrop-blur-sm"
                            placeholder="Email"
                            required
                          />
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3 backdrop-blur-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:from-orange-400/50 disabled:to-orange-500/50 text-slate-950 font-bold py-4 px-6 rounded-xl transition duration-300 ease-out flex items-center justify-center gap-2 shadow-sm hover:brightness-110 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full"
                              />
                              Creating account...
                            </>
                          ) : (
                            'Continue'
                          )}
                        </motion.button>
                      </form>

                      {/* Divider */}
                      <div className="flex items-center my-8">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="px-4 text-sm text-gray-500 font-medium">or</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      </div>

                      {/* Continue with Wallet */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#111827] hover:bg-[#1f2937] border border-white/10 hover:border-orange-400/30 text-white font-medium py-4 px-6 rounded-xl transition duration-300 ease-out flex items-center justify-center gap-3 mb-4 shadow-sm hover:brightness-110"
                      >
                        <RiWallet3Fill className="w-5 h-5 text-orange-400" />
                        Continue with Wallet
                      </motion.button>

                      {/* Continue with Coinbase */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#111827] hover:bg-[#1f2937] border border-white/10 hover:border-orange-400/30 text-white font-medium py-4 px-6 rounded-xl transition duration-300 ease-out flex items-center justify-center gap-3 mb-6 shadow-sm hover:brightness-110"
                      >
                        <SiCoinbase className="w-5 h-5 text-blue-400" />
                        Continue with Coinbase
                      </motion.button>

                      {/* Social Buttons */}
                      <div className="flex items-center justify-center gap-6">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FaXTwitter className="text-[24px] text-slate-100" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FaFacebookF className="text-[24px] text-[#1877f2]" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FcGoogle className="text-[24px]" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-14 h-14 rounded-full bg-[#121826] border border-white/10 hover:border-orange-400/40 hover:bg-[#1a2235] flex items-center justify-center transition-all duration-300"
                        >
                          <FaApple className="text-[24px] text-white" />
                        </motion.button>
                      </div>
                      {/* Terms Text */}
                      <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
                        When you create a CoinDash account, you agree to the{' '}
                        <button className="text-orange-400 hover:text-orange-300 underline transition-colors duration-200 hover:shadow-[0_0_10px_rgba(255,159,47,0.3)]">
                          Terms
                        </button>{' '}
                        and{' '}
                        <button className="text-orange-400 hover:text-orange-300 underline transition-colors duration-200 hover:shadow-[0_0_10px_rgba(255,159,47,0.3)]">
                          Privacy Policy
                        </button>
                        .
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
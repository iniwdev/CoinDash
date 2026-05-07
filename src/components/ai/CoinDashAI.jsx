import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoSparkles } from 'react-icons/io5';
import { FiMessageSquare } from 'react-icons/fi';
import './CoinDashAI.css';

const CoinDashAI = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Suggested prompts
  const suggestedPrompts = [
    "What's the one number about my portfolio that would surprise me?",
    "Roast my portfolio",
    "Top crypto trends this week",
    "Should I rebalance my holdings?",
    "Explain Bitcoin dominance",
    "Best AI coins right now",
    "What's happening with Ethereum staking?",
    "DeFi yield farming strategies"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMounted, onClose]);

  // Handle suggested prompt click
  const handleSuggestedPrompt = (prompt) => {
    setInputValue(prompt);
    handleSendMessage(prompt);
  };

  // Handle sending message
  const handleSendMessage = async (message = inputValue.trim()) => {
    if (!message || isLoading) return;

    const userMessage = {
      role: "user",
      content: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = message;

    setInputValue("");
    setIsLoading(true);

    try {
      console.log("Sending request...");

      const response = await fetch(
        "http://localhost:5000/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: currentInput,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      console.log("AI data:", data);

      const aiMessage = {
        role: "assistant",
        content:
          data.reply ||
          "CoinDash AI could not generate a response.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Server connection failed. Please check backend and API route.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Typing animation component
  const TypingIndicator = () => (
    <div className="flex items-center space-x-1 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-xs text-slate-400 ml-2">CoinDash AI is thinking...</span>
    </div>
  );

  if (!isMounted) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="ai-overlay" onClick={onClose}>
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="ai-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 via-transparent to-orange-500/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <IoSparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-purple-500/30 to-orange-500/30 blur-lg animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">CoinDash AI</h2>
                <p className="text-sm text-slate-400">Your premium crypto assistant</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <IoClose className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col h-[calc(100%-140px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                // Empty state with suggested prompts
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center mb-6">
                    <FiMessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ask CoinDash AI</h3>
                  <p className="text-slate-400 mb-8 max-w-md">
                    Get personalized insights about your portfolio, crypto trends, and investment strategies.
                  </p>

                  {/* Suggested Prompts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="p-4 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 group"
                      >
                        <p className="text-sm text-slate-300 group-hover:text-white leading-relaxed">
                          {prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Messages
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
                            : 'bg-white/10 border border-white/10 text-slate-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className="text-xs opacity-60 mt-2">
                          {message.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/10 bg-slate-900/50">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your portfolio, crypto trends, or anything else..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 resize-none min-h-[44px] max-h-[120px]"
                    rows={1}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-700 rounded-2xl text-white font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
                >
                  <IoSend className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CoinDashAI;
/**
 * CoinDashAI.jsx — CoinDash AI
 *
 * Production-grade AI chat panel.
 *
 * Key upgrades over the previous version:
 *  - Uses aiService.js (Axios + interceptors) instead of raw fetch
 *  - AbortController via aiService cancels stale in-flight requests
 *  - Typing animation with character-by-character text reveal on AI replies
 *  - Distinct error bubble (red accent) vs normal AI reply bubble
 *  - Loading skeleton while waiting for first token
 *  - Mobile-responsive layout preserved from original CSS
 *  - All Framer Motion transitions preserved exactly
 *  - useRef guard prevents React state updates after unmount
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoSparkles, IoRefresh } from 'react-icons/io5';
import { FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { sendChatMessage, cancelActiveRequest } from '../aiService';
import './CoinDashAI.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  "What's the one number about my portfolio that would surprise me?",
  "Roast my portfolio",
  "Top crypto trends this week",
  "Should I rebalance my holdings?",
  "Explain Bitcoin dominance",
  "Best AI coins right now",
  "What's happening with Ethereum staking?",
  "DeFi yield farming strategies",
];

// Typing reveal speed in milliseconds per character
const TYPING_SPEED_MS = 8;


// ── Sub-components ────────────────────────────────────────────────────────────

/** Three-dot pulsing indicator shown while waiting for the AI response */
const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-1 py-1">
    <div className="flex gap-1">
      {[0, 150, 300].map((delay) => (
        <div
          key={delay}
          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
    <span className="text-xs text-slate-400">CoinDash AI is thinking...</span>
  </div>
);

/** Skeleton shimmer shown for the AI bubble while streaming begins */
const MessageSkeleton = () => (
  <div className="flex justify-start">
    <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 max-w-[75%] w-64">
      <TypingIndicator />
    </div>
  </div>
);

/**
 * A single chat bubble.
 * AI bubbles support a character-by-character reveal animation via the
 * `isTyping` + `displayText` props.
 */
const MessageBubble = ({ message }) => {
  const isUser   = message.role === 'user';
  const isError  = message.isError === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={[
          'max-w-[80%] px-4 py-3 rounded-2xl',
          isUser
            ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
            : isError
              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
              : 'bg-white/10 border border-white/10 text-slate-200',
        ].join(' ')}
      >
        {/* Error icon for error bubbles */}
        {isError && (
          <div className="flex items-center gap-2 mb-1">
            <FiAlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-xs text-red-400 font-medium">Error</span>
          </div>
        )}

        <p className="message-content text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.displayText ?? message.content}
          {/* Blinking cursor while text is still being revealed */}
          {message.isTyping && (
            <span className="ai-cursor" aria-hidden="true">▌</span>
          )}
        </p>

        <p className="text-xs opacity-50 mt-2 select-none">{message.time}</p>
      </div>
    </motion.div>
  );
};


// ── Main component ────────────────────────────────────────────────────────────
const CoinDashAI = ({ onClose }) => {
  const [messages,           setMessages]           = useState([]);
  const [inputValue,         setInputValue]         = useState('');
  const [isLoading,          setIsLoading]          = useState(false);
  const [isMounted,          setIsMounted]          = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const isMountedRef   = useRef(true);   // guards async state updates after unmount
  const typingTimerRef = useRef(null);   // holds the setInterval for text reveal


  // ── Lifecycle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cancelActiveRequest();                      // cancel any in-flight Groq call
      clearInterval(typingTimerRef.current);      // stop any active text reveal
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMounted, onClose]);

  // Auto-scroll to bottom on new messages or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);


  // ── Text reveal animation ───────────────────────────────────────────────────
  /**
   * Animates `fullText` into the message with id `msgId` one character at a
   * time. When complete, marks isTyping=false so the cursor disappears.
   */
  const animateTyping = useCallback((msgId, fullText) => {
    clearInterval(typingTimerRef.current);
    let charIndex = 0;

    typingTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        clearInterval(typingTimerRef.current);
        return;
      }

      charIndex += 1;
      const slice = fullText.slice(0, charIndex);
      const done  = charIndex >= fullText.length;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, displayText: slice, isTyping: !done }
            : m
        )
      );

      if (done) clearInterval(typingTimerRef.current);
    }, TYPING_SPEED_MS);
  }, []);


  // ── Send message ────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (message = inputValue.trim()) => {
    if (!message || isLoading) return;

    const userMsgId = Date.now();
    const now = () =>
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user bubble immediately
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: message, time: now() },
    ]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(message);

      // sendChatMessage returns null when the request was intentionally aborted
      if (reply === null || !isMountedRef.current) return;

      const aiMsgId = Date.now() + 1;

      // Insert bubble with empty displayText + isTyping=true
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: 'assistant',
          content: reply,
          displayText: '',
          isTyping: true,
          time: now(),
        },
      ]);

      // Kick off the character-by-character reveal
      animateTyping(aiMsgId, reply);

    } catch (err) {
      if (!isMountedRef.current) return;

      const aiErrId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        {
          id: aiErrId,
          role: 'assistant',
          content: err.message || 'Something went wrong. Please try again.',
          displayText: err.message || 'Something went wrong. Please try again.',
          isError: true,
          time: now(),
        },
      ]);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [inputValue, isLoading, animateTyping]);


  // ── Retry last message ──────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    // Find the last user message and re-send it
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      // Remove the error bubble before retrying
      setMessages((prev) => prev.filter((m) => !m.isError));
      handleSendMessage(lastUser.content);
    }
  }, [messages, handleSendMessage]);


  // ── Input handlers ──────────────────────────────────────────────────────────
  const handleSuggestedPrompt = useCallback((prompt) => {
    setInputValue(prompt);
    handleSendMessage(prompt);
  }, [handleSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);


  // ── Early return before portal mounts ──────────────────────────────────────
  if (!isMounted) return null;

  // Check if the last message is an error (to show Retry button)
  const lastMsg        = messages[messages.length - 1];
  const showRetry      = lastMsg?.isError && !isLoading;
  const hasMessages    = messages.length > 0;

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
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 via-transparent to-orange-500/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <IoSparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-purple-500/30 to-orange-500/30 blur-lg animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">CoinDash AI</h2>
                <p className="text-sm text-slate-400">Your premium crypto assistant</p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close AI chat"
              className="p-2 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <IoClose className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </button>
          </div>

          {/* ── Content ────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col h-[calc(100%-140px)]">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {!hasMessages ? (
                /* ── Empty state / Suggested prompts ──────────────────────── */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center mb-6">
                    <FiMessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ask CoinDash AI</h3>
                  <p className="text-slate-400 mb-8 max-w-md">
                    Get personalized insights about your portfolio, crypto trends, and market strategies.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        disabled={isLoading}
                        className="suggested-prompt p-4 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <p className="text-sm text-slate-300 group-hover:text-white leading-relaxed">
                          {prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Message thread ────────────────────────────────────────── */
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}

                  {/* Loading skeleton — only shown before the AI bubble appears */}
                  {isLoading && <MessageSkeleton />}

                  {/* Retry button when last message is an error */}
                  {showRetry && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start pl-1"
                    >
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <IoRefresh className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    </motion.div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ───────────────────────────────────────────────── */}
            <div className="p-6 border-t border-white/10 bg-slate-900/50">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    id="ai-chat-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about your portfolio, crypto trends, or anything else..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 resize-none min-h-[44px] max-h-[120px] transition-all"
                    rows={1}
                    disabled={isLoading}
                    aria-label="Chat message input"
                  />
                </div>

                <button
                  id="ai-chat-send"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-700 rounded-2xl text-white font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  <IoSend className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-slate-500 mt-3 text-center select-none">
                CoinDash AI is not a financial advisor. Always do your own research.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CoinDashAI;
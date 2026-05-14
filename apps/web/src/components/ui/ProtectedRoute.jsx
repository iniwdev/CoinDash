/**
 * ProtectedRoute.jsx — CoinDash AI
 *
 * Guards routes that require authentication.
 * Uses the auth modal pattern (matching existing UX) instead of hard redirects.
 *
 *  authStatus === 'idle' | 'loading' → full-screen spinner
 *  authStatus === 'authenticated'    → renders children
 *  authStatus === 'unauthenticated'  → gate page + opens auth modal
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function ProtectedRoute({ children }) {
  const authStatus = useAuthStore((s) => s.authStatus);
  const accessToken = useAuthStore((s) => s.accessToken);
  const openAuthModal = useUIStore((s) => s.openAuthModal);

  // If store is idle with no token, there's nothing to restore — treat as unauthenticated
  const effectiveStatus = (authStatus === 'idle' && !accessToken) ? 'unauthenticated' : authStatus;

  useEffect(() => {
    if (effectiveStatus === 'unauthenticated') {
      openAuthModal('login');
    }
  }, [effectiveStatus, openAuthModal]);

  // ── Loading / idle-with-token: restore session is in progress ─────────────
  if (effectiveStatus === 'loading' || (authStatus === 'idle' && !!accessToken)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-orange-400/30 border-t-orange-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400 text-sm tracking-widest uppercase">
            Authenticating…
          </p>
        </div>
      </div>
    );
  }

  // ── Unauthenticated: show a gate page while the modal is opening ──────────
  if (effectiveStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          {/* Lock icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-orange-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-3">
            Sign in required
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This page is only available to authenticated users.
            Please log in or create an account to continue.
          </p>

          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-slate-950 font-semibold text-sm shadow-[0_8px_32px_-8px_rgba(247,147,26,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(247,147,26,0.8)] hover:scale-[1.02] transition-all duration-300"
          >
            Log in to CoinDash
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Authenticated ─────────────────────────────────────────────────────────
  return children;
}

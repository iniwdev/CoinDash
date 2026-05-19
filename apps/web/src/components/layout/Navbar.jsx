import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUIStore } from "@/store/uiStore";
import { useCoins } from "@/features/market-data/api/useCoins";
import { useAuthStore } from "@/store/authStore";
import SearchDropdown from "@/features/market-data/components/SearchDropdown";

const Navbar = React.memo(() => {
  const { searchQuery, setSearchQuery, openAuthModal } = useUIStore();
  const { data: coins = [] } = useCoins();
  const { user, authStatus, logout } = useAuthStore();
  const [query, setQuery] = useState(searchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    navigate('/');
  };

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setIsDropdownOpen(false);
    }
  }, [query]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return coins
      .filter((coin) => {
        const name = String(coin.name ?? '').toLowerCase();
        const symbol = String(coin.symbol ?? '').toLowerCase();
        return name.includes(normalizedQuery) || symbol.includes(normalizedQuery);
      })
      .slice(0, 5);
  }, [coins, query]);

  const handleSelectCoin = (coin) => {
    setQuery(coin.name);
    setSearchQuery(coin.name);
    setIsDropdownOpen(false);
    navigate(`/coin/${coin.id}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        const searchInput = document.getElementById('navbar-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-[0_18px_50px_-24px_rgba(0,0,0,0.75)] bg-slate-950/90' : 'bg-slate-950/95'}`}>
      <div className="max-w-[1920px] 2xl:max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-3">
        <div className="flex items-center justify-between gap-4 min-h-[64px]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <span className="font-semibold tracking-tight text-white">CoinDash</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="flex items-center justify-center gap-6 whitespace-nowrap overflow-x-auto min-w-0 px-2 py-1">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Home
              </Link>
              <Link
                to="/coins"
                className={`text-sm font-medium transition-colors ${isActive('/coins') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Coins
              </Link>
              <Link
                to="/watchlist"
                className={`text-sm font-medium transition-colors ${isActive('/watchlist') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Watchlist
              </Link>
              <Link
                to="/portfolio"
                className={`text-sm font-medium transition-colors ${isActive('/portfolio') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Portfolio
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="relative hidden lg:flex min-w-[220px] max-w-[300px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                id="navbar-search-input"
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => query.trim() && setIsDropdownOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigate('/coins');
                  }
                }}
                placeholder="Search coins..."
                className="w-full rounded-full border border-white/10 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <SearchDropdown
                results={isDropdownOpen ? searchResults : []}
                onSelect={handleSelectCoin}
                onClose={() => setIsDropdownOpen(false)}
              />
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-primary hover:text-white hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a7.5 7.5 0 0 0 .6-3 7.5 7.5 0 0 0-.6-3l2.1-1.6a0.5 0.5 0 0 0 .1-.8l-2-3.4a0.5 0.5 0 0 0-.7-.2l-2.5 1a7.4 7.4 0 0 0-2.6-1.5l-.4-2.7A0.5 0.5 0 0 0 14 1H10a0.5 0.5 0 0 0-.5.4L9.1 4a7.4 7.4 0 0 0-2.6 1.5l-2.5-1a0.5 0.5 0 0 0-.7.2L1.3 7.1a0.5 0.5 0 0 0 .1.8L3.5 9.6a7.5 7.5 0 0 0-.6 3 7.5 7.5 0 0 0 .6 3L1.4 17a0.5 0.5 0 0 0-.1.8l2 3.4a0.5 0.5 0 0 0 .7.2l2.5-1a7.4 7.4 0 0 0 2.6 1.5l.4 2.7A0.5 0.5 0 0 0 10 23h4a0.5 0.5 0 0 0 .5-.4l.4-2.7a7.4 7.4 0 0 0 2.6-1.5l2.5 1a0.5 0.5 0 0 0 .7-.2l2-3.4a0.5 0.5 0 0 0-.1-.8l-2.1-1.6Z" />
              </svg>
            </button>
            {user ? (
              <>
                <span className="text-sm text-slate-300 hidden sm:inline">
                  {user.email?.split('@')[0] ?? 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  type="button"
                  className="text-sm font-medium text-slate-300 transition hover:text-white disabled:opacity-50"
                >
                  {isLoggingOut ? 'Signing out…' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  type="button"
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  type="button"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_16px_32px_-16px_rgba(247,147,26,0.9)] transition duration-300 hover:shadow-[0_24px_56px_-24px_rgba(247,147,26,0.9)] hover:scale-[1.01]"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
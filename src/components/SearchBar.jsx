import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext.jsx';
import { useCrypto } from '../context/CryptoContext.jsx';
import SearchDropdown from './SearchDropdown';

const SearchBar = React.memo(() => {
  const { query: searchQuery, setQuery: setSearchQuery } = useSearch();
  const { coins } = useCrypto();
  const [query, setQuery] = useState(searchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setIsDropdownOpen(false);
    }
  }, [query]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

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

  return (
    <section className="section-spacing bg-background fade-in-section">
      <div className="content-width">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Search Cryptocurrencies</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Find and track your favorite coins with a fast, modern search experience.</p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            {/* Search Icon */}
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>

            {/* Search Input */}
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => query.trim() && setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/coins');
                }
              }}
              placeholder="Search for coins..."
              id="search-input"
              className="w-full rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 pl-14 pr-6 py-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] transition duration-300 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-slate-900/80 outline-none hover:border-white/20"
            />
            <SearchDropdown
              results={isDropdownOpen ? searchResults : []}
              onSelect={handleSelectCoin}
              onClose={() => setIsDropdownOpen(false)}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

export default SearchBar;

import { useEffect, useRef } from 'react';

const SearchDropdown = ({ results, onSelect, onClose }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl text-sm transition duration-200 ease-out"
    >
      {results.map((coin) => (
        <button
          key={coin.id}
          type="button"
          onClick={() => onSelect(coin)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5 focus:bg-white/10"
        >
          {coin.icon ? (
            <img src={coin.icon} alt={coin.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold uppercase text-slate-300">
              {coin.symbol?.slice(0, 2) || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{coin.name}</p>
            <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-400">{coin.symbol}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SearchDropdown;

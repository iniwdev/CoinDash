import { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Star, ExternalLink } from 'lucide-react';
import { exchangeMeta } from '../../data/exchangeMeta';

const normalizeExchangeName = (name) => {
  if (!name) return '';
  const cleaned = name.toLowerCase();

  if (cleaned.includes('binance')) return 'Binance';
  if (cleaned.includes('coinbase')) return 'Coinbase';
  if (cleaned.includes('kraken')) return 'Kraken';
  if (cleaned.includes('okx') || cleaned.includes('okcoin')) return 'OKX';
  if (cleaned.includes('bybit')) return 'Bybit';
  if (cleaned.includes('bitget')) return 'Bitget';
  if (cleaned.includes('crypto.com') || cleaned.includes('cryptocom')) return 'Crypto.com';
  if (cleaned.includes('kucoin')) return 'KuCoin';
  if (cleaned.includes('huobi')) return 'Huobi';
  if (cleaned.includes('gate.io') || cleaned.includes('gateio') || cleaned === 'gate' || cleaned.includes(' gate')) return 'Gateio';
  if (cleaned.includes('bithumb')) return 'Bithumb';
  if (cleaned.includes('mexc')) return 'MEXC';
  if (cleaned.includes('gemini')) return 'Gemini';
  if (cleaned.includes('phemex')) return 'Phemex';
  if (cleaned.includes('ftx')) return 'FTX';
  if (cleaned.includes('deribit')) return 'Deribit';

  return name;
};

const getExchangeInfo = (exchange) => {
  const key = normalizeExchangeName(exchange);
  return exchangeMeta[key] || null;
};

const exchangeAvatarStyles = {
  Binance: { initials: 'B', bg: '#F3BA2F', fg: '#101010' },
  Coinbase: { initials: 'CB', bg: '#0052FF', fg: '#FFFFFF' },
  Kraken: { initials: 'K', bg: '#2B2B2B', fg: '#FFFFFF' },
  OKX: { initials: 'OK', bg: '#0090FF', fg: '#FFFFFF' },
  Bybit: { initials: 'B', bg: '#000000', fg: '#FFFFFF' },
  Bitget: { initials: 'BG', bg: '#FF7B00', fg: '#101010' },
  'Crypto.com': { initials: 'C', bg: '#1F7BFF', fg: '#FFFFFF' },
  KuCoin: { initials: 'K', bg: '#00B14F', fg: '#FFFFFF' },
  Huobi: { initials: 'H', bg: '#00A0FF', fg: '#FFFFFF' },
  Gateio: { initials: 'G', bg: '#FFBD00', fg: '#101010' },
  Bithumb: { initials: 'B', bg: '#140D5D', fg: '#FFFFFF' },
  MEXC: { initials: 'M', bg: '#FF6A00', fg: '#101010' },
  Gemini: { initials: 'G', bg: '#00B7FF', fg: '#101010' },
  Phemex: { initials: 'P', bg: '#FFC300', fg: '#101010' },
  FTX: { initials: 'F', bg: '#5679FF', fg: '#FFFFFF' },
  Deribit: { initials: 'D', bg: '#1A1A1A', fg: '#FFFFFF' },
};

const ExchangeLogo = ({ exchange }) => {
  const normalizedName = normalizeExchangeName(exchange);
  const data = exchangeAvatarStyles[normalizedName] || {
    initials: (exchange || 'EX').slice(0, 2).toUpperCase(),
    bg: '#0F172A',
    fg: '#F8FAFC',
  };

  return (
    <svg viewBox="0 0 40 40" className="h-full w-full text-center">
      <rect width="40" height="40" rx="12" fill={data.bg} />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill={data.fg}
        dominantBaseline="middle"
      >
        {data.initials}
      </text>
    </svg>
  );
};

const formatCurrency = (value, currency = 'USD') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  if (currency === 'USD') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} ${currency}`;
};

const formatLarge = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toLocaleString()}`;
};

const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
    ))}
  </div>
);

const CoinMarketsTable = ({ coin, limit, onSeeFullMarkets }) => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [marketType, setMarketType] = useState('spot');
  const [sortBy, setSortBy] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [favoriteMarkets, setFavoriteMarkets] = useState(new Set());

  const itemsPerPage = limit || 10;

  useEffect(() => {
    const fetchMarkets = async () => {
      if (!coin?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Try direct fetch first, then fallback to CORS proxy if needed
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}/tickers?include_exchange_logo=false`;
        let response;

        try {
          response = await fetch(apiUrl);
        } catch (corsError) {
          // Fallback to CORS proxy
          response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
          const corsData = await response.json();
          const data = JSON.parse(corsData.contents);
          const tickers = data.tickers || [];

          // Process tickers...
          const processed = tickers
            .filter(ticker => {
              if (!ticker.market || !ticker.last) return false;
              if (marketType === 'spot' && ticker.is_stale) return false;
              return true;
            })
            .map((ticker, index) => {
              const [base, target] = ticker.target.split('/');
              const volume = ticker.volume || 0;

              return {
                id: `${ticker.market?.name}-${index}`,
                rank: index + 1,
                exchange: ticker.market?.name || 'Unknown',
                pair: ticker.target,
                base: base || coin.symbol,
                target: target || 'USD',
                price: ticker.last || 0,
                volume: volume,
                volumePercent: 0,
                trustScore: ticker.trust_score || 'low',
                lastUpdated: ticker.last_traded_at ? new Date(ticker.last_traded_at).toLocaleString() : '—',
                bidAskSpread: ticker.bid_ask_spread_percentage || null,
                isFavorite: false,
              };
            });

          const totalVolume = processed.reduce((sum, m) => sum + m.volume, 0);
          const processed2 = processed.map(m => ({
            ...m,
            volumePercent: totalVolume > 0 ? ((m.volume / totalVolume) * 100).toFixed(2) : 0,
          }));

          setMarkets(processed2);
          setLoading(false);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch markets');

        const data = await response.json();
        const tickers = data.tickers || [];

        // Process and filter tickers
        const processed = tickers
          .filter(ticker => {
            if (!ticker.market || !ticker.last) return false;
            // Filter by market type
            if (marketType === 'spot' && ticker.is_stale) return false;
            return true;
          })
          .map((ticker, index) => {
            const [base, target] = ticker.target.split('/');
            const volume = ticker.volume || 0;

            return {
              id: `${ticker.market?.name}-${index}`,
              rank: index + 1,
              exchange: ticker.market?.name || 'Unknown',
              pair: ticker.target,
              base: base || coin.symbol,
              target: target || 'USD',
              price: ticker.last || 0,
              volume: volume,
              volumePercent: 0, // Will calculate after sum
              trustScore: ticker.trust_score || 'low',
              lastUpdated: ticker.last_traded_at ? new Date(ticker.last_traded_at).toLocaleString() : '—',
              bidAskSpread: ticker.bid_ask_spread_percentage || null,
              isFavorite: false,
            };
          });

        // Calculate volume percentages
        const totalVolume = processed.reduce((sum, m) => sum + m.volume, 0);
        const processed2 = processed.map(m => ({
          ...m,
          volumePercent: totalVolume > 0 ? ((m.volume / totalVolume) * 100).toFixed(2) : 0,
        }));

        setMarkets(processed2);
      } catch (err) {
        console.error('Market fetch error:', err);

        // Fallback to mock data for development
        const mockMarkets = [
          {
            id: 'binance-1',
            rank: 1,
            exchange: 'Binance',
            pair: `${coin.symbol}/USDT`,
            base: coin.symbol,
            target: 'USDT',
            price: coin.price,
            volume: coin.volume || 0,
            volumePercent: 25.5,
            trustScore: 'high',
            lastUpdated: new Date().toLocaleString(),
          },
          {
            id: 'coinbase-2',
            rank: 2,
            exchange: 'Coinbase',
            pair: `${coin.symbol}/USD`,
            base: coin.symbol,
            target: 'USD',
            price: coin.price * 1.001,
            volume: (coin.volume || 0) * 0.8,
            volumePercent: 18.3,
            trustScore: 'high',
            lastUpdated: new Date().toLocaleString(),
          },
          {
            id: 'kraken-3',
            rank: 3,
            exchange: 'Kraken',
            pair: `${coin.symbol}/USD`,
            base: coin.symbol,
            target: 'USD',
            price: coin.price * 0.999,
            volume: (coin.volume || 0) * 0.6,
            volumePercent: 14.2,
            trustScore: 'high',
            lastUpdated: new Date().toLocaleString(),
          },
          {
            id: 'okx-4',
            rank: 4,
            exchange: 'OKX',
            pair: `${coin.symbol}/USDT`,
            base: coin.symbol,
            target: 'USDT',
            price: coin.price * 1.002,
            volume: (coin.volume || 0) * 0.7,
            volumePercent: 16.8,
            trustScore: 'medium',
            lastUpdated: new Date().toLocaleString(),
          },
          {
            id: 'bybit-5',
            rank: 5,
            exchange: 'Bybit',
            pair: `${coin.symbol}/USDT`,
            base: coin.symbol,
            target: 'USDT',
            price: coin.price * 1.0015,
            volume: (coin.volume || 0) * 0.5,
            volumePercent: 12.1,
            trustScore: 'medium',
            lastUpdated: new Date().toLocaleString(),
          },
          {
            id: 'bitget-6',
            rank: 6,
            exchange: 'Bitget',
            pair: `${coin.symbol}/USDT`,
            base: coin.symbol,
            target: 'USDT',
            price: coin.price * 1.003,
            volume: (coin.volume || 0) * 0.4,
            volumePercent: 9.2,
            trustScore: 'low',
            lastUpdated: new Date().toLocaleString(),
          },
          {
            id: 'crypto-7',
            rank: 7,
            exchange: 'Crypto.com',
            pair: `${coin.symbol}/USD`,
            base: coin.symbol,
            target: 'USD',
            price: coin.price * 1.0005,
            volume: (coin.volume || 0) * 0.35,
            volumePercent: 7.9,
            trustScore: 'high',
            lastUpdated: new Date().toLocaleString(),
          },
          {
            id: 'kucoin-8',
            rank: 8,
            exchange: 'KuCoin',
            pair: `${coin.symbol}/USDT`,
            base: coin.symbol,
            target: 'USDT',
            price: coin.price * 1.0025,
            volume: (coin.volume || 0) * 0.3,
            volumePercent: 5.4,
            trustScore: 'medium',
            lastUpdated: new Date().toLocaleString(),
          },
        ];

        setMarkets(mockMarkets);
        // Optionally show a subtle message that this is mock data
        // setError('Showing sample market data...');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [coin?.id, marketType, coin?.price, coin?.volume, coin?.symbol]);

  // Sort and paginate
  const sortedMarkets = useMemo(() => {
    let sorted = [...markets];

    // Sort
    sorted.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle different types
      if (sortBy === 'volume' || sortBy === 'volumePercent' || sortBy === 'price') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [markets, sortBy, sortOrder]);

  const paginatedMarkets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedMarkets.slice(start, start + itemsPerPage);
  }, [sortedMarkets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedMarkets.length / itemsPerPage);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const toggleFavorite = (marketId) => {
    const newFavorites = new Set(favoriteMarkets);
    if (newFavorites.has(marketId)) {
      newFavorites.delete(marketId);
    } else {
      newFavorites.add(marketId);
    }
    setFavoriteMarkets(newFavorites);
  };

  const SortHeader = ({ label, column, current, order }) => (
    <button
      onClick={() => toggleSort(column)}
      className="flex items-center gap-1 font-medium text-slate-300 hover:text-white transition group"
    >
      {label}
      <span className="inline-flex flex-col gap-0.5 ml-1 opacity-50 group-hover:opacity-100 transition">
        {current === column ? (
          order === 'asc' ? (
            <ChevronUp className="h-3 w-3 -mb-1" />
          ) : (
            <ChevronDown className="h-3 w-3 -mt-1" />
          )
        ) : (
          <>
            <ChevronUp className="h-3 w-3 -mb-1" />
            <ChevronDown className="h-3 w-3 -mt-1" />
          </>
        )}
      </span>
    </button>
  );

  if (!coin) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-slate-400">No coin data available</p>
      </div>
    );
  }

  const displayedMarkets = limit ? sortedMarkets.slice(0, limit) : paginatedMarkets;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Trading Markets</p>
            <h2 className="mt-2 text-2xl font-semibold text-white truncate break-words">
              {coin.name} Markets
            </h2>
          </div>
          {!limit && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMarketType('spot')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  marketType === 'spot'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                Spot
              </button>
              <button
                onClick={() => setMarketType('derivatives')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  marketType === 'derivatives'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                Perps
              </button>
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition flex items-center gap-2">
                <Star className="h-4 w-4" />
                Add to Favorites
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <TableSkeleton />
        ) : sortedMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No markets available for {coin.name}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left h-12">
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium">#</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium">Exchange</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium">Pair</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium">
                    <SortHeader label="Volume (24H)" column="volume" current={sortBy} order={sortOrder} />
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium">
                    <SortHeader label="Volume %" column="volumePercent" current={sortBy} order={sortOrder} />
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium">
                    <SortHeader label="Price" column="price" current={sortBy} order={sortOrder} />
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium">Last Updated</th>
                  {!limit && <th className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400 font-medium w-8"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedMarkets.map((market, idx) => (
                  <tr
                    key={market.id}
                    className="hover:bg-white/5 transition group h-16"
                  >
                    <td className="px-4 py-3 text-slate-300 align-middle">{limit ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3 align-middle">
                      {(() => {
                        const info = getExchangeInfo(market.exchange);
                        const link = info?.url;
                        const content = (
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-950/80 shadow-[0_0_30px_rgba(245,158,11,0.08)] overflow-hidden border border-white/10 transition group-hover:scale-[1.02] flex-shrink-0">
                              <ExchangeLogo exchange={market.exchange} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-300 font-semibold truncate text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                  {market.exchange}
                                </span>
                                {link && (
                                  <ExternalLink className="h-3 w-3 text-orange-400 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          </div>
                        );

                        return link ? (
                          <a href={link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition">
                            {content}
                          </a>
                        ) : content;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium align-middle">{market.pair}</td>
                    <td className="px-4 py-3 text-slate-300 align-middle">{formatLarge(market.volume)}</td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-orange-400 font-medium">{market.volumePercent}%</span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium align-middle">{formatCurrency(market.price)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs align-middle">
                      {market.lastUpdated === '—' ? '—' : market.lastUpdated.split(',')[0]}
                    </td>
                    {!limit && (
                      <td className="px-4 py-3 align-middle">
                        <button
                          onClick={() => toggleFavorite(market.id)}
                          className="opacity-0 group-hover:opacity-100 transition"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              favoriteMarkets.has(market.id)
                                ? 'fill-orange-400 text-orange-400'
                                : 'text-slate-500 hover:text-orange-400'
                            }`}
                          />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {limit && onSeeFullMarkets && (
              <div className="mt-4 text-center">
                <button
                  onClick={onSeeFullMarkets}
                  className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  See Full Markets →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination - only for full view */}
      {!limit && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg px-3 py-2 text-sm bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition border border-white/10"
          >
            ‹
          </button>

          {/* Page numbers */}
          {(() => {
            const pages = [];
            const showEllipsis = totalPages > 7;
            
            if (!showEllipsis) {
              // Show all pages if 7 or fewer
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // Show smart pagination with ellipsis
              if (currentPage <= 4) {
                // Near start: 1 2 3 4 5 ... last
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
              } else if (currentPage >= totalPages - 3) {
                // Near end: 1 ... last-4 last-3 last-2 last-1 last
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                // Middle: 1 ... current-1 current current+1 ... last
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
              }
            }

            return pages.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-2 text-slate-500">
                    ...
                  </span>
                );
              }
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition border ${
                    currentPage === page
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                  }`}
                >
                  {page}
                </button>
              );
            });
          })()}

          {/* Next button */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg px-3 py-2 text-sm bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition border border-white/10"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default CoinMarketsTable;
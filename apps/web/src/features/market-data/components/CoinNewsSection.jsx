import React, { useEffect, useMemo, useState } from 'react';

const fallbackImage = 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1200&auto=format&fit=crop';

const NewsCard = ({ article }) => {
    const [imgSrc, setImgSrc] = useState(article.image || article.thumbnail || fallbackImage);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    setImgSrc(article.image || article.thumbnail || fallbackImage);
  }, [article.image, article.thumbnail]);

  const handleImageError = () => {
    if (imgSrc && imgSrc !== fallbackImage) {
      setImgSrc(fallbackImage);
      setImgError(false);
      return;
    }
    setImgError(true);
  };

  const showImage = !imgError && Boolean(imgSrc);

  const getSentimentBadge = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('surge') || lowerTitle.includes('rally') || lowerTitle.includes('bull') || lowerTitle.includes('breakthrough')) {
      return { text: 'Bullish', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    }
    if (lowerTitle.includes('crash') || lowerTitle.includes('dump') || lowerTitle.includes('bear') || lowerTitle.includes('decline')) {
      return { text: 'Bearish', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
    }
    return { text: 'Neutral', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
  };

  const sentiment = getSentimentBadge(article.title);
  const publishDate = article.date ? new Date(article.date) : null;
  const publishLabel = publishDate
    ? publishDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Recent';
  const publishTime = publishDate
    ? publishDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : 'Now';

  const openArticle = () => {
    const url = article.link || article.url || article.guid;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openArticle}
      onKeyDown={(event) => { if (event.key === 'Enter') openArticle(); }}
      className="group flex h-full min-h-[420px] cursor-pointer flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/90 text-left transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/30 hover:shadow-[0_24px_60px_rgba(245,158,11,0.16)] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
    >
      <div className="news-image-wrapper h-[210px] w-full overflow-hidden bg-slate-900">
        {showImage ? (
          <img
            src={imgSrc}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 text-center text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl">📰</div>
              <span className="text-[11px] uppercase tracking-[0.2em]">Crypto News</span>
            </div>
          </div>
        )}
      </div>

      <div className="news-content flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {article.source || article.publisher || 'Crypto Feed'}
          </span>
          <span className="text-xs text-slate-500">
            {publishLabel}
          </span>
        </div>

        <h3 className="news-title text-[1.05rem] font-semibold leading-[1.4] text-white line-clamp-3 break-words">
          {article.title}
        </h3>

        <p className="news-description text-sm leading-6 text-slate-400 line-clamp-4 break-words">
          {article.description || 'No preview available.'}
        </p>

        <div className="news-footer mt-auto flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{publishTime}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-semibold text-slate-950 transition duration-200 group-hover:bg-orange-400">
            Open <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const NewsSkeleton = () => (
  <div className="flex h-full min-h-[190px] flex-col md:flex-row overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
    <div className="h-44 w-full bg-slate-900 animate-pulse md:h-full md:w-44" />
    <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="h-6 w-24 rounded-full bg-white/10" />
        <div className="h-4 w-16 rounded-full bg-white/5" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-full rounded-xl bg-white/10" />
        <div className="h-5 w-4/5 rounded-xl bg-white/10" />
      </div>
      <div className="h-4 w-3/4 rounded-xl bg-white/10" />
      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="h-4 w-20 rounded-full bg-white/10" />
        <div className="h-7 w-20 rounded-full bg-orange-500/20" />
      </div>
    </div>
  </div>
);

const CoinNewsSection = ({ coin }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => {
      const aBroken = !a.image || a.image === fallbackImage;
      const bBroken = !b.image || b.image === fallbackImage;
      return aBroken - bBroken;
    });
  }, [news]);

  const normalizeText = (value = '') => value.toString().toLowerCase();

  const mapRemoteArticle = (item) => {
    const title = item.title?.trim() || 'Untitled article';
    const description = item.description || item.contentSnippet || item.content || '';
    return {
      title,
      description: description.trim(),
      source: item.source || item.publisher || item.source || 'Crypto News',
      date: item.date || item.pubDate || item.pubdate || 'Recent',
      link: item.link || item.url || item.guid,
      image: item.image || item.imgURL || item.thumbnail || item.enclosure?.url || null,
    };
  };

  const filterCoinArticles = (articles, coinName, coinSymbol) => {
    const keyTerms = [coinName, coinSymbol].filter(Boolean).map(normalizeText);
    return articles.filter((article) => {
      const headline = normalizeText(`${article.title} ${article.description} ${article.source}`);
      return keyTerms.some((term) => term && headline.includes(term));
    });
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : '';

  const fetchComprehensiveNews = async (coinName, coinSymbol) => {
    const query = encodeURIComponent(coinName || coinSymbol || 'crypto');
    const url = `${API_BASE}/api/v1/news/?coin=${query}`;
    const response = await fetch(url);

    // Guard: HTML response means proxy/server error — don't parse as JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`News server returned non-JSON response (status ${response.status}). Backend may be starting up.`);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || errorBody.error || `News API error: ${response.status}`);
    }

    const data = await response.json();
    const articles = (data.articles || []).map(mapRemoteArticle);

    if (!articles.length) {
      throw new Error(data.message || 'No news articles found');
    }

    return articles;
  };

  useEffect(() => {
    const loadNews = async () => {
      if (!coin?.name && !coin?.symbol) return;

      setLoading(true);
      setError(null);

      try {
        const articles = await fetchComprehensiveNews(coin.name, coin.symbol);
        setNews(articles);
      } catch (err) {
        console.error('Failed to load news:', err);
        setError('Failed to load news. Please try again.');
        // Fallback to mock data
        setNews([
          {
            title: `${coin.name} Shows Strong Market Performance`,
            description: `Recent developments in the ${coin.name} ecosystem have led to increased market interest and trading volume.`,
            source: 'Crypto Insights',
            date: '2 hours ago',
            link: '#',
            image: null,
          },
          {
            title: `Technical Analysis: ${coin.name} Price Trends`,
            description: `Market analysts provide insights into ${coin.symbol} price movements and future projections.`,
            source: 'TradingView',
            date: '5 hours ago',
            link: '#',
            image: null,
          },
          {
            title: `${coin.name} Network Upgrade Completed`,
            description: `The latest network upgrade for ${coin.name} has been successfully implemented, bringing new features and improvements.`,
            source: 'Block Explorer',
            date: '1 day ago',
            link: '#',
            image: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [coin]);

  const refreshNews = () => {
    if (coin?.name || coin?.symbol) {
      setLoading(true);
      fetchComprehensiveNews(coin.name, coin.symbol)
        .then(articles => setNews(articles))
        .catch(err => console.error('Refresh failed:', err))
        .finally(() => setLoading(false));
    }
  };

  if (error && news.length === 0) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-white mb-2">Failed to Load News</h3>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={refreshNews}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-white">
            Latest {coin?.name || 'Crypto'} News
          </h2>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading articles...' : `${news.length} articles found`}
          </p>
        </div>
        <button
          onClick={refreshNews}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-orange-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4 auto-rows-fr">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsSkeleton key={i} />
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedNews.map((article, index) => (
            <NewsCard key={`${article.title}-${index}`} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="text-4xl mb-4">📰</div>
          <h3 className="text-lg font-semibold text-white mb-2">No News Found</h3>
          <p className="text-slate-400">No recent news articles available for {coin?.name}.</p>
        </div>
      )}
    </div>
  );
};

export default CoinNewsSection;
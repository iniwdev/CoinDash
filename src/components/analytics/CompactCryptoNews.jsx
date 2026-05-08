import React from 'react';

const CompactCryptoNews = ({ articles }) => {
  const displayArticles = articles?.length > 0 ? articles : [
    {
      title: 'Bitcoin ETF inflows reach record levels as institutional adoption accelerates',
      source: 'CoinDesk',
      date: '2h ago',
      link: '#',
    },
    {
      title: 'Ethereum staking rewards hit all-time high amid network upgrades',
      source: 'The Block',
      date: '5h ago',
      link: '#',
    },
    {
      title: 'Crypto volatility drops as traders await key macroeconomic data',
      source: 'Bloomberg',
      date: '8h ago',
      link: '#',
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Latest News</p>
          <p className="mt-1 text-xs text-slate-400">Market-moving headlines and insights</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {displayArticles.slice(0, 3).map((article, index) => (
          <a
            key={`${article.title}-${index}`}
            href={article.link || article.url}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl border border-white/5 bg-slate-900/50 p-3 transition hover:-translate-y-0.5 hover:border-orange-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.source || 'news'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">📰</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                  {article.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span className="truncate">{article.source || article.publisher || 'Crypto Feed'}</span>
                  <span>•</span>
                  <span>{article.date || article.pubDate || 'Recent'}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CompactCryptoNews;
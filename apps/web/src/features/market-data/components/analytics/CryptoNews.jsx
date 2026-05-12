import React from 'react';

const CryptoNews = ({ articles }) => (
  <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Crypto News</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Latest market headlines</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-slate-400">Fresh insights from the crypto ecosystem, curated for fast institutional review.</p>
    </div>

    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {articles.slice(0, 4).map((article, index) => (
        <a
          key={`${article.title}-${index}`}
          href={article.link || article.url}
          target="_blank"
          rel="noreferrer"
          className="group block rounded-3xl border border-white/10 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-orange-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-3xl bg-white/5">
              {article.image ? (
                <img src={article.image} alt={article.source || 'news'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/5 text-sm text-slate-500">News</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white line-clamp-2">{article.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>{article.source || article.publisher || 'Crypto Feed'}</span>
                <span>•</span>
                <span>{article.date || article.pubDate || 'Recent'}</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default CryptoNews;

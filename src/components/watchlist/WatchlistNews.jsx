import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Newspaper, Clock, TrendingUp } from 'lucide-react';

const WatchlistNews = ({ coins }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (coins.length === 0) {
      setNews([]);
      setLoading(false);
      return;
    }

    const generateMockNews = () => {
      const mockTitles = [
        "Market Update: Top Performers Today",
        "Bitcoin Leads Market Rally with Strong Gains",
        "Altcoins Show Mixed Signals as Market Consolidates",
        "DeFi Sector Rebounds Amid Positive Sentiment",
        "Institutional Interest Grows in Cryptocurrency",
        "Security Audit Confirms Network Stability",
        "New Partnership Announced for Crypto Integration",
        "Trading Volume Surges on Major Exchanges",
        "Regulatory Clarity Boosts Investor Confidence",
        "Technical Analysis: Key Levels to Watch"
      ];

      const mockDescriptions = [
        "Latest market analysis shows strong momentum in selected assets",
        "Price action indicates bullish sentiment among traders",
        "Market correlation suggests diversification benefits",
        "Volume indicators point to sustained interest",
        "Technical support levels remain intact for major coins",
        "On-chain metrics show healthy network activity",
        "Trading pairs expand across major platforms",
        "Institutional investors increase their positions",
        "Market volatility remains within expected ranges",
        "Long-term outlook supported by fundamentals"
      ];

      const sources = ["CoinDesk", "The Block", "CryptoBriefing", "Cointelegraph", "Messari"];
      const newsItems = [];

      // Generate 6 mock news items
      for (let i = 0; i < 6; i++) {
        const randomCoin = coins[Math.floor(Math.random() * coins.length)];
        newsItems.push({
          title: `${randomCoin.name} ${mockTitles[i % mockTitles.length]}`,
          description: mockDescriptions[i % mockDescriptions.length],
          url: `https://www.coingecko.com/en/coins/${randomCoin.id}`,
          urlToImage: null,
          publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          source: { name: sources[i % sources.length] },
          relevance: 2
        });
      }

      return newsItems;
    };

    try {
      setLoading(true);
      // Simulate a small delay
      const timer = setTimeout(() => {
        const mockNews = generateMockNews();
        setNews(mockNews);
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error generating news:', error);
      setNews([]);
      setLoading(false);
    }
  }, [coins]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getRelevanceIcon = (relevance) => {
    if (relevance >= 2) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <motion.div
      className="bg-[#0b1120]/50 backdrop-blur-xl border border-white/6 rounded-[28px] p-6"
      whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Newspaper className="w-6 h-6 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Market News</h2>
          <p className="text-slate-400 text-sm mt-1">Latest updates on your watched assets</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-black/40 border border-white/6 rounded-[28px] h-48 animate-pulse"></div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No recent news for your watchlist</p>
          <p className="text-slate-500 text-sm mt-2">Try adding more cryptocurrencies to see relevant news</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((article, idx) => (
            <motion.a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-black/40 hover:bg-black/60 border border-white/6 hover:border-blue-500/40 rounded-[28px] overflow-hidden transition-all duration-300 cursor-pointer"
              whileHover={{ y: -4, scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="p-4 h-full flex flex-col">
                {article.urlToImage && (
                  <div className="relative mb-3 overflow-hidden rounded-lg">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      {getRelevanceIcon(article.relevance)}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 flex-grow">
                  {article.title}
                </h3>

                <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                  {article.description || article.title}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-black/30 px-2 py-1 rounded-full">
                      {article.source?.name || 'Crypto News'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 transition-colors">
                    <span className="text-xs">{formatDate(article.publishedAt)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}

      {/* News source attribution */}
      <div className="mt-6 pt-4 border-t border-white/6">
        <p className="text-slate-500 text-xs text-center">
          Market insights powered by CoinDash Analytics
        </p>
      </div>
    </motion.div>
  );
};

export default WatchlistNews;

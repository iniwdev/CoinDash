const express = require("express");
const Parser = require("rss-parser");
const router = express.Router();
const parser = new Parser({ customFields: {
  item: [
    ["media:content", "media:content", {keepArray: false}],
    ["media:thumbnail", "media:thumbnail", {keepArray: false}],
  ],
}});

const NEWS_FEEDS = [
  { url: "https://cointelegraph.com/rss", source: "Cointelegraph" },
  { url: "https://decrypt.co/feed", source: "Decrypt" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
  { url: "https://www.newsbtc.com/feed", source: "NewsBTC" },
];

const normalizeText = (text = "") => text.toString().toLowerCase();

const getHostName = (link) => {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const getArticleImage = (item) => {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.url) return item['media:content'].url;
  if (item['media:thumbnail']?.url) return item['media:thumbnail'].url;
  if (item.thumbnail?.url) return item.thumbnail.url;
  return null;
};

const getArticleSource = (item, fallback) => {
  if (item.creator) return item.creator;
  if (item.author) return item.author;
  if (item.source) return item.source;
  if (item['dc:creator']) return item['dc:creator'];
  return fallback || getHostName(item.link) || 'Crypto News';
};

const coinMatchMap = {
  bitcoin: ['bitcoin', 'btc'],
  ethereum: ['ethereum', 'eth'],
  solana: ['solana', 'sol'],
};

const generalCryptoPattern = /crypto|cryptocurrency|blockchain|defi|nft|exchange|token|coin/;

const matchesCoin = (text, coinName, coinSymbol) => {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  const nameMatches = normalizeText(coinName) && normalized.includes(normalizeText(coinName));
  const symbolMatches = normalizeText(coinSymbol) && normalized.includes(normalizeText(coinSymbol));
  const synonyms = coinMatchMap[normalizeText(coinName)] || [];
  const synonymMatches = synonyms.some((keyword) => normalized.includes(keyword));
  return nameMatches || symbolMatches || synonymMatches;
};

const mapFeedItem = (item, fallbackSource) => {
  const title = item.title?.trim() || 'Untitled article';
  const description = item.contentSnippet || item.summary || item.content || item.description || '';
  const source = getArticleSource(item, fallbackSource);
  const date = item.isoDate || item.pubDate || item.pubdate || new Date().toISOString();
  const link = item.link || item.guid || null;
  const image = getArticleImage(item);

  return {
    title,
    description: description.trim(),
    source,
    date,
    link,
    image,
  };
};

const deduplicateArticles = (articles) => {
  const seen = new Set();
  return articles.filter((article) => {
    const key = `${article.link || ''}:${article.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

router.get("/", async (req, res) => {
  try {
    const coinName = req.query.coin?.toString().trim();
    if (!coinName) {
      return res.status(400).json({ error: 'Missing coin query parameter.' });
    }

    console.log('Fetching news for:', coinName);

    const fetchFeed = async ({ url, source }) => {
      const feed = await parser.parseURL(url);
      return (feed.items || []).map((item) => ({ item, source }));
    };

    const results = await Promise.allSettled(NEWS_FEEDS.map(fetchFeed));
    const fetched = results.flatMap((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      console.warn(`Feed failed: ${NEWS_FEEDS[index].url}`, result.reason?.message || result.reason);
      return [];
    });

    const articles = fetched
      .map(({ item, source }) => ({
        ...mapFeedItem(item, source),
        rawSource: source,
      }))
      .filter((article) => article.link && article.title);

    const coinSpecific = articles.filter((article) =>
      matchesCoin(`${article.title} ${article.description} ${article.source}`, coinName, coinName)
    );

    const fallbackCrypto = articles.filter((article) =>
      generalCryptoPattern.test(`${article.title} ${article.description} ${article.source}`)
    );

    const finalArticles = deduplicateArticles(
      coinSpecific.length > 0 ? coinSpecific : fallbackCrypto
    )
      .slice(0, 30)
      .map((article) => {
        const parsedDate = new Date(article.date);
        return {
          ...article,
          date: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
        };
      });

    console.log('API response count:', finalArticles.length);

    if (finalArticles.length === 0) {
      return res.status(200).json({ articles: [], message: 'No coin-specific news found yet.' });
    }

    res.json({ articles: finalArticles });
  } catch (error) {
    console.error('News fetch failed:', error);
    res.status(500).json({ error: 'Unable to load latest news right now.' });
  }
});

module.exports = router;

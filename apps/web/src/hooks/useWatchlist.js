import { useMemo, useState } from 'react';

/**
 * Custom hook for calculating watchlist statistics
 */
export const useWatchlistStats = (coins) => {
  return useMemo(() => {
    if (!coins || coins.length === 0) {
      return {
        totalAssets: 0,
        averageChange24h: 0,
        bestPerformer: null,
        worstPerformer: null,
        gainers: 0,
        losers: 0,
        totalVolume: 0,
        totalMarketCap: 0,
        averagePrice: 0,
      };
    }

    const totalAssets = coins.length;
    const changes24h = coins.map((c) => c.price_change_percentage_24h || 0);
    const averageChange24h = changes24h.reduce((a, b) => a + b, 0) / totalAssets;

    const bestPerformer = coins.reduce((best, coin) => {
      if (!best || (coin.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0)) {
        return coin;
      }
      return best;
    }, null);

    const worstPerformer = coins.reduce((worst, coin) => {
      if (!worst || (coin.price_change_percentage_24h || 0) < (worst.price_change_percentage_24h || 0)) {
        return coin;
      }
      return worst;
    }, null);

    const gainers = coins.filter((c) => (c.price_change_percentage_24h || 0) > 0).length;
    const losers = coins.filter((c) => (c.price_change_percentage_24h || 0) < 0).length;
    const totalVolume = coins.reduce((sum, c) => sum + (c.total_volume || 0), 0);
    const totalMarketCap = coins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
    const averagePrice = coins.reduce((sum, c) => sum + (c.current_price || 0), 0) / totalAssets;

    return {
      totalAssets,
      averageChange24h,
      bestPerformer,
      worstPerformer,
      gainers,
      losers,
      totalVolume,
      totalMarketCap,
      averagePrice,
    };
  }, [coins]);
};

/**
 * Custom hook for sorting and filtering coins
 */
export const useFilteredCoins = (coins, filters) => {
  return useMemo(() => {
    let filtered = [...coins];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchLower) ||
          coin.symbol.toLowerCase().includes(searchLower)
      );
    }

    if (filters.filterType === 'gainers') {
      filtered = filtered.filter((c) => (c.price_change_percentage_24h || 0) > 0);
    }

    if (filters.filterType === 'losers') {
      filtered = filtered.filter((c) => (c.price_change_percentage_24h || 0) < 0);
    }

    if (filters.filterType === 'high_volume') {
      filtered = filtered.filter((c) => (c.total_volume || 0) > 1000000000);
    }

    return filtered;
  }, [coins, filters]);
};

/**
 * Custom hook for managing pagination
 */
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = items.slice(startIdx, endIdx);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    currentItems,
    setCurrentPage: goToPage,
    nextPage,
    prevPage,
  };
};

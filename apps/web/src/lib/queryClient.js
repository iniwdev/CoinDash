import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes — serve cached data while server wakes up
      staleTime: 1000 * 60 * 5,
      // Hold data in memory for 1 hour
      gcTime: 1000 * 60 * 60,
      // Retry up to 4 times with exponential backoff:
      // attempt 1 → 1s, attempt 2 → 4s, attempt 3 → 16s, attempt 4 → 30s
      // This covers the full Render free-tier 50-second cold start window.
      retry: 4,
      retryDelay: (attemptIndex) => Math.min(1000 * 4 ** attemptIndex, 30000),
      // Don't refetch on focus — reduces API hammering
      refetchOnWindowFocus: false,
      // Don't show error state if we have stale data — just silently retry
      throwOnError: false,
    },
    mutations: {
      // Mutations retry once (e.g. auth calls during cold start)
      retry: 1,
      retryDelay: 2000,
    },
  },
});

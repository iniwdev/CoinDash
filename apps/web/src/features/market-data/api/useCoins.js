import { useQuery } from '@tanstack/react-query';
import { getCoins } from './getCoins';

export const useCoins = () => {
  return useQuery({
    queryKey: ['coins'],
    queryFn: getCoins,
    staleTime: 1000 * 60, // Data becomes stale after 1 minute (crypto moves fast)
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
    retry: 2, // Retry failed requests twice before giving up
    throwOnError: false, // Don't throw errors to ErrorBoundary; handle in components
  });
};

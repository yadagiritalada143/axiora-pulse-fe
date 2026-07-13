import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/types/error.types';
import { logger } from '@utils/logger';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error)) {
    // Auth/validation/not-found errors won't succeed on retry.
    if ([400, 401, 403, 404, 422].includes(error.status)) return false;
  }
  return failureCount < 2;
}

function describeError(error: unknown): string {
  return isApiError(error) ? error.message : 'An unexpected error occurred.';
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error(`[Query:${query.queryHash}] ${describeError(error)}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const key = mutation.options.mutationKey?.join('.') ?? 'unnamed';
      logger.error(`[Mutation:${key}] ${describeError(error)}`);
    },
  }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

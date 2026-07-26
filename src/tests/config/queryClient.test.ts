import { ApiRequestError } from '@/types/error.types';
import { queryClient } from '@app/query/queryClient';
import { logger } from '@utils/logger';

function defined<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Expected value to be defined');
  return value;
}

jest.mock('@config/env', () => ({
  env: { appName: 'Axiora Pulse', apiUrl: '', aiStreaming: false, isDev: false, isProd: true },
}));

jest.mock('@utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const mockLoggerError = logger.error as jest.Mock;

describe('queryClient', () => {
  const defaultOptions = queryClient.getDefaultOptions();

  it('sets sane default query options', () => {
    expect(defaultOptions.queries?.staleTime).toBe(60 * 1000);
    expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('disables retries for mutations', () => {
    expect(defaultOptions.mutations?.retry).toBe(false);
  });

  describe('query retry policy', () => {
    const retry = defaultOptions.queries?.retry as (
      failureCount: number,
      error: unknown,
    ) => boolean;

    it('does not retry non-retryable API error statuses', () => {
      for (const status of [400, 401, 403, 404, 422]) {
        expect(retry(0, new ApiRequestError({ status, code: 'ERR', message: 'bad' }))).toBe(false);
      }
    });

    it('retries other API error statuses up to the failure-count limit', () => {
      const error = new ApiRequestError({ status: 500, code: 'ERR', message: 'boom' });

      expect(retry(0, error)).toBe(true);
      expect(retry(1, error)).toBe(true);
      expect(retry(2, error)).toBe(false);
    });

    it('retries unknown (non-API) errors up to the failure-count limit', () => {
      expect(retry(0, new Error('network'))).toBe(true);
      expect(retry(2, new Error('network'))).toBe(false);
    });
  });

  it('computes an exponential retry delay capped at 10s', () => {
    const retryDelay = defaultOptions.queries?.retryDelay as (attempt: number) => number;

    expect(retryDelay(0)).toBe(1000);
    expect(retryDelay(1)).toBe(2000);
    expect(retryDelay(2)).toBe(4000);
    expect(retryDelay(10)).toBe(10_000);
  });

  describe('error logging', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('logs a query error with the API error message', () => {
      queryClient.getQueryCache().config.onError?.(
        new ApiRequestError({ status: 500, code: 'ERR', message: 'API failed' }),
        // Minimal fake query object; only queryHash is read by the onError handler.
        { queryHash: 'q1' } as Parameters<
          NonNullable<ReturnType<typeof queryClient.getQueryCache>['config']['onError']>
        >[1],
      );

      expect(mockLoggerError).toHaveBeenCalledWith('[Query:q1] API failed');
    });

    it('logs a query error with a generic message for non-API errors', () => {
      queryClient
        .getQueryCache()
        .config.onError?.(new Error('boom'), { queryHash: 'q2' } as Parameters<
          NonNullable<ReturnType<typeof queryClient.getQueryCache>['config']['onError']>
        >[1]);

      expect(mockLoggerError).toHaveBeenCalledWith('[Query:q2] An unexpected error occurred.');
    });

    it('logs a mutation error using the joined mutation key, falling back to "unnamed"', () => {
      type MutationOnError = NonNullable<
        ReturnType<typeof queryClient.getMutationCache>['config']['onError']
      >;
      type MutationArg = Parameters<MutationOnError>[3];

      const onError = defined(queryClient.getMutationCache().config.onError);

      onError(
        new ApiRequestError({ status: 500, code: 'ERR', message: 'Mutation failed' }),
        undefined,
        undefined,
        { options: { mutationKey: ['user', 'update'] } } as unknown as MutationArg,
        undefined as never,
      );

      expect(mockLoggerError).toHaveBeenCalledWith('[Mutation:user.update] Mutation failed');

      onError(
        new ApiRequestError({ status: 500, code: 'ERR', message: 'Mutation failed' }),
        undefined,
        undefined,
        { options: {} } as unknown as MutationArg,
        undefined as never,
      );

      expect(mockLoggerError).toHaveBeenCalledWith('[Mutation:unnamed] Mutation failed');
    });
  });
});

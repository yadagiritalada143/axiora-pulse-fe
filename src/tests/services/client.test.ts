import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

jest.mock('@config/app.config', () => ({
  appConfig: {
    apiUrl: 'https://api.test.local',
    request: { timeoutMs: 1000 },
  },
}));

jest.mock('@utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

jest.mock('@services/api/refreshQueue', () => ({
  runExclusiveRefresh: jest.fn(),
}));

jest.mock('@services/api/authEvents', () => ({
  authEvents: {
    on: jest.fn(),
    emit: jest.fn(),
  },
}));

import { authEvents } from '@services/api/authEvents';
import { apiClient } from '@services/api/client';
import { runExclusiveRefresh } from '@services/api/refreshQueue';
import { tokenManager } from '@services/api/tokenManager';

/** Axios doesn't expose interceptor handlers in its public types; this mirrors the internal shape. */
interface InterceptorHandler<TValue> {
  fulfilled?: (value: TValue) => TValue | Promise<TValue>;
  rejected?: (error: unknown) => unknown;
}
interface InterceptorManagerInternals<TValue> {
  handlers: (InterceptorHandler<TValue> | null)[];
}

function getRequestInterceptor() {
  const manager = apiClient.interceptors
    .request as unknown as InterceptorManagerInternals<InternalAxiosRequestConfig>;
  const handler = manager.handlers[0];
  if (!handler?.fulfilled) throw new Error('Request interceptor not registered');
  return handler.fulfilled;
}

function getResponseErrorInterceptor() {
  const manager = apiClient.interceptors
    .response as unknown as InterceptorManagerInternals<unknown>;
  const handler = manager.handlers[0];
  if (!handler?.rejected) throw new Error('Response error interceptor not registered');
  return handler.rejected;
}

function getResponseSuccessInterceptor() {
  const manager = apiClient.interceptors
    .response as unknown as InterceptorManagerInternals<unknown>;
  const handler = manager.handlers[0];
  if (!handler?.fulfilled) throw new Error('Response success interceptor not registered');
  return handler.fulfilled;
}

describe('apiClient response success interceptor', () => {
  it('passes a successful response straight through unchanged', () => {
    const response = { data: { ok: true }, status: 200 };

    expect(getResponseSuccessInterceptor()(response)).toBe(response);
  });
});

function makeConfig(
  overrides: Partial<InternalAxiosRequestConfig> = {},
): InternalAxiosRequestConfig {
  return {
    headers: {},
    url: '/things',
    method: 'get',
    ...overrides,
  } as unknown as InternalAxiosRequestConfig;
}

function makeAxiosError(overrides: Partial<AxiosError> = {}): AxiosError {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Request failed',
    toJSON: () => ({}),
    config: makeConfig(),
    ...overrides,
  } as AxiosError;
}

const mockedTokenManager = tokenManager as jest.Mocked<typeof tokenManager>;
const mockedRunExclusiveRefresh = runExclusiveRefresh as jest.MockedFunction<
  typeof runExclusiveRefresh
>;
const mockedAuthEvents = authEvents as jest.Mocked<typeof authEvents>;

describe('apiClient request interceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attaches an Authorization header when a token is present', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue('token-abc');

    const result = await getRequestInterceptor()(makeConfig());

    const headers = result.headers as unknown as { get: (name: string) => string | undefined };
    expect(headers.get('Authorization')).toBe('Bearer token-abc');
  });

  it('leaves the request unauthenticated when there is no token', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue(null);

    const result = await getRequestInterceptor()(makeConfig());

    const headers = result.headers as unknown as { get?: (name: string) => string | undefined };
    expect(headers.get?.('Authorization')).toBeUndefined();
  });
});

describe('apiClient response error interceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes through non-401 errors as a normalized ApiRequestError', async () => {
    const error = makeAxiosError({
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: makeConfig(),
        data: { message: 'boom', code: 'SERVER_ERROR' },
      },
    });

    await expect(getResponseErrorInterceptor()(error)).rejects.toMatchObject({
      status: 500,
      code: 'SERVER_ERROR',
      message: 'boom',
    });
    expect(mockedRunExclusiveRefresh).not.toHaveBeenCalled();
  });

  it('retries the original request with a refreshed token on 401', async () => {
    mockedRunExclusiveRefresh.mockResolvedValue('new-access-token');
    const retriedResponse = { data: 'ok' };
    const requestSpy = jest.spyOn(apiClient, 'request').mockResolvedValue(retriedResponse);

    const originalRequest = makeConfig({ url: '/protected' });
    const error = makeAxiosError({
      config: originalRequest,
      response: {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: originalRequest,
        data: {},
      },
    });

    const result = await getResponseErrorInterceptor()(error);

    expect(mockedRunExclusiveRefresh).toHaveBeenCalledTimes(1);
    expect(originalRequest._retried).toBe(true);
    const headers = originalRequest.headers as unknown as {
      get: (name: string) => string | undefined;
    };
    expect(headers.get('Authorization')).toBe('Bearer new-access-token');
    expect(requestSpy).toHaveBeenCalledWith(originalRequest);
    expect(result).toBe(retriedResponse);

    requestSpy.mockRestore();
  });

  it('clears the session and emits session-expired when refresh fails', async () => {
    mockedRunExclusiveRefresh.mockRejectedValue(new Error('refresh failed'));

    const originalRequest = makeConfig({ url: '/protected' });
    const error = makeAxiosError({
      config: originalRequest,
      response: {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: originalRequest,
        data: {},
      },
    });

    await expect(getResponseErrorInterceptor()(error)).rejects.toMatchObject({
      status: 401,
    });

    expect(mockedTokenManager.clearTokens).toHaveBeenCalledTimes(1);
    expect(mockedAuthEvents.emit).toHaveBeenCalledWith('session-expired');
  });

  it('does not retry a request that has already been retried once', async () => {
    const originalRequest = makeConfig({ url: '/protected', _retried: true });
    const error = makeAxiosError({
      config: originalRequest,
      response: {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: originalRequest,
        data: {},
      },
    });

    await expect(getResponseErrorInterceptor()(error)).rejects.toMatchObject({ status: 401 });
    expect(mockedRunExclusiveRefresh).not.toHaveBeenCalled();
  });

  it('does not retry a request explicitly opted out of the refresh pipeline', async () => {
    const originalRequest = makeConfig({ url: '/auth/refresh', skipAuthRefresh: true });
    const error = makeAxiosError({
      config: originalRequest,
      response: {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: originalRequest,
        data: {},
      },
    });

    await expect(getResponseErrorInterceptor()(error)).rejects.toMatchObject({ status: 401 });
    expect(mockedRunExclusiveRefresh).not.toHaveBeenCalled();
  });
});

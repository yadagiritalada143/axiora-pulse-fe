import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { appConfig } from '@config/app.config';
import { API_ENDPOINTS } from '@constants/api';
import { logger } from '@utils/logger';

import { authEvents } from './authEvents';
import { toApiError } from './errorHandler';
import { runExclusiveRefresh } from './refreshQueue';
import { tokenManager } from './tokenManager';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** Marks a request as already retried once, to prevent infinite refresh loops. */
    _retried?: boolean;
    /** Opts a request out of the auth/refresh pipeline (e.g. the refresh call itself). */
    skipAuthRefresh?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: appConfig.apiUrl,
  timeout: appConfig.request.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = tokenManager.getAccessToken();

  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    config.headers = headers;
  }

  logger.debug(`${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available.');

  const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
    `${appConfig.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
    { refreshToken },
    { skipAuthRefresh: true } as InternalAxiosRequestConfig,
  );

  const tokens = response.data.data;
  tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const canRetry =
      originalRequest && !originalRequest._retried && !originalRequest.skipAuthRefresh;

    if (isUnauthorized && canRetry) {
      originalRequest._retried = true;

      try {
        const accessToken = await runExclusiveRefresh(refreshAccessToken);
        const headers = AxiosHeaders.from(originalRequest.headers);
        headers.set('Authorization', `Bearer ${accessToken}`);
        originalRequest.headers = headers;
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        tokenManager.clearTokens();
        authEvents.emit('session-expired');
        logger.error('Session refresh failed', refreshError);
        return Promise.reject(toApiError(error));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

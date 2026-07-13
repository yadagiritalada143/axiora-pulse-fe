import { STORAGE_KEYS } from '@constants/storage';
import { storage } from '@utils/storage';

/**
 * Reads/writes tokens directly from storage rather than through the Zustand
 * store. The axios layer must stay framework-state-agnostic and importable
 * before React has mounted (e.g. in interceptors), so it talks to storage,
 * while `useAuthStore` mirrors the same keys for reactive UI reads.
 */
export const tokenManager = {
  getAccessToken(): string | null {
    return storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },
  getRefreshToken(): string | null {
    return storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },
  setTokens(accessToken: string, refreshToken?: string): void {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clearTokens(): void {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

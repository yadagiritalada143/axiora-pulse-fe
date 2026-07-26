import { STORAGE_KEYS } from '@constants/storage';
import { tokenManager } from '@services/api/tokenManager';

describe('tokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no tokens are stored', () => {
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it('stores and reads both tokens when both are provided', () => {
    tokenManager.setTokens('access-123', 'refresh-456');

    expect(tokenManager.getAccessToken()).toBe('access-123');
    expect(tokenManager.getRefreshToken()).toBe('refresh-456');
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe(JSON.stringify('access-123'));
  });

  it('removes the refresh token when only an access token is provided', () => {
    tokenManager.setTokens('access-1', 'refresh-1');
    tokenManager.setTokens('access-2');

    expect(tokenManager.getAccessToken()).toBe('access-2');
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it('clears both tokens', () => {
    tokenManager.setTokens('access-1', 'refresh-1');
    tokenManager.clearTokens();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });
});

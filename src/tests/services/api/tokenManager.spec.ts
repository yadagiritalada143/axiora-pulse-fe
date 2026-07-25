import { STORAGE_KEYS } from '@constants/storage';
import { tokenManager } from '@services/api/tokenManager';

describe('tokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and reads access and refresh tokens', () => {
    tokenManager.setTokens('access', 'refresh');

    expect(tokenManager.getAccessToken()).toBe('access');
    expect(tokenManager.getRefreshToken()).toBe('refresh');
  });

  it('removes the refresh token when only an access token is provided', () => {
    tokenManager.setTokens('access', 'refresh');
    tokenManager.setTokens('access-2');

    expect(tokenManager.getAccessToken()).toBe('access-2');
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it('clears both tokens', () => {
    tokenManager.setTokens('access', 'refresh');
    tokenManager.clearTokens();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });
});

import { STORAGE_KEYS } from '@constants/storage';
import { DEFAULT_THEME, THEMES } from '@constants/theme';

describe('constant tables', () => {
  it('exposes the theme options and default', () => {
    expect(THEMES).toEqual(['light', 'dark', 'system']);
    expect(DEFAULT_THEME).toBe('system');
  });

  it('exposes prefixed storage keys', () => {
    expect(STORAGE_KEYS.THEME).toBe('axiora.theme');
    expect(STORAGE_KEYS.AUTH_SESSION).toBe('axiora.auth.session');
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBe('axiora.auth.accessToken');
  });
});

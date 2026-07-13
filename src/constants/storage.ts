/** Keys used for localStorage / sessionStorage. Prefixed to avoid collisions. */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'axiora.auth.accessToken',
  REFRESH_TOKEN: 'axiora.auth.refreshToken',
  AUTH_SESSION: 'axiora.auth.session',
  THEME: 'axiora.theme',
  ACTIVE_WORKSPACE: 'axiora.workspace.active',
} as const;

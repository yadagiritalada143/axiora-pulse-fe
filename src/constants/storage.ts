/** Keys used for localStorage / sessionStorage. Prefixed to avoid collisions. */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'axiora.auth.accessToken',
  REFRESH_TOKEN: 'axiora.auth.refreshToken',
  AUTH_SESSION: 'axiora.auth.session',
  THEME: 'axiora.theme',
  ACTIVE_WORKSPACE: 'axiora.workspace.active',
  INTERACTIVE_QUESTIONS_DRAFT: 'axiora.onboarding.interactiveQuestions.draft',
  INTERACTIVE_QUESTIONS_SUBMITTED: 'axiora.onboarding.interactiveQuestions.submitted',
} as const;

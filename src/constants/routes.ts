export const ROUTES = {
  HOME: '/',

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  PRICING: '/pricing',

  DASHBOARD: '/dashboard',
  WORKSPACE: '/workspace',
  AI_CHAT: '/workspace/ai-chat',
  AI_CHAT_CONVERSATION: '/workspace/ai-chat/:conversationId',
  SETTINGS: '/settings',
  PROFILE: '/profile',

  NOT_FOUND: '/404',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Routes only reachable when the user is NOT authenticated. */
export const GUEST_ROUTES: AppRoute[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

/** Routes that require an authenticated session. */
export const PROTECTED_ROUTES: AppRoute[] = [
  ROUTES.DASHBOARD,
  ROUTES.WORKSPACE,
  ROUTES.AI_CHAT,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
];

export function buildConversationRoute(conversationId: string): string {
  return ROUTES.AI_CHAT_CONVERSATION.replace(':conversationId', conversationId);
}

export const ROUTES = {
  HOME: '/',

  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  VERIFY_LOGIN: '/verify-login',

  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  PRICING: '/pricing',

  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  WORKSPACE: '/workspace',
  WORKSPACE_ARCHIVE: '/workspace/archive',
  WORKSPACE_DETAIL: '/workspace/:workspaceId',
  WORKSPACE_SURVEY: '/workspace/:workspaceId/survey',
  PUBLIC_SURVEY: '/surveys/public/:surveyId',
  AI_CHAT: '/workspace/ai-chat',
  AI_CHAT_CONVERSATION: '/workspace/ai-chat/:conversationId',
  SETTINGS: '/settings',
  PROFILE: '/profile',

  QUESTIONNAIRE_INTRO: '/questionnaire-intro',
  INTERACTIVE_QUESTIONS: '/interactive-questions',

  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_INTERACTIVE_QUESTIONS: '/admin/interactive-questions',
  ADMIN_USERS: '/admin/users',

  NOT_FOUND: '/404',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const GUEST_ROUTES: AppRoute[] = [
  ROUTES.LOGIN,
  ROUTES.ADMIN_LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_OTP,
  ROUTES.VERIFY_LOGIN,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export const PROTECTED_ROUTES: AppRoute[] = [
  ROUTES.ONBOARDING,
  ROUTES.PRICING,
  ROUTES.QUESTIONNAIRE_INTRO,
  ROUTES.INTERACTIVE_QUESTIONS,

  ROUTES.DASHBOARD,
  ROUTES.WORKSPACE,
  ROUTES.WORKSPACE_ARCHIVE,
  ROUTES.WORKSPACE_SURVEY,
  ROUTES.AI_CHAT,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,

  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_INTERACTIVE_QUESTIONS,
  ROUTES.ADMIN_USERS,
];

export function buildConversationRoute(conversationId: string): string {
  return ROUTES.AI_CHAT_CONVERSATION.replace(':conversationId', conversationId);
}

export function buildWorkspaceRoute(workspaceId: number | string): string {
  return ROUTES.WORKSPACE_DETAIL.replace(':workspaceId', String(workspaceId));
}

export function buildWorkspaceSurveyRoute(workspaceId: number | string): string {
  return ROUTES.WORKSPACE_SURVEY.replace(':workspaceId', String(workspaceId));
}

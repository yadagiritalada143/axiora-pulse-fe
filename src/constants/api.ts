export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    REGISTER: '/v1/auth/register',

    VERIFY_OTP: '/v1/auth/verifyOTP',
    RESEND_OTP: '/v1/auth/resendOTP',

    VERIFY_LOGIN: '/v1/auth/verify-login',

    FORGOT_PASSWORD_REQUEST: '/v1/auth/forgot-password/request',
    FORGOT_PASSWORD_VERIFY: '/v1/auth/forgot-password/verify',
    FORGOT_PASSWORD_RESET: '/v1/auth/forgot-password/reset',

    CHANGE_PASSWORD: '/v1/auth/change-password',

    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',

    ME: '/auth/me',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CONVERSATION: (id: string) => `/chat/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    STREAM: (conversationId: string) => `/chat/conversations/${conversationId}/stream`,
  },

  WORKSPACE: {
    LIST: '/v1/workspaces',
    CREATE: '/v1/workspaces',
    DETAIL: (workspaceId: number) => `/v1/workspaces/${workspaceId}`,
    DELETE: (workspaceId: number) => `/v1/workspaces/${workspaceId}`,
  },

  BILLING: {
    PLANS: '/billing/plans',
    SUBSCRIBE: '/billing/subscribe',
  },
  USER: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
  },
  ORCHESTRATION: {
    RUN: '/v1/orchestration/run',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

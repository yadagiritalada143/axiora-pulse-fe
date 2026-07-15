export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    REGISTER: '/v1/auth/register',

    VERIFY_OTP: '/v1/auth/verifyOTP',
    RESEND_OTP: '/v1/auth/resendOTP',

    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',

    FORGOT_PASSWORD: '/v1/auth/forgot-password',
    RESET_PASSWORD: '/v1/auth/reset-password',

    ME: '/auth/me',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CONVERSATION: (id: string) => `/chat/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    STREAM: (conversationId: string) => `/chat/conversations/${conversationId}/stream`,
  },
  WORKSPACE: {
    LIST: '/workspaces',
    DETAIL: (id: string) => `/workspaces/${id}`,
  },
  BILLING: {
    PLANS: '/billing/plans',
    SUBSCRIBE: '/billing/subscribe',
  },
  USER: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
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

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    REGISTER: '/v1/auth/register',

    ADMIN_LOGIN: '/v1/auth/admin/login',

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
    ARCHIVED_LIST: '/v1/workspaces?is_delete=true',
    CREATE: '/v1/workspaces',
    DETAIL: (workspaceId: number) => `/v1/workspaces/${workspaceId}`,
    UPDATE: (workspaceId: number) => `/v1/workspaces/${workspaceId}`,
    DELETE: (workspaceId: number) => `/v1/workspaces/${workspaceId}`,
    RESTORE: (workspaceId: number) => `/v1/workspaces/${workspaceId}/restore`,
    PERMANENT_DELETE: (workspaceId: number) => `/v1/workspaces/${workspaceId}/permanent`,
    ATTACHMENTS: (workspaceId: number) => `/v1/workspaces/${workspaceId}/attachments`,
    CHAT: (workspaceId: number) => `/v1/workspaces/${workspaceId}/chat`,
    STATE: (workspaceId: number) => `/v1/workspaces/${workspaceId}/state`,
    RESET: (workspaceId: number) => `/v1/workspaces/${workspaceId}/reset`,
    REPORT: (workspaceId: number, agentName: string) =>
      `/v1/workspaces/${workspaceId}/reports/${agentName}`,
    REPORT_EXPORT: (workspaceId: number) => `/v1/workspaces/${workspaceId}/reports/export`,
  },

  SURVEY: {
    SAVE_QUESTIONS: '/v1/surveys',
    GET_ALL: '/v1/surveys',
    GET_BY_WORKSPACE: (workspaceId: number) => `/v1/surveys/workspace/${workspaceId}`,
    GET_PUBLIC: (token: string) => `/v1/surveys/public/${token}`,
    SUBMIT_PUBLIC: (token: string) => `/v1/surveys/public/${token}/submit`,
    GET_SINGLE: (surveyId: number) => `/v1/surveys/${surveyId}`,
    UPDATE: (surveyId: number) => `/v1/surveys/${surveyId}`,
    DELETE: (surveyId: number) => `/v1/surveys/${surveyId}`,
    EXPORT: (surveyId: number) => `/v1/surveys/${surveyId}/export`,
    RESPONSES: (surveyId: number) => `/v1/surveys/${surveyId}/responses`,
    UPDATE_WORKSPACE_QUESTIONS: (workspaceId: number) =>
      `/v1/workspaces/${workspaceId}/survey/questions`,
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

  ONBOARDING: {
    QUESTIONS: '/v1/questionnaire/questions',
    SUBMIT: '/v1/questionnaire/submit-answers',
    ADMIN: {
      QUESTIONS: '/v1/admin/questionnaire/questions',
      CREATE: '/v1/admin/questionnaire/create-question',
      DELETE: (id: number) => `/v1/admin/questionnaire/delete-question/${id}`,
    },
  },

  ADMIN: {
    USERS: '/v1/admin/users',
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

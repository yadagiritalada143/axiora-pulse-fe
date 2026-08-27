/**
 * Centralized TanStack Query key factory.
 */
export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
  },

  chat: {
    conversations: () => ['chat', 'conversations'] as const,
    conversation: (id: string) => ['chat', 'conversations', id] as const,
    messages: (conversationId: string) =>
      ['chat', 'conversations', conversationId, 'messages'] as const,
    models: () => ['chat', 'models'] as const,
  },

  workspace: {
    all: () => ['workspace'] as const,
    list: () => [...queryKeys.workspace.all(), 'list'] as const,
    detail: (id: number) => [...queryKeys.workspace.all(), 'detail', id] as const,
    state: (id: number) => [...queryKeys.workspace.all(), 'state', id] as const,
  },

  survey: {
    all: () => ['survey'] as const,
    byWorkspace: (workspaceId: number) =>
      [...queryKeys.survey.all(), 'workspace', workspaceId] as const,
    public: (token: string) => [...queryKeys.survey.all(), 'public', token] as const,
    responses: (surveyId: number) => [...queryKeys.survey.all(), 'responses', surveyId] as const,
    analysis: (surveyId: number) => [...queryKeys.survey.all(), 'analysis', surveyId] as const,
  },

  billing: {
    plans: () => ['billing', 'plans'] as const,
    subscription: () => ['billing', 'subscription'] as const,
  },

  user: {
    profile: () => ['user', 'profile'] as const,
    details: () => ['user', 'details'] as const,
  },

  onboarding: {
    interactiveQuestions: () => ['onboarding', 'interactiveQuestions'] as const,
  },

  admin: {
    interactiveQuestions: () => ['admin', 'interactiveQuestions'] as const,
    users: (params?: { limit?: number; offset?: number; search?: string }) =>
      ['admin', 'users', params] as const,
    userGrowth: (granularity: 'month' | 'year') => ['admin', 'userGrowth', granularity] as const,
    userSurveySummary: (userId: number) => ['admin', 'userSurveySummary', userId] as const,
    surveys: (params?: { limit?: number; offset?: number; search?: string; user_id?: number }) =>
      ['admin', 'surveys', params] as const,
    surveyResponses: (
      surveyId: number,
      params?: { limit?: number; offset?: number; search?: string },
    ) => ['admin', 'surveyResponses', surveyId, params] as const,
    surveyResponseDetail: (surveyId: number, responseId: number) =>
      ['admin', 'surveyResponseDetail', surveyId, responseId] as const,
  },
} as const;

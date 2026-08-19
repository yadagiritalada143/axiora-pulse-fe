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
  },

  billing: {
    plans: () => ['billing', 'plans'] as const,
    subscription: () => ['billing', 'subscription'] as const,
  },

  user: {
    profile: () => ['user', 'profile'] as const,
  },

  onboarding: {
    interactiveQuestions: () => ['onboarding', 'interactiveQuestions'] as const,
  },

  admin: {
    interactiveQuestions: () => ['admin', 'interactiveQuestions'] as const,
    users: (params?: { limit?: number; offset?: number; search?: string }) =>
      ['admin', 'users', params] as const,
  },
} as const;

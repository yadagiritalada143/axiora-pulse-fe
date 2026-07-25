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
  },

  billing: {
    plans: () => ['billing', 'plans'] as const,
  },

  user: {
    profile: () => ['user', 'profile'] as const,
  },
} as const;

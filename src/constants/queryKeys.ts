/**
 * Centralized TanStack Query key factory. Keeping keys here (instead of
 * inline in each hook) avoids drift between the key used to fetch and the
 * key used to invalidate.
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
    list: () => ['workspace', 'list'] as const,
    detail: (id: string) => ['workspace', 'detail', id] as const,
  },
  billing: {
    plans: () => ['billing', 'plans'] as const,
  },
  user: {
    profile: () => ['user', 'profile'] as const,
  },
} as const;

import { env } from '@config/env';

export const appConfig = {
  name: env.appName,
  apiUrl: env.apiUrl,
  aiStreaming: env.aiStreaming,
  googleClientId: env.googleClientId,
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  request: {
    timeoutMs: 30_000,
  },
} as const;

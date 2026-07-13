interface EnvConfig {
  apiUrl: string;
  appName: string;
  enableLogger: boolean;
  aiStreaming: boolean;
  isDev: boolean;
  isProd: boolean;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function readEnv(): EnvConfig {
  const env = import.meta.env;

  return {
    apiUrl: env.VITE_API_URL ?? 'http://localhost:8000/api',
    appName: env.VITE_APP_NAME ?? 'Axiora Pulse',
    enableLogger: toBoolean(env.VITE_ENABLE_LOGGER, env.DEV),
    aiStreaming: toBoolean(env.VITE_AI_STREAMING, true),
    isDev: env.DEV,
    isProd: env.PROD,
  };
}

export const env = readEnv();

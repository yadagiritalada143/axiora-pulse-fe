import { env } from '@config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function write(level: LogLevel, args: unknown[]): void {
  if (!env.enableLogger) return;

  console[level](`[${level.toUpperCase()}]`, ...args);
}

export const logger = {
  info: (...args: unknown[]) => write('info', args),
  warn: (...args: unknown[]) => write('warn', args),
  error: (...args: unknown[]) => write('error', args),
  debug: (...args: unknown[]) => write('debug', args),
};

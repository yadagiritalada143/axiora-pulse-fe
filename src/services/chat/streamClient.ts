import type { StreamChunk } from '@/types/chat.types';
import { appConfig } from '@config/app.config';
import { tokenManager } from '@services/api/tokenManager';

/**
 * Reads a Server-Sent-Events-style response body (`data: {...}\n\n` frames)
 * and yields parsed chunks as they arrive. Axios cannot stream a fetch body
 * incrementally in the browser, so streaming intentionally bypasses the axios
 * client and talks to `fetch` directly, while still reusing the same base
 * URL/auth/cancellation conventions.
 */
export async function* streamChatCompletion(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): AsyncGenerator<StreamChunk> {
  const accessToken = tokenManager.getAccessToken();

  const response = await fetch(`${appConfig.apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Stream request failed with status ${response.status}`);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += value;
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        const line = frame.split('\n').find((entry) => entry.startsWith('data:'));
        if (!line) continue;

        const json = line.replace(/^data:\s*/, '');
        if (json === '[DONE]') return;

        yield JSON.parse(json) as StreamChunk;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

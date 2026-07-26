import { ReadableStream, TextDecoderStream } from 'node:stream/web';

import type { StreamChunk } from '@/types/chat.types';
import { tokenManager } from '@services/api/tokenManager';
import { streamChatCompletion } from '@services/chat/streamClient';

// jsdom (this project's Jest testEnvironment) doesn't implement the Streams API that
// streamClient.ts relies on (`response.body.pipeThrough(new TextDecoderStream())`) - polyfill
// both from Node's built-in implementation for this file only.
Object.assign(globalThis, { ReadableStream, TextDecoderStream });

jest.mock('@config/app.config', () => ({
  appConfig: {
    apiUrl: 'https://api.test.local',
    aiStreaming: true,
    request: { timeoutMs: 1000 },
  },
}));

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

const mockedTokenManager = tokenManager as jest.Mocked<typeof tokenManager>;

function streamResponse(
  chunks: string[],
  overrides: { ok?: boolean; status?: number; body?: ReadableStream<Uint8Array> | null } = {},
): Response {
  const encoder = new TextEncoder();
  const body =
    overrides.body === undefined
      ? new ReadableStream<Uint8Array>({
          start(controller) {
            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          },
        })
      : overrides.body;

  return {
    ok: overrides.ok ?? true,
    status: overrides.status ?? 200,
    body,
  } as unknown as Response;
}

async function collect(generator: AsyncGenerator<StreamChunk>): Promise<StreamChunk[]> {
  const results: StreamChunk[] = [];
  for await (const chunk of generator) {
    results.push(chunk);
  }
  return results;
}

describe('streamChatCompletion', () => {
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  it('parses a single SSE frame into a StreamChunk', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue(null);
    const chunk: StreamChunk = { conversationId: 'c1', messageId: 'm1', delta: 'Hi', done: false };
    fetchMock.mockResolvedValue(streamResponse([`data: ${JSON.stringify(chunk)}\n\n`]));

    const results = await collect(
      streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' }),
    );

    expect(results).toEqual([chunk]);
  });

  it('parses multiple frames arriving across separate reads, joining a frame split mid-chunk', async () => {
    const first: StreamChunk = { conversationId: 'c1', messageId: 'm1', delta: 'Hel', done: false };
    const second: StreamChunk = { conversationId: 'c1', messageId: 'm1', delta: 'lo', done: false };
    mockedTokenManager.getAccessToken.mockReturnValue(null);

    const firstFrame = `data: ${JSON.stringify(first)}\n\n`;
    const secondFrame = `data: ${JSON.stringify(second)}\n\n`;
    // Split the frame boundary itself across two chunks to exercise the buffering logic.
    const splitPoint = Math.floor(firstFrame.length / 2);

    fetchMock.mockResolvedValue(
      streamResponse([firstFrame.slice(0, splitPoint), firstFrame.slice(splitPoint) + secondFrame]),
    );

    const results = await collect(
      streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' }),
    );

    expect(results).toEqual([first, second]);
  });

  it('skips frames without a data: line instead of throwing', async () => {
    const chunk: StreamChunk = { conversationId: 'c1', messageId: 'm1', delta: 'Hi', done: false };
    mockedTokenManager.getAccessToken.mockReturnValue(null);

    fetchMock.mockResolvedValue(
      streamResponse([`: keep-alive\n\n`, `data: ${JSON.stringify(chunk)}\n\n`]),
    );

    const results = await collect(
      streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' }),
    );

    expect(results).toEqual([chunk]);
  });

  it('stops iterating as soon as it sees the [DONE] sentinel', async () => {
    const chunk: StreamChunk = { conversationId: 'c1', messageId: 'm1', delta: 'Hi', done: false };
    mockedTokenManager.getAccessToken.mockReturnValue(null);

    fetchMock.mockResolvedValue(
      streamResponse([
        `data: ${JSON.stringify(chunk)}\n\n`,
        'data: [DONE]\n\n',
        'data: {"unreachable":true}\n\n',
      ]),
    );

    const results = await collect(
      streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' }),
    );

    expect(results).toEqual([chunk]);
  });

  it('attaches an Authorization header when an access token is present', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue('token-abc');
    fetchMock.mockResolvedValue(streamResponse([]));

    await collect(streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' }));

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test.local/chat/conversations/c1/stream',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token-abc' }) as unknown,
      }),
    );
  });

  it('omits the Authorization header when there is no access token', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue(null);
    fetchMock.mockResolvedValue(streamResponse([]));

    await collect(streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' }));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('throws when the response is not ok', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue(null);
    fetchMock.mockResolvedValue(streamResponse([], { ok: false, status: 503 }));

    await expect(
      collect(streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' })),
    ).rejects.toThrow('Stream request failed with status 503');
  });

  it('throws when the response has no body', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue(null);
    fetchMock.mockResolvedValue(streamResponse([], { body: null }));

    await expect(
      collect(streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' })),
    ).rejects.toThrow('Stream request failed with status 200');
  });

  it('propagates a JSON.parse failure for a malformed data frame (no resilience against bad payloads)', async () => {
    mockedTokenManager.getAccessToken.mockReturnValue(null);
    fetchMock.mockResolvedValue(streamResponse(['data: {not valid json\n\n']));

    await expect(
      collect(streamChatCompletion('/chat/conversations/c1/stream', { content: 'hi' })),
    ).rejects.toThrow();
  });
});

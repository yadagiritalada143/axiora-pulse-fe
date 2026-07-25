import {
  ReadableStream as NodeReadableStream,
  TextDecoderStream as NodeTextDecoderStream,
} from 'node:stream/web';
import { TextEncoder as NodeTextEncoder } from 'node:util';

import type { StreamChunk } from '@/types/chat.types';
import { tokenManager } from '@services/api/tokenManager';
import { streamChatCompletion } from '@services/chat/streamClient';

jest.mock('@config/app.config', () => ({
  appConfig: { apiUrl: 'http://localhost/api' },
}));

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: { getAccessToken: jest.fn() },
}));

const { getAccessToken } = tokenManager as unknown as { getAccessToken: jest.Mock };

beforeAll(() => {
  globalThis.TextDecoderStream =
    NodeTextDecoderStream as unknown as typeof globalThis.TextDecoderStream;
});

function bodyFrom(chunks: string[]): ReadableStream {
  const encoder = new NodeTextEncoder();
  const stream = new NodeReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return stream as unknown as ReadableStream;
}

let fetchMock: jest.Mock;

function mockFetch(response: { ok: boolean; status: number; body: ReadableStream | null }) {
  fetchMock = jest.fn().mockResolvedValue(response);
  global.fetch = fetchMock;
}

async function collect(generator: AsyncGenerator<StreamChunk>): Promise<StreamChunk[]> {
  const chunks: StreamChunk[] = [];
  for await (const chunk of generator) chunks.push(chunk);
  return chunks;
}

describe('streamChatCompletion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('parses data frames and stops at [DONE], ignoring non-data frames', async () => {
    getAccessToken.mockReturnValue('token');
    mockFetch({
      ok: true,
      status: 200,
      body: bodyFrom([
        'event: ping\n\n',
        'data: {"delta":"Hel"}\n\n',
        'data: {"delta":"lo"}\n\n',
        'data: [DONE]\n\n',
      ]),
    });

    const result = await collect(streamChatCompletion('/chat/stream', { hi: true }));

    expect(result).toHaveLength(2);
    expect(result[0]?.delta).toBe('Hel');
    expect(result[1]?.delta).toBe('lo');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends the request without a token when none is stored', async () => {
    getAccessToken.mockReturnValue(null);
    mockFetch({ ok: true, status: 200, body: bodyFrom(['data: [DONE]\n\n']) });

    const result = await collect(streamChatCompletion('/chat/stream', {}));

    expect(result).toHaveLength(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when the response is not ok', async () => {
    getAccessToken.mockReturnValue(null);
    mockFetch({ ok: false, status: 500, body: null });

    await expect(collect(streamChatCompletion('/chat/stream', {}))).rejects.toThrow(
      'Stream request failed with status 500',
    );
  });
});

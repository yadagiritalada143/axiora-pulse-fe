import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import type { ChatMessage, StreamChunk } from '@/types/chat.types';
import { appConfig } from '@config/app.config';
import { queryKeys } from '@constants/queryKeys';
import { useSendMessage } from '@features/ai/hooks/useSendMessage';
import { chatService } from '@services/chat';

jest.mock('@config/app.config', () => ({ appConfig: { aiStreaming: true } }));
jest.mock('@services/chat', () => ({
  chatService: { streamMessage: jest.fn(), sendMessage: jest.fn() },
}));
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

const mockedChatService = chatService as jest.Mocked<typeof chatService>;
const mockedToast = toast as jest.Mocked<typeof toast>;
const mockedAppConfig = appConfig as unknown as { aiStreaming: boolean };

function createWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

async function* asyncIterable(chunks: StreamChunk[]) {
  for (const chunk of chunks) {
    await Promise.resolve();
    yield chunk;
  }
}

describe('useSendMessage', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockedAppConfig.aiStreaming = true;
  });

  it('streams the assistant reply chunk by chunk when aiStreaming is enabled', async () => {
    mockedAppConfig.aiStreaming = true;
    mockedChatService.streamMessage.mockReturnValue(
      asyncIterable([
        { conversationId: 'c1', messageId: 'a1', delta: 'Hel', done: false },
        { conversationId: 'c1', messageId: 'a1', delta: 'lo', done: true },
      ]),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useSendMessage('c1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('Hi there');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const messages = queryClient.getQueryData<ChatMessage[]>(queryKeys.chat.messages('c1'));

    expect(mockedChatService.streamMessage).toHaveBeenCalledWith({
      conversationId: 'c1',
      content: 'Hi there',
    });
    expect(mockedChatService.sendMessage).not.toHaveBeenCalled();
    expect(messages).toHaveLength(2);
    expect(messages?.[0]).toMatchObject({ role: 'user', content: 'Hi there' });
    expect(messages?.[1]).toMatchObject({
      role: 'assistant',
      content: 'Hello',
      isStreaming: false,
    });
  });

  it('falls back to a single-shot request when aiStreaming is disabled', async () => {
    mockedAppConfig.aiStreaming = false;
    const now = new Date().toISOString();
    mockedChatService.sendMessage.mockResolvedValue({
      id: 'server-1',
      conversationId: 'c1',
      role: 'assistant',
      content: 'Full reply',
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useSendMessage('c1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('Hi there');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const messages = queryClient.getQueryData<ChatMessage[]>(queryKeys.chat.messages('c1'));

    expect(mockedChatService.sendMessage).toHaveBeenCalledWith({
      conversationId: 'c1',
      content: 'Hi there',
    });
    expect(mockedChatService.streamMessage).not.toHaveBeenCalled();
    expect(messages).toHaveLength(2);
    expect(messages?.[1]).toMatchObject({
      id: 'server-1',
      content: 'Full reply',
      isStreaming: false,
    });
  });

  it('shows a toast with the API error message when the request fails', async () => {
    mockedAppConfig.aiStreaming = false;
    mockedChatService.sendMessage.mockRejectedValue({
      status: 400,
      code: 'BAD_REQUEST',
      message: 'The idea title is required.',
    });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useSendMessage('c1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('Hi there');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToast.error).toHaveBeenCalledWith('The idea title is required.');
  });

  it('shows a generic toast when the failure is not a normalized API error', async () => {
    mockedAppConfig.aiStreaming = false;
    mockedChatService.sendMessage.mockRejectedValue(new Error('boom'));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useSendMessage('c1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('Hi there');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToast.error).toHaveBeenCalledWith(
      'The assistant could not respond. Please retry.',
    );
  });
});

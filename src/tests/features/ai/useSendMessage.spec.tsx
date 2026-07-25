import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import type { ChatMessage } from '@/types/chat.types';
import { appConfig } from '@config/app.config';
import { queryKeys } from '@constants/queryKeys';
import { useSendMessage } from '@features/ai/hooks/useSendMessage';
import { chatService } from '@services/chat';

jest.mock('@config/app.config', () => ({
  appConfig: { aiStreaming: true },
}));

jest.mock('@services/chat', () => ({
  chatService: {
    streamMessage: jest.fn(),
    sendMessage: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const { streamMessage, sendMessage } = chatService as unknown as {
  streamMessage: jest.Mock;
  sendMessage: jest.Mock;
};

const mutableConfig = appConfig as unknown as { aiStreaming: boolean };

function setup(conversationId = 'conv-1') {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useSendMessage(conversationId), {
    wrapper,
  });

  return { result, queryClient };
}

function assistantContent(queryClient: QueryClient, conversationId = 'conv-1') {
  const messages = queryClient.getQueryData<ChatMessage[]>(queryKeys.chat.messages(conversationId));

  return messages?.find((message) => message.role === 'assistant')?.content;
}

describe('useSendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutableConfig.aiStreaming = true;
  });

  it('streams the assistant reply chunk by chunk into the cache', async () => {
    streamMessage.mockReturnValue({
      [Symbol.asyncIterator]() {
        const chunks = [
          { conversationId: 'conv-1', messageId: 'm', delta: 'Hel', done: false },
          { conversationId: 'conv-1', messageId: 'm', delta: 'lo', done: true },
        ];

        let index = 0;

        return {
          next: () =>
            Promise.resolve(
              index < chunks.length
                ? { value: chunks[index++], done: false }
                : { value: undefined, done: true },
            ),
        };
      },
    });

    const { result, queryClient } = setup();

    await result.current.mutateAsync('hi');

    expect(assistantContent(queryClient)).toBe('Hello');
  });

  it('uses the non-streaming send when streaming is disabled', async () => {
    mutableConfig.aiStreaming = false;

    const reply: ChatMessage = {
      id: 'server-1',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'Full reply',
      attachments: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    sendMessage.mockResolvedValue(reply);

    const { result, queryClient } = setup();

    await result.current.mutateAsync('hi');

    expect(sendMessage).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      content: 'hi',
    });

    expect(assistantContent(queryClient)).toBe('Full reply');
  });

  it('toasts when the assistant fails to respond', async () => {
    streamMessage.mockReturnValue({
      [Symbol.asyncIterator]() {
        return {
          next: jest.fn().mockRejectedValue(new Error('stream failed')),
        };
      },
    });

    const { result } = setup();

    await expect(result.current.mutateAsync('hi')).rejects.toBeDefined();

    expect(toast.error).toHaveBeenCalledWith('The assistant could not respond. Please retry.');
  });
});

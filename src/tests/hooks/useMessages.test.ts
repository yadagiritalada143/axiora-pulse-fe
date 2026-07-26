import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type { ChatMessage } from '@/types/chat.types';
import { useMessages } from '@features/ai/hooks/useMessages';
import { chatService } from '@services/chat';

jest.mock('@services/chat', () => ({
  chatService: {
    listMessages: jest.fn(),
  },
}));

const mockedChatService = chatService as jest.Mocked<typeof chatService>;

const MESSAGE: ChatMessage = {
  id: 'm1',
  conversationId: 'c1',
  role: 'user',
  content: 'Hello',
  attachments: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useMessages', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches messages for the given conversation id', async () => {
    mockedChatService.listMessages.mockResolvedValue([MESSAGE]);

    const { result } = renderHook(() => useMessages('c1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([MESSAGE]);
    expect(mockedChatService.listMessages).toHaveBeenCalledWith('c1');
  });

  it('does not fetch when the conversation id is null', () => {
    const { result } = renderHook(() => useMessages(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedChatService.listMessages).not.toHaveBeenCalled();
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type { Conversation } from '@/types/chat.types';
import { useConversations, useCreateConversation } from '@features/ai/hooks/useConversations';
import { chatService } from '@services/chat';

jest.mock('@services/chat', () => ({
  chatService: {
    listConversations: jest.fn(),
    createConversation: jest.fn(),
  },
}));

const mockedChatService = chatService as jest.Mocked<typeof chatService>;

const CONVERSATION: Conversation = {
  id: 'c1',
  title: 'My idea',
  modelId: 'model-1',
  lastMessagePreview: null,
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

describe('useConversations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches conversations from the chat service', async () => {
    mockedChatService.listConversations.mockResolvedValue([CONVERSATION]);

    const { result } = renderHook(() => useConversations(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([CONVERSATION]);
    expect(mockedChatService.listConversations).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error when the fetch fails', async () => {
    mockedChatService.listConversations.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useConversations(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('network down'));
  });
});

describe('useCreateConversation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a conversation and invalidates the conversations list', async () => {
    mockedChatService.createConversation.mockResolvedValue(CONVERSATION);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    function Wrapper({ children }: { children: ReactNode }) {
      return createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const { result } = renderHook(() => useCreateConversation(), { wrapper: Wrapper });

    result.current.mutate('model-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedChatService.createConversation).toHaveBeenCalledWith('model-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['chat', 'conversations'] });
  });
});

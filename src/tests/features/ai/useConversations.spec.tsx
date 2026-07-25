import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { queryKeys } from '@constants/queryKeys';
import { useConversations, useCreateConversation } from '@features/ai/hooks/useConversations';
import { chatService } from '@services/chat';

jest.mock('@services/chat', () => ({
  chatService: {
    listConversations: jest.fn(),
    createConversation: jest.fn(),
  },
}));

const { listConversations, createConversation } = chatService as unknown as {
  listConversations: jest.Mock;
  createConversation: jest.Mock;
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
}

describe('useConversations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches conversations', async () => {
    listConversations.mockResolvedValue([{ id: 'c1' }]);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'c1' }]);
  });

  it('creates a conversation and invalidates the list', async () => {
    createConversation.mockResolvedValue({ id: 'c2' });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateConversation(), { wrapper });
    await result.current.mutateAsync('model-1');

    expect(createConversation).toHaveBeenCalledWith('model-1');
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.chat.conversations(),
      }),
    );
  });
});

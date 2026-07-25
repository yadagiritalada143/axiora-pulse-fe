import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useMessages } from '@features/ai/hooks/useMessages';
import { chatService } from '@services/chat';

jest.mock('@services/chat', () => ({
  chatService: {
    listMessages: jest.fn(),
  },
}));

const { listMessages } = chatService as unknown as { listMessages: jest.Mock };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
}

describe('useMessages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches messages for a conversation', async () => {
    listMessages.mockResolvedValue([{ id: 'm1' }]);

    const { result } = renderHook(() => useMessages('c1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listMessages).toHaveBeenCalledWith('c1');
  });

  it('is disabled when there is no conversation id', () => {
    const { result } = renderHook(() => useMessages(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(listMessages).not.toHaveBeenCalled();
  });
});

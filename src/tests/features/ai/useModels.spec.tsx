import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useModels } from '@features/ai/hooks/useModels';
import { chatService } from '@services/chat';

jest.mock('@services/chat', () => ({
  chatService: {
    listModels: jest.fn(),
  },
}));

const { listModels } = chatService as unknown as { listModels: jest.Mock };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useModels', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches the available models', async () => {
    listModels.mockResolvedValue([{ id: 'gpt' }]);

    const { result } = renderHook(() => useModels(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'gpt' }]);
  });
});

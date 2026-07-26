import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type { AIModel } from '@/types/chat.types';
import { useModels } from '@features/ai/hooks/useModels';
import { chatService } from '@services/chat';

jest.mock('@services/chat', () => ({
  chatService: {
    listModels: jest.fn(),
  },
}));

const mockedChatService = chatService as jest.Mocked<typeof chatService>;

const MODEL: AIModel = {
  id: 'model-1',
  label: 'GPT Pulse',
  provider: 'openai',
  description: 'General purpose model',
  isDefault: true,
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

describe('useModels', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the list of available AI models', async () => {
    mockedChatService.listModels.mockResolvedValue([MODEL]);

    const { result } = renderHook(() => useModels(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([MODEL]);
    expect(mockedChatService.listModels).toHaveBeenCalledTimes(1);
  });
});

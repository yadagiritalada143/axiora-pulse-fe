import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { OrchestrationRunRequest } from '@/types/orchestration.types';
import { useRunOrchestration } from '@features/ideaValidation/hooks/useRunOrchestration';
import { orchestrationService } from '@services/orchestration/orchestration.service';

jest.mock('@services/orchestration/orchestration.service', () => ({
  orchestrationService: {
    run: jest.fn(),
  },
}));

const { run } = orchestrationService as unknown as { run: jest.Mock };

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

describe('useRunOrchestration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('runs the orchestration with the given payload', async () => {
    run.mockResolvedValue({ result: 'ok' });

    const { result } = renderHook(() => useRunOrchestration(), { wrapper: createWrapper() });
    const payload: OrchestrationRunRequest = {
      workspace_id: 'ws',
      idea_id: 'idea',
      workflow_type: 'validation',
      idea: {
        idea_title: 't',
        idea_description: 'd',
        problem_statement: 'p',
        target_customer: 'c',
        industry: 'i',
        founder_validation_goal: 'g',
        geography: 'geo',
      },
    };
    const response = await result.current.mutateAsync(payload);

    expect(run).toHaveBeenCalledWith(payload);
    expect(response).toEqual({ result: 'ok' });
  });
});

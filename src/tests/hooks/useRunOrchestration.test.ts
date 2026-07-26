import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type {
  OrchestrationRunRequest,
  OrchestrationRunResponse,
} from '@/types/orchestration.types';
import { useRunOrchestration } from '@features/ideaValidation/hooks/useRunOrchestration';
import { orchestrationService } from '@services/orchestration/orchestration.service';

jest.mock('@services/orchestration/orchestration.service', () => ({
  orchestrationService: { run: jest.fn() },
}));

const mockedOrchestrationService = orchestrationService as jest.Mocked<typeof orchestrationService>;

const REQUEST: OrchestrationRunRequest = {
  workspace_id: '1',
  idea_id: '1',
  workflow_type: 'idea_validation',
  idea: {
    idea_title: 'Inventory AI',
    idea_description: 'Forecasting for retailers',
    problem_statement: 'Retailers overstock',
    target_customer: 'SMB retailers',
    industry: 'Retail Technology',
    founder_validation_goal: 'Validate willingness to pay',
    geography: 'Global',
  },
};

const RESPONSE: OrchestrationRunResponse = {
  run_id: 'run-1',
  workspace_id: '1',
  idea_id: '1',
  workflow_type: 'idea_validation',
  status: 'completed',
  result: null,
  error: null,
  started_at: '2026-01-01T00:00:00.000Z',
  completed_at: '2026-01-01T00:01:00.000Z',
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

describe('useRunOrchestration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('runs the orchestration workflow and returns the response on success', async () => {
    mockedOrchestrationService.run.mockResolvedValue(RESPONSE);

    const { result } = renderHook(() => useRunOrchestration(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate(REQUEST);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(RESPONSE);
    expect(mockedOrchestrationService.run).toHaveBeenCalledWith(REQUEST);
  });

  it('surfaces an error when the orchestration run fails', async () => {
    mockedOrchestrationService.run.mockRejectedValue(new Error('orchestration unavailable'));

    const { result } = renderHook(() => useRunOrchestration(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate(REQUEST);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('orchestration unavailable'));
    expect(result.current.data).toBeUndefined();
  });
});

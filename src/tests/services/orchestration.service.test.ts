// Mocked apiClient methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import type {
  OrchestrationRunRequest,
  OrchestrationRunResponse,
} from '@/types/orchestration.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { orchestrationService } from '@services/orchestration/orchestration.service';

// See auth.service.test.ts for why this mocks the barrel directly rather than spreading
// `jest.requireActual` - the real client.ts pulls in `import.meta.env`, which Jest can't evaluate.
jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('orchestrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('run posts the payload and returns the raw response body', async () => {
    const payload: OrchestrationRunRequest = {
      workspace_id: 'ws-1',
      idea_id: 'idea-1',
      workflow_type: 'idea_validation',
      idea: {
        idea_title: 'Title',
        idea_description: 'Description',
        problem_statement: 'Problem',
        target_customer: 'Customer',
        industry: 'Industry',
        founder_validation_goal: 'Goal',
        geography: 'Geo',
      },
    };
    const responseBody: OrchestrationRunResponse = {
      run_id: 'run-1',
      workspace_id: 'ws-1',
      idea_id: 'idea-1',
      workflow_type: 'idea_validation',
      status: 'pending',
      result: null,
      error: null,
      started_at: '2026-01-01T00:00:00.000Z',
      completed_at: null,
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await orchestrationService.run(payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.ORCHESTRATION.RUN, payload);
    expect(result).toBe(responseBody);
  });
});

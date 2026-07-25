import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { orchestrationService } from '@services/orchestration/orchestration.service';

jest.mock('@services/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const { post } = apiClient as unknown as { post: jest.Mock };

describe('orchestrationService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('run posts the payload and returns the response data', async () => {
    const data = { run_id: 'r1', status: 'completed' };
    post.mockResolvedValue({ data });

    const payload = {
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

    const result = await orchestrationService.run(payload);

    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.ORCHESTRATION.RUN, payload);
    expect(result).toBe(data);
  });
});

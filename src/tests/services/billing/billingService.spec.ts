import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { billingService } from '@services/billing/billing.service';

jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const { get, post } = apiClient as unknown as { get: jest.Mock; post: jest.Mock };

describe('billingService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listPlans unwraps the ApiResponse data', async () => {
    get.mockResolvedValue({ data: { data: [{ id: 'pro' }] } });

    const result = await billingService.listPlans();

    expect(get).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.PLANS);
    expect(result).toEqual([{ id: 'pro' }]);
  });

  it('subscribe posts the plan id', async () => {
    post.mockResolvedValue({ data: {} });

    await billingService.subscribe('pro');

    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.SUBSCRIBE, { planId: 'pro' });
  });
});

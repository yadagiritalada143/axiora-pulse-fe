// Mocked apiClient methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import type { PricingPlan } from '@/types/api.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { billingService } from '@services/billing/billing.service';

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

describe('billingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('listPlans fetches plans and unwraps the ApiResponse envelope', async () => {
    const plans: PricingPlan[] = [
      { id: 'p1', name: 'Starter', priceMonthly: 10, priceYearly: 100, features: ['a'] },
    ];
    mockedApiClient.get.mockResolvedValue({ data: { success: true, data: plans } });

    const result = await billingService.listPlans();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.PLANS);
    expect(result).toBe(plans);
  });

  it('subscribe posts the selected plan id', async () => {
    mockedApiClient.post.mockResolvedValue({ data: undefined });

    await billingService.subscribe('plan-123');

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.SUBSCRIBE, {
      planId: 'plan-123',
    });
  });
});

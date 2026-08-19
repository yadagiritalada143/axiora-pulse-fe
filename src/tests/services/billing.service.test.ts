// Mocked apiClient methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import type { PricingPlan } from '@/types/api.types';
import type {
  RazorpaySubscriptionHandlerResponse,
  SubscribeResponse,
  UserSubscription,
} from '@/types/billing.types';
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

  it('subscribe posts the plan id + billing period and returns the checkout handle', async () => {
    const handle: SubscribeResponse = {
      subscriptionId: 'sub_123',
      keyId: 'rzp_test_abc',
      shortUrl: 'https://rzp.io/i/abc',
    };
    mockedApiClient.post.mockResolvedValue({ data: { success: true, data: handle } });

    const result = await billingService.subscribe('pro', 'yearly');

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.SUBSCRIBE, {
      planId: 'pro',
      billingPeriod: 'yearly',
    });
    expect(result).toBe(handle);
  });

  it('subscribe defaults billingPeriod to monthly', async () => {
    mockedApiClient.post.mockResolvedValue({ data: { success: true, data: {} } });

    await billingService.subscribe('pro');

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.SUBSCRIBE, {
      planId: 'pro',
      billingPeriod: 'monthly',
    });
  });

  it('verify posts the Checkout handler payload and unwraps the subscription', async () => {
    const payload: RazorpaySubscriptionHandlerResponse = {
      razorpay_payment_id: 'pay_1',
      razorpay_subscription_id: 'sub_1',
      razorpay_signature: 'sig_1',
    };
    const sub: UserSubscription = {
      status: 'authenticated',
      planCode: 'pro',
      planName: 'Pro',
      billingPeriod: 'monthly',
      currentEnd: null,
      cancelAtPeriodEnd: false,
    };
    mockedApiClient.post.mockResolvedValue({ data: { success: true, data: sub } });

    const result = await billingService.verify(payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.VERIFY, payload);
    expect(result).toBe(sub);
  });

  it('getSubscription fetches the current subscription', async () => {
    const sub: UserSubscription = {
      status: 'active',
      planCode: 'pro',
      planName: 'Pro',
      billingPeriod: 'monthly',
      currentEnd: '2026-09-18T00:00:00Z',
      cancelAtPeriodEnd: false,
    };
    mockedApiClient.get.mockResolvedValue({ data: { success: true, data: sub } });

    const result = await billingService.getSubscription();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.SUBSCRIPTION);
    expect(result).toBe(sub);
  });

  it('cancel posts to the cancel endpoint and unwraps the subscription', async () => {
    const sub: UserSubscription = {
      status: 'active',
      planCode: 'pro',
      planName: 'Pro',
      billingPeriod: 'monthly',
      currentEnd: '2026-09-18T00:00:00Z',
      cancelAtPeriodEnd: true,
    };
    mockedApiClient.post.mockResolvedValue({ data: { success: true, data: sub } });

    const result = await billingService.cancel();

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.CANCEL);
    expect(result).toBe(sub);
  });
});

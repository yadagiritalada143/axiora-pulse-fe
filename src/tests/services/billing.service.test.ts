// Mocked apiClient methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

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

  it('listPlans fetches plans from /v1/plans and normalizes with generated features', async () => {
    const rawPlans = [
      {
        code: 'starter',
        name: 'Starter',
        price_monthly: 0,
        price_yearly: 0,
        old_price: 299,
        workspace_limit: 1,
        survey_response_cap: 100,
        regeneration_limit: 2,
        export_enabled: false,
        stage_rerun: 1,
        survey_analytics: 'Basic',
        storage_limit: 200,
        is_active: true,
      },
    ];
    mockedApiClient.get.mockResolvedValue({ data: { plans: rawPlans } });

    const result = await billingService.listPlans();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.BILLING.PLANS);
    const firstPlan = result[0];
    expect(firstPlan?.id).toBe('starter');
    expect(firstPlan?.name).toBe('Starter');
    expect(firstPlan?.priceMonthly).toBe(0);
    expect(firstPlan?.old_price).toBe(299);
    expect(firstPlan?.oldPrice).toBe(299);
    expect(firstPlan?.features).toEqual([
      '1 workspace/idea for 7 days',
      '2 survey regenerations per workspace',
      '1 stage rerun per workspace',
      'Basic survey analytics',
      '100 survey responses per workspace',
      '200 MB storage',
    ]);
  });

  it('listPlans filters out inactive plans', async () => {
    const rawPlans = [
      { code: 'active', name: 'Active Plan', price_monthly: 100, is_active: true },
      { code: 'inactive', name: 'Inactive Plan', price_monthly: 100, is_active: false },
    ];
    mockedApiClient.get.mockResolvedValue({ data: { plans: rawPlans } });

    const result = await billingService.listPlans();

    expect(result).toHaveLength(1);
    const activePlan = result[0];
    expect(activePlan?.id).toBe('active');
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

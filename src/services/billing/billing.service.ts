import type { PricingPlan } from '@/types/api.types';
import type {
  BillingPeriod,
  RazorpaySubscriptionHandlerResponse,
  SubscribeResponse,
  UserSubscription,
} from '@/types/billing.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const billingService = {
  async listPlans(): Promise<PricingPlan[]> {
    const { data } = await apiClient.get<ApiResponse<PricingPlan[]>>(API_ENDPOINTS.BILLING.PLANS);
    return data.data;
  },

  /**
   * Create a Razorpay subscription for the current user. Returns the handle the
   * client uses to open Razorpay Checkout (the payment itself happens on
   * Razorpay's hosted modal, never here).
   */
  async subscribe(
    planId: string,
    billingPeriod: BillingPeriod = 'monthly',
  ): Promise<SubscribeResponse> {
    const { data } = await apiClient.post<ApiResponse<SubscribeResponse>>(
      API_ENDPOINTS.BILLING.SUBSCRIBE,
      { planId, billingPeriod },
    );
    return data.data;
  },

  /** Confirm the signature Checkout returns after authorization (best-effort; webhook is authoritative). */
  async verify(payload: RazorpaySubscriptionHandlerResponse): Promise<UserSubscription> {
    const { data } = await apiClient.post<ApiResponse<UserSubscription>>(
      API_ENDPOINTS.BILLING.VERIFY,
      payload,
    );
    return data.data;
  },

  /** Current subscription status for the authenticated user. */
  async getSubscription(): Promise<UserSubscription> {
    const { data } = await apiClient.get<ApiResponse<UserSubscription>>(
      API_ENDPOINTS.BILLING.SUBSCRIPTION,
    );
    return data.data;
  },

  /** Cancel the active subscription at the end of the current billing cycle. */
  async cancel(): Promise<UserSubscription> {
    const { data } = await apiClient.post<ApiResponse<UserSubscription>>(
      API_ENDPOINTS.BILLING.CANCEL,
    );
    return data.data;
  },
};

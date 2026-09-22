import type { PricingPlan } from '@/types/api.types';
import type {
  AccountStatus,
  BillingPeriod,
  RazorpaySubscriptionHandlerResponse,
  SubscribeResponse,
  UserSubscription,
} from '@/types/billing.types';
import type { ApiResponse } from '@/types/response.types';
import { generatePlanFeatures, isFreePlan } from '@/utils/planFeatures';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const billingService = {
  async listPlans(): Promise<PricingPlan[]> {
    let rawPlans: unknown[] = [];
    try {
      const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.BILLING.PLANS);
      const data = response.data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data.plans)) {
          rawPlans = data.plans;
        } else if (Array.isArray(data.data)) {
          rawPlans = data.data;
        } else if (Array.isArray(data)) {
          rawPlans = data;
        }
      }
    } catch {
      rawPlans = [];
    }

    return (rawPlans as Record<string, unknown>[])
      .filter((p) => p.is_active !== false)
      .map((p): PricingPlan => {
        const priceMonthly = Number(p.price_monthly ?? p.priceMonthly ?? 0);
        const priceYearly = Number(p.price_yearly ?? p.priceYearly ?? 0);
        const rawOldPrice = p.old_price ?? p.oldPrice;
        const oldPrice = rawOldPrice != null && rawOldPrice !== '' ? Number(rawOldPrice) : null;
        const rawCode =
          typeof p.code === 'string' && p.code
            ? p.code
            : typeof p.id === 'string' || typeof p.id === 'number'
              ? String(p.id)
              : '';
        const planCode = rawCode.toLowerCase();
        const planId = rawCode;

        const isFree = isFreePlan({
          code: planCode,
          name: typeof p.name === 'string' ? p.name : '',
          price_monthly: priceMonthly,
          priceMonthly,
        });

        const planSource = {
          id: planId,
          code: planCode,
          name: typeof p.name === 'string' ? p.name : '',
          price_monthly: priceMonthly,
          priceMonthly,
          price_yearly: priceYearly,
          priceYearly,
          old_price: oldPrice,
          oldPrice,
          workspace_limit: p.workspace_limit != null ? Number(p.workspace_limit) : null,
          survey_response_cap: p.survey_response_cap != null ? Number(p.survey_response_cap) : null,
          regeneration_limit: p.regeneration_limit != null ? Number(p.regeneration_limit) : null,
          export_enabled: isFree ? false : Boolean(p.export_enabled),
          stage_rerun: p.stage_rerun != null ? Number(p.stage_rerun) : null,
          survey_analytics: typeof p.survey_analytics === 'string' ? p.survey_analytics : 'Basic',
          storage_limit: p.storage_limit != null ? Number(p.storage_limit) : null,
          features: Array.isArray(p.features) ? (p.features as string[]) : undefined,
        };

        return {
          id: planId,
          code: planCode,
          name: planSource.name,
          description: typeof p.description === 'string' ? p.description : null,
          priceMonthly,
          priceYearly,
          price_monthly: priceMonthly,
          price_yearly: priceYearly,
          old_price: oldPrice,
          oldPrice,
          currency: typeof p.currency === 'string' ? p.currency : 'INR',
          tier: Number(p.tier ?? 0),
          workspace_limit: planSource.workspace_limit,
          survey_response_cap: planSource.survey_response_cap,
          regeneration_limit: planSource.regeneration_limit,
          export_enabled: planSource.export_enabled,
          stage_rerun: planSource.stage_rerun,
          survey_analytics: planSource.survey_analytics,
          storage_limit: planSource.storage_limit,
          popular: Boolean(p.popular),
          is_active: p.is_active !== false,
          features: generatePlanFeatures(planSource),
        };
      });
  },

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

  async verify(payload: RazorpaySubscriptionHandlerResponse): Promise<UserSubscription> {
    const { data } = await apiClient.post<ApiResponse<UserSubscription>>(
      API_ENDPOINTS.BILLING.VERIFY,
      payload,
    );
    return data.data;
  },

  async getSubscription(): Promise<UserSubscription> {
    const { data } = await apiClient.get<ApiResponse<UserSubscription>>(
      API_ENDPOINTS.BILLING.SUBSCRIPTION,
    );
    return data.data;
  },

  async cancel(): Promise<UserSubscription> {
    const { data } = await apiClient.post<ApiResponse<UserSubscription>>(
      API_ENDPOINTS.BILLING.CANCEL,
    );
    return data.data;
  },

  async getStatus(): Promise<AccountStatus> {
    const { data } = await apiClient.get<ApiResponse<AccountStatus>>(API_ENDPOINTS.BILLING.STATUS);
    return data.data;
  },

  async selectFreePlan(planId: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(API_ENDPOINTS.BILLING.SELECT_PLAN(planId));
  },
};

import type { PricingPlan } from '@/types/api.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const billingService = {
  async listPlans(): Promise<PricingPlan[]> {
    const { data } = await apiClient.get<ApiResponse<PricingPlan[]>>(API_ENDPOINTS.BILLING.PLANS);
    return data.data;
  },

  async subscribe(planId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.BILLING.SUBSCRIBE, { planId });
  },
};

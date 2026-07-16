import type {
  OrchestrationRunRequest,
  OrchestrationRunResponse,
} from '@/types/orchestration.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const orchestrationService = {
  async run(payload: OrchestrationRunRequest): Promise<OrchestrationRunResponse> {
    const { data } = await apiClient.post<OrchestrationRunResponse>(
      API_ENDPOINTS.ORCHESTRATION.RUN,
      payload,
    );
    return data;
  },
};

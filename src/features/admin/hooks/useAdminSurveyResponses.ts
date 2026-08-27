import { useQuery } from '@tanstack/react-query';

import type { ListAdminSurveyResponsesParams } from '@/types/admin.types';
import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useAdminSurveyResponses(surveyId: number, params?: ListAdminSurveyResponsesParams) {
  return useQuery({
    queryKey: queryKeys.admin.surveyResponses(surveyId, params),
    queryFn: () => adminService.listSurveyResponses(surveyId, params),
    enabled: Number.isInteger(surveyId) && surveyId > 0,
  });
}

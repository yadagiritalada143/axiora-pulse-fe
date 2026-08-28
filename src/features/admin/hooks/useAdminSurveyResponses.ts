import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { ListAdminSurveyResponsesParams } from '@features/admin/types';
import { adminService } from '@services/admin';

export function useAdminSurveyResponses(surveyId: number, params?: ListAdminSurveyResponsesParams) {
  return useQuery({
    queryKey: queryKeys.admin.surveyResponses(surveyId, params),
    queryFn: () => adminService.listSurveyResponses(surveyId, params),
    enabled: Boolean(surveyId),
  });
}

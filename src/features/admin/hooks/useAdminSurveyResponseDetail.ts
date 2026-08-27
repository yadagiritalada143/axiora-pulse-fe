import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useAdminSurveyResponseDetail(surveyId: number, responseId: number) {
  return useQuery({
    queryKey: queryKeys.admin.surveyResponseDetail(surveyId, responseId),
    queryFn: () => adminService.getSurveyResponseDetail(surveyId, responseId),
    enabled:
      Number.isInteger(surveyId) && surveyId > 0 && Number.isInteger(responseId) && responseId > 0,
  });
}

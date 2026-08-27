import { useQuery } from '@tanstack/react-query';

import type { ListAdminSurveysParams } from '@/types/admin.types';
import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useAdminSurveys(params?: ListAdminSurveysParams) {
  return useQuery({
    queryKey: queryKeys.admin.surveys(params),
    queryFn: () => adminService.listSurveys(params),
  });
}

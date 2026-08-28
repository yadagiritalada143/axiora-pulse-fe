import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import type { ListAdminSurveysParams } from '@features/admin/types';
import { adminService } from '@services/admin';

export function useAdminSurveys(params?: ListAdminSurveysParams) {
  return useQuery({
    queryKey: queryKeys.admin.surveys(params),
    queryFn: () => adminService.listSurveys(params),
  });
}

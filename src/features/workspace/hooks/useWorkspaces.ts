import { useQuery } from '@tanstack/react-query';

import type { Workspace } from '@/types/api.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { queryKeys } from '@constants/queryKeys';
import { apiClient } from '@services/api';

async function fetchWorkspaces(): Promise<Workspace[]> {
  const { data } = await apiClient.get<ApiResponse<Workspace[]>>(API_ENDPOINTS.WORKSPACE.LIST);
  return data.data;
}

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspace.list(),
    queryFn: fetchWorkspaces,
  });
}

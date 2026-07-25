import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { workspaceService } from '../api';

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspace.list(),
    queryFn: workspaceService.getWorkspaces,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useWorkspace(workspaceId: number) {
  return useQuery({
    queryKey: queryKeys.workspace.detail(workspaceId),
    queryFn: () => workspaceService.getWorkspaceById(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.createWorkspace,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all(),
      });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.deleteWorkspace,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all(),
      });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { workspaceService } from '../api';

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspace.list(),
    queryFn: workspaceService.getWorkspaces,
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

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.updateWorkspace,

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all(),
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.detail(variables.id),
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

export function useArchivedWorkspaces() {
  return useQuery({
    queryKey: [...queryKeys.workspace.all(), 'archived'],
    queryFn: workspaceService.getArchivedWorkspaces,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useRestoreWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.restoreWorkspace,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all(),
      });
    },
  });
}

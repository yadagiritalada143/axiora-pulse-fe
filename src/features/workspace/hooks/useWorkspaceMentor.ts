import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { workspaceService } from '../api';
import type { ExportWorkspaceReportRequest, WorkspaceStateResponse } from '../types';

export function useWorkspaceState(workspaceId: number) {
  return useQuery({
    queryKey: queryKeys.workspace.state(workspaceId),
    queryFn: () => workspaceService.getWorkspaceState(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceChat(workspaceId: number) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.workspace.state(workspaceId);

  return useMutation({
    mutationFn: (message: string) => workspaceService.chatWithMentor(workspaceId, { message }),

    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<WorkspaceStateResponse>(queryKey);

      queryClient.setQueryData<WorkspaceStateResponse | undefined>(queryKey, (current) =>
        current
          ? {
              ...current,
              conversation_history: [
                ...current.conversation_history,
                { role: 'user', content: message },
              ],
            }
          : current,
      );

      return { previous };
    },

    onError: (_error, _message, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSuccess: (response) => {
      queryClient.setQueryData<WorkspaceStateResponse | undefined>(queryKey, (current) =>
        current
          ? {
              ...current,
              state: response.state,
              idea: response.idea,
              validation_result: response.validation_result,
              conversation_history: [
                ...current.conversation_history,
                { role: 'assistant', content: response.reply },
              ],
            }
          : current,
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace.detail(workspaceId) });
    },
  });
}

export function useResetWorkspaceMentor(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workspaceService.resetMentor(workspaceId),

    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.workspace.state(workspaceId), response);
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace.detail(workspaceId) });
    },
  });
}

export function useExportWorkspaceReport(workspaceId: number) {
  return useMutation({
    mutationFn: (payload: ExportWorkspaceReportRequest) =>
      workspaceService.exportReport(workspaceId, payload),

    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { workspaceService } from '../api/workspace.service';

export function useWorkspaceAttachments(workspaceId: number) {
  const queryClient = useQueryClient();

  const attachmentsQuery = useQuery({
    queryKey: ['workspace-attachments', workspaceId],
    queryFn: () => workspaceService.getAttachments(workspaceId),
    enabled: Boolean(workspaceId) && !isNaN(workspaceId),
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) =>
      workspaceService.deleteAttachment(workspaceId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspace-attachments', workspaceId] });
      toast.success('Attachment deleted successfully');
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Failed to delete attachment.';
      toast.error(msg);
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => workspaceService.uploadAttachment(workspaceId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspace-attachments', workspaceId] });
      toast.success('File uploaded successfully');
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Failed to upload file.';
      toast.error(msg);
    },
  });

  return {
    ...attachmentsQuery,
    attachments: attachmentsQuery.data?.attachments ?? [],
    total: attachmentsQuery.data?.total ?? attachmentsQuery.data?.attachments?.length ?? 0,
    deleteAttachment: deleteAttachmentMutation.mutate,
    isDeleting: deleteAttachmentMutation.isPending,
    uploadAttachment: uploadAttachmentMutation.mutateAsync,
    isUploading: uploadAttachmentMutation.isPending,
  };
}

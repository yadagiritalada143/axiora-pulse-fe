import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  AdminUserFeedbackFilterParams,
  CreateFeedbackQuestionPayload,
  UpdateFeedbackQuestionPayload,
  UserFeedbackSubmitPayload,
} from '@/types/feedback.types';
import { queryKeys } from '@constants/queryKeys';

import { feedbackService } from '../api/feedback.service';

export function useAdminFeedbackQuestions() {
  return useQuery({
    queryKey: queryKeys.feedback.adminQuestions(),
    queryFn: () => feedbackService.listAdminQuestions(),
  });
}

export function useCreateFeedbackQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFeedbackQuestionPayload) => feedbackService.createQuestion(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all() });
      toast.success('Feedback question created successfully.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unable to create question. Please try again.';
      toast.error(message);
    },
  });
}

export function useUpdateFeedbackQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: number;
      payload: UpdateFeedbackQuestionPayload;
    }) => feedbackService.updateQuestion(questionId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all() });
      toast.success('Feedback question updated successfully.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unable to update question. Please try again.';
      toast.error(message);
    },
  });
}

export function useDisplayedFeedbackQuestions(isDisplay = true, workspaceId?: number) {
  return useQuery({
    queryKey: queryKeys.feedback.userQuestions(isDisplay, workspaceId),
    queryFn: () => feedbackService.listDisplayedQuestions(isDisplay, workspaceId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useSubmitUserFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserFeedbackSubmitPayload) => feedbackService.submitFeedback(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all() });
      toast.success('Feedback submitted successfully!');
    },
    onError: (error: unknown) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all() });
      const message =
        error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.';
      toast.error(message);
    },
  });
}

export function useAdminUserFeedbackSubmissions(params?: AdminUserFeedbackFilterParams) {
  return useQuery({
    queryKey: queryKeys.feedback.adminSubmissions(params),
    queryFn: () => feedbackService.listUserFeedback(params),
  });
}

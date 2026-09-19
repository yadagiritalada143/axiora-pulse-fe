import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  AdminUserFeedbackFilterParams,
  CreateFeedbackQuestionPayload,
  UpdateFeedbackQuestionPayload,
  UserFeedbackSubmitPayload,
  UserFeedbackSubmitResult,
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

export function useDisplayedFeedbackQuestions(isDisplay = true) {
  return useQuery({
    queryKey: queryKeys.feedback.userQuestions(isDisplay),
    queryFn: () => feedbackService.listDisplayedQuestions(isDisplay),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useSubmitUserFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserFeedbackSubmitPayload) => feedbackService.submitFeedback(payload),
    onSuccess: ({ blob, filename }: UserFeedbackSubmitResult) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all() });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Feedback submitted! Your certificate download has started.');
    },
    onError: (error: unknown) => {
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

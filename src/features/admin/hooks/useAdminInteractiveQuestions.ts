import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CreateInteractiveQuestionPayload } from '@/types/onboarding.types';
import { queryKeys } from '@constants/queryKeys';
import { onboardingService } from '@services/onboarding';

/** Invalidate both the admin's full list and the user-facing filtered list they feed. */
function invalidateInteractiveQuestionQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.admin.interactiveQuestions() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.interactiveQuestions() });
}

export function useAdminInteractiveQuestions() {
  return useQuery({
    queryKey: queryKeys.admin.interactiveQuestions(),
    queryFn: () => onboardingService.listAllInteractiveQuestions(),
  });
}

export function useCreateInteractiveQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInteractiveQuestionPayload) =>
      onboardingService.createInteractiveQuestion(payload),
    onSuccess: () => {
      invalidateInteractiveQuestionQueries(queryClient);
      toast.success('Question added.');
    },
    onError: () => {
      toast.error('Unable to add the question. Please try again.');
    },
  });
}

export function useDeleteInteractiveQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => onboardingService.deleteInteractiveQuestion(id),
    onSuccess: () => {
      invalidateInteractiveQuestionQueries(queryClient);
      toast.success('Question deleted.');
    },
    onError: () => {
      toast.error('Unable to delete the question. Please try again.');
    },
  });
}

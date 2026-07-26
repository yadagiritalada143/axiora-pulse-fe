import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { InteractiveAnswerPayload } from '@/types/onboarding.types';
import { queryKeys } from '@constants/queryKeys';
import { onboardingService } from '@services/onboarding';

export function useInteractiveQuestions(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.onboarding.interactiveQuestions(),
    queryFn: () => onboardingService.getInteractiveQuestions(),
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useSubmitInteractiveAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InteractiveAnswerPayload[]) =>
      onboardingService.submitInteractiveAnswers(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.interactiveQuestions() });
      toast.success('Thanks! Your answers help your AI Mentor understand your idea better.');
    },
    onError: () => {
      toast.error('Something went wrong submitting your answers. Please try again.');
    },
  });
}

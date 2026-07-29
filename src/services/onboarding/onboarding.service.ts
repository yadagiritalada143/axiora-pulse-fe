import { API_ENDPOINTS } from '@/constants/api';
import type {
  CreateInteractiveQuestionPayload,
  InteractiveAnswerPayload,
  InteractiveQuestion,
  SubmitInteractiveAnswersResponse,
} from '@/types/onboarding.types';

import { apiClient } from '../api';

export const onboardingService = {
  getInteractiveQuestions: async (): Promise<InteractiveQuestion[]> => {
    const { data } = await apiClient.get<InteractiveQuestion[]>(API_ENDPOINTS.ONBOARDING.QUESTIONS);

    return data;
  },

  submitInteractiveAnswers: async (
    payload: InteractiveAnswerPayload[],
  ): Promise<SubmitInteractiveAnswersResponse> => {
    const { data } = await apiClient.post<SubmitInteractiveAnswersResponse>(
      API_ENDPOINTS.ONBOARDING.SUBMIT,
      payload,
    );

    return data;
  },

  listAllInteractiveQuestions: async (): Promise<InteractiveQuestion[]> => {
    const { data } = await apiClient.get<InteractiveQuestion[]>(
      API_ENDPOINTS.ONBOARDING.ADMIN.QUESTIONS,
    );

    return data;
  },

  createInteractiveQuestion: async (
    payload: CreateInteractiveQuestionPayload,
  ): Promise<InteractiveQuestion> => {
    const { data } = await apiClient.post<InteractiveQuestion>(
      API_ENDPOINTS.ONBOARDING.ADMIN.CREATE,
      payload,
    );

    return data;
  },

  deleteInteractiveQuestion: async (id: number): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.ONBOARDING.ADMIN.DELETE(id),
    );

    return data;
  },
};

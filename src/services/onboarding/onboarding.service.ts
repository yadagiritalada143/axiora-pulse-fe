import type { InteractiveAnswerPayload, InteractiveQuestion } from '@/types/onboarding.types';
import { STORAGE_KEYS } from '@constants/storage';
import { storage } from '@utils/storage';

import { MOCK_INTERACTIVE_QUESTIONS } from './onboarding.mock';

const MOCK_LATENCY_MS = 400;

function resolveAfter<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

export const onboardingService = {
  /**
   * TODO: replace with GET /v1/interactive-questions once the backend ships it.
   * The real endpoint is expected to only return questions the user hasn't
   * answered yet - an empty array means the flow is already complete.
   */
  async getInteractiveQuestions(): Promise<InteractiveQuestion[]> {
    const alreadySubmitted = storage.get<boolean>(STORAGE_KEYS.INTERACTIVE_QUESTIONS_SUBMITTED);
    return resolveAfter(alreadySubmitted ? [] : MOCK_INTERACTIVE_QUESTIONS);
  },

  /** TODO: replace with POST /v1/interactive-questions/submit once the backend ships it. */
  async submitInteractiveAnswers(_payload: InteractiveAnswerPayload[]): Promise<void> {
    await resolveAfter(undefined);
    storage.set(STORAGE_KEYS.INTERACTIVE_QUESTIONS_SUBMITTED, true);
    storage.remove(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT);
  },
};

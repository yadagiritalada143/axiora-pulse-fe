import type {
  CreateInteractiveQuestionPayload,
  InteractiveAnswerPayload,
  InteractiveQuestion,
} from '@/types/onboarding.types';
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

  /**
   * TODO: replace with GET /v1/admin/interactive-questions once the backend ships it.
   * Unlike `getInteractiveQuestions`, this always returns the full question pool -
   * admins manage every question regardless of any single user's submission state.
   */
  async listAllInteractiveQuestions(): Promise<InteractiveQuestion[]> {
    return resolveAfter([...MOCK_INTERACTIVE_QUESTIONS]);
  },

  /** TODO: replace with POST /v1/admin/interactive-questions once the backend ships it. */
  async createInteractiveQuestion(
    payload: CreateInteractiveQuestionPayload,
  ): Promise<InteractiveQuestion> {
    const nextId =
      MOCK_INTERACTIVE_QUESTIONS.reduce((max, question) => Math.max(max, question.id), 0) + 1;
    const question: InteractiveQuestion = { id: nextId, questionId: nextId, ...payload };
    MOCK_INTERACTIVE_QUESTIONS.push(question);
    return resolveAfter(question);
  },

  /**
   * TODO: replace with DELETE /v1/admin/interactive-questions/:id once the backend ships it.
   * Removing a question from the shared mock pool drops it for every user - including
   * ones who already answered it, since this mock has no per-user answer store to reconcile.
   */
  async deleteInteractiveQuestion(id: number): Promise<void> {
    const index = MOCK_INTERACTIVE_QUESTIONS.findIndex((question) => question.id === id);
    if (index !== -1) {
      MOCK_INTERACTIVE_QUESTIONS.splice(index, 1);
    }
    await resolveAfter(undefined);
  },
};

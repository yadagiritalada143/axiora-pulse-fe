import { STORAGE_KEYS } from '@constants/storage';
import { MOCK_INTERACTIVE_QUESTIONS } from '@services/onboarding/onboarding.mock';
import { onboardingService } from '@services/onboarding/onboarding.service';
import { storage } from '@utils/storage';

jest.mock('@utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('onboardingService', () => {
  const SEED_QUESTIONS = MOCK_INTERACTIVE_QUESTIONS.map((question) => ({ ...question }));

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    MOCK_INTERACTIVE_QUESTIONS.length = 0;
    MOCK_INTERACTIVE_QUESTIONS.push(...SEED_QUESTIONS.map((question) => ({ ...question })));
  });

  describe('getInteractiveQuestions', () => {
    it('returns the mock questions when the user has not submitted yet', async () => {
      (storage.get as jest.Mock).mockReturnValue(false);

      const promise = onboardingService.getInteractiveQuestions();
      jest.advanceTimersByTime(400);
      const result = await promise;

      expect(storage.get).toHaveBeenCalledWith(STORAGE_KEYS.INTERACTIVE_QUESTIONS_SUBMITTED);
      expect(result).toEqual(MOCK_INTERACTIVE_QUESTIONS);
    });

    it('returns an empty array once the user has already submitted', async () => {
      (storage.get as jest.Mock).mockReturnValue(true);

      const promise = onboardingService.getInteractiveQuestions();
      jest.advanceTimersByTime(400);
      const result = await promise;

      expect(result).toEqual([]);
    });
  });

  describe('submitInteractiveAnswers', () => {
    it('marks the submission flag and clears the local draft', async () => {
      const payload = [{ interactive_question_ID: 101, answer: ['Farhan'] }];

      const promise = onboardingService.submitInteractiveAnswers(payload);
      jest.advanceTimersByTime(400);
      await promise;

      expect(storage.set).toHaveBeenCalledWith(STORAGE_KEYS.INTERACTIVE_QUESTIONS_SUBMITTED, true);
      expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT);
    });
  });

  describe('listAllInteractiveQuestions', () => {
    it('returns every question regardless of submission state', async () => {
      const promise = onboardingService.listAllInteractiveQuestions();
      jest.advanceTimersByTime(400);
      const result = await promise;

      expect(result).toEqual(SEED_QUESTIONS);
      expect(storage.get).not.toHaveBeenCalled();
    });
  });

  describe('createInteractiveQuestion', () => {
    it('appends a new question with an incrementing id and returns it', async () => {
      const promise = onboardingService.createInteractiveQuestion({
        question: 'What is your favorite color?',
        question_type: 'radio',
        optional: false,
        answers: ['Red', 'Blue'],
      });
      jest.advanceTimersByTime(400);
      const created = await promise;

      const maxSeedId = Math.max(...SEED_QUESTIONS.map((question) => question.id));
      expect(created).toEqual({
        id: maxSeedId + 1,
        questionId: maxSeedId + 1,
        question: 'What is your favorite color?',
        question_type: 'radio',
        optional: false,
        answers: ['Red', 'Blue'],
      });
      expect(MOCK_INTERACTIVE_QUESTIONS).toContainEqual(created);
    });
  });

  describe('deleteInteractiveQuestion', () => {
    it('removes the question with the matching id from the shared pool', async () => {
      const firstQuestionId = SEED_QUESTIONS[0]?.id ?? 0;

      const promise = onboardingService.deleteInteractiveQuestion(firstQuestionId);
      jest.advanceTimersByTime(400);
      await promise;

      expect(MOCK_INTERACTIVE_QUESTIONS.find((q) => q.id === firstQuestionId)).toBeUndefined();
      expect(MOCK_INTERACTIVE_QUESTIONS).toHaveLength(SEED_QUESTIONS.length - 1);
    });

    it('does nothing when the id does not exist', async () => {
      const promise = onboardingService.deleteInteractiveQuestion(999999);
      jest.advanceTimersByTime(400);
      await promise;

      expect(MOCK_INTERACTIVE_QUESTIONS).toHaveLength(SEED_QUESTIONS.length);
    });
  });
});

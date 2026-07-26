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
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
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
});

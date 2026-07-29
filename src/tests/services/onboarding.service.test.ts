import { API_ENDPOINTS } from '@/constants/api';
import type { InteractiveQuestion } from '@/types/onboarding.types';
import { apiClient } from '@services/api';
import { onboardingService } from '@services/onboarding/onboarding.service';

jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = apiClient.get as jest.Mock;
const mockedPost = apiClient.post as jest.Mock;
const mockedDelete = apiClient.delete as jest.Mock;

const QUESTION: InteractiveQuestion = {
  id: 1,
  question: 'What should I call you?',
  answer_type: 'textarea',
  optional: false,
  answers: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('onboardingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInteractiveQuestions', () => {
    it('requests the questionnaire endpoint and returns the data', async () => {
      mockedGet.mockResolvedValue({ data: [QUESTION] });

      const result = await onboardingService.getInteractiveQuestions();

      expect(mockedGet).toHaveBeenCalledWith(API_ENDPOINTS.ONBOARDING.QUESTIONS);
      expect(result).toEqual([QUESTION]);
    });
  });

  describe('submitInteractiveAnswers', () => {
    it('posts the answers payload to the submit endpoint', async () => {
      const payload = [{ questionnaire_id: 101, user_answers: ['Farhan'] }];
      mockedPost.mockResolvedValue({ data: { message: 'saved' } });

      const result = await onboardingService.submitInteractiveAnswers(payload);

      expect(mockedPost).toHaveBeenCalledWith(API_ENDPOINTS.ONBOARDING.SUBMIT, payload);
      expect(result).toEqual({ message: 'saved' });
    });
  });

  describe('listAllInteractiveQuestions', () => {
    it('requests the admin questions endpoint and returns the data', async () => {
      mockedGet.mockResolvedValue({ data: [QUESTION] });

      const result = await onboardingService.listAllInteractiveQuestions();

      expect(mockedGet).toHaveBeenCalledWith(API_ENDPOINTS.ONBOARDING.ADMIN.QUESTIONS);
      expect(result).toEqual([QUESTION]);
    });
  });

  describe('createInteractiveQuestion', () => {
    it('posts the new question to the admin create endpoint', async () => {
      const payload = {
        question: 'What is your favorite color?',
        answer_type: 'radiobuttons' as const,
        optional: false,
        answers: ['Red', 'Blue'],
      };
      const created: InteractiveQuestion = {
        id: 7,
        ...payload,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      };
      mockedPost.mockResolvedValue({ data: created });

      const result = await onboardingService.createInteractiveQuestion(payload);

      expect(mockedPost).toHaveBeenCalledWith(API_ENDPOINTS.ONBOARDING.ADMIN.CREATE, payload);
      expect(result).toEqual(created);
    });
  });

  describe('deleteInteractiveQuestion', () => {
    it('sends a delete request for the matching id', async () => {
      mockedDelete.mockResolvedValue({ data: { message: 'deleted' } });

      const result = await onboardingService.deleteInteractiveQuestion(3);

      expect(mockedDelete).toHaveBeenCalledWith(API_ENDPOINTS.ONBOARDING.ADMIN.DELETE(3));
      expect(result).toEqual({ message: 'deleted' });
    });
  });
});

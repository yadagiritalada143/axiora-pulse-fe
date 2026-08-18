import { surveyService } from '@/features/survey/api/survey.service';
import type {
  PublicSurveyDetailResponse,
  SubmitPublicSurveyRequest,
  SubmitPublicSurveyResponse,
  SurveyResponse,
  SurveyResponsesListResponse,
  UpdateWorkspaceSurveyQuestionsRequest,
  UpdateWorkspaceSurveyQuestionsResponse,
} from '@/features/survey/types';
import { apiClient } from '@/services/api';

// See auth.service.test.ts for why this mocks the barrel directly rather than spreading
// `jest.requireActual` - the real client.ts pulls in `import.meta.env`, which Jest can't evaluate.
jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const survey: SurveyResponse = {
  id: 5,
  user_id: 1,
  workspace_id: 42,
  public_token: 'abc123token',
  survey_link: 'https://example.test/surveys/public/abc123token',
  questions: [{ id: 1, question: 'How often?', questionType: 'text', options: [] }],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

describe('surveyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the survey for a workspace', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: survey });

    await expect(surveyService.getSurveyByWorkspaceId(42)).resolves.toEqual(survey);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/surveys/workspace/42');
  });

  it('updates the workspace survey questions', async () => {
    const payload: UpdateWorkspaceSurveyQuestionsRequest = {
      survey_title: 'Discovery',
      questions: [{ question_text: 'Why?', question_type: 'text', options: null }],
    };
    const response: UpdateWorkspaceSurveyQuestionsResponse = {
      status: 'ok',
      message: 'updated',
      workspace_id: 42,
      questions: payload.questions,
    };
    mockedApiClient.put.mockResolvedValueOnce({ data: response });

    await expect(surveyService.updateWorkspaceSurveyQuestions(42, payload)).resolves.toEqual(
      response,
    );
    expect(mockedApiClient.put).toHaveBeenCalledWith('/v1/workspaces/42/survey/questions', payload);
  });

  it('fetches a public survey by token', async () => {
    const response: PublicSurveyDetailResponse = {
      surveyId: 'abc123token',
      workspaceName: 'Acme',
      questions: survey.questions,
    };
    mockedApiClient.get.mockResolvedValueOnce({ data: response });

    await expect(surveyService.getPublicSurvey('abc123token')).resolves.toEqual(response);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/surveys/public/abc123token');
  });

  it('submits a public survey response', async () => {
    const payload: SubmitPublicSurveyRequest = {
      respondentEmail: 'person@example.test',
      answers: [{ questionId: 1, answer: 'Weekly' }],
    };
    const response: SubmitPublicSurveyResponse = {
      status: 'ok',
      message: 'recorded',
      responseId: 11,
    };
    mockedApiClient.post.mockResolvedValueOnce({ data: response });

    await expect(surveyService.submitPublicSurvey('abc123token', payload)).resolves.toEqual(
      response,
    );
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/v1/surveys/public/abc123token/submit',
      payload,
    );
  });

  it('fetches the collected responses for a survey', async () => {
    const response: SurveyResponsesListResponse = {
      survey_id: 5,
      total_responses: 1,
      responses: [
        {
          id: 11,
          survey_id: 5,
          respondent_email: null,
          answers: [{ questionId: 1, answer: 'Weekly' }],
          submitted_at: '2026-01-03T00:00:00.000Z',
        },
      ],
    };
    mockedApiClient.get.mockResolvedValueOnce({ data: response });

    await expect(surveyService.getSurveyResponses(5)).resolves.toEqual(response);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/surveys/5/responses');
  });

  it('propagates request failures to the caller', async () => {
    mockedApiClient.get.mockRejectedValueOnce(new Error('network error'));

    await expect(surveyService.getSurveyByWorkspaceId(42)).rejects.toThrow('network error');
  });
});

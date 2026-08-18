import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { queryKeys } from '@constants/queryKeys';
import {
  usePublicSurvey,
  useSubmitPublicSurvey,
  useSurveyByWorkspace,
  useSurveyResponses,
  useUpdateWorkspaceSurveyQuestions,
} from '@features/survey/hooks/useSurveys';
import type { SurveyResponse } from '@features/survey/types';
import { apiClient } from '@services/api';

jest.mock('@services/api', () => ({
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
  survey_link: null,
  questions: [{ id: 1, question: 'How often?', questionType: 'text', options: [] }],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('useSurveyByWorkspace', () => {
  it('fetches the survey for the given workspace', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: survey });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSurveyByWorkspace(42), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/surveys/workspace/42');
    expect(result.current.data).toEqual(survey);
  });

  it('stays idle when the workspace id is falsy', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSurveyByWorkspace(0), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });
});

describe('useUpdateWorkspaceSurveyQuestions', () => {
  it('invalidates the survey, detail and state queries on success', async () => {
    mockedApiClient.put.mockResolvedValueOnce({
      data: { status: 'ok', message: 'updated', workspace_id: 42, questions: [] },
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateWorkspaceSurveyQuestions(42), { wrapper });

    result.current.mutate({
      questions: [{ question_text: 'Why?', question_type: 'text', options: null }],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.put).toHaveBeenCalledWith('/v1/workspaces/42/survey/questions', {
      questions: [{ question_text: 'Why?', question_type: 'text', options: null }],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.survey.byWorkspace(42) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.detail(42) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.state(42) });
  });

  it('surfaces an error when the update fails', async () => {
    mockedApiClient.put.mockRejectedValueOnce(new Error('network error'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateWorkspaceSurveyQuestions(42), { wrapper });

    result.current.mutate({ questions: [] });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('usePublicSurvey', () => {
  it('fetches the public survey by token', async () => {
    const response = { surveyId: 'abc123', workspaceName: 'Acme', questions: survey.questions };
    mockedApiClient.get.mockResolvedValueOnce({ data: response });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePublicSurvey('abc123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/surveys/public/abc123');
    expect(result.current.data).toEqual(response);
  });

  it('stays idle when the token is empty', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePublicSurvey(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });
});

describe('useSubmitPublicSurvey', () => {
  it('posts the answers for the given survey token', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { status: 'ok', message: 'recorded', responseId: 11 },
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitPublicSurvey('abc123'), { wrapper });

    result.current.mutate({ answers: [{ questionId: 1, answer: 'Weekly' }] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.post).toHaveBeenCalledWith('/v1/surveys/public/abc123/submit', {
      answers: [{ questionId: 1, answer: 'Weekly' }],
    });
  });

  it('surfaces an error when the submission fails', async () => {
    mockedApiClient.post.mockRejectedValueOnce(new Error('network error'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitPublicSurvey('abc123'), { wrapper });

    result.current.mutate({ answers: [] });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useSurveyResponses', () => {
  it('fetches the collected responses', async () => {
    const response = { survey_id: 5, total_responses: 0, responses: [] };
    mockedApiClient.get.mockResolvedValueOnce({ data: response });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSurveyResponses(5), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/surveys/5/responses');
    expect(result.current.data).toEqual(response);
  });

  it('stays idle when the survey id is falsy', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSurveyResponses(0), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });
});

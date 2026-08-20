import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from '@/services/api';

import type {
  PublicSurveyDetailResponse,
  SubmitPublicSurveyRequest,
  SubmitPublicSurveyResponse,
  SurveyAnalysisResponse,
  SurveyResponse,
  SurveyResponsesListResponse,
  UpdateWorkspaceSurveyQuestionsRequest,
  UpdateWorkspaceSurveyQuestionsResponse,
} from '../types';

export const surveyService = {
  getSurveyByWorkspaceId: async (workspaceId: number): Promise<SurveyResponse> => {
    const { data } = await apiClient.get<SurveyResponse>(
      API_ENDPOINTS.SURVEY.GET_BY_WORKSPACE(workspaceId),
    );

    return data;
  },

  updateWorkspaceSurveyQuestions: async (
    workspaceId: number,
    payload: UpdateWorkspaceSurveyQuestionsRequest,
  ): Promise<UpdateWorkspaceSurveyQuestionsResponse> => {
    const { data } = await apiClient.put<UpdateWorkspaceSurveyQuestionsResponse>(
      API_ENDPOINTS.SURVEY.UPDATE_WORKSPACE_QUESTIONS(workspaceId),
      payload,
    );

    return data;
  },

  getPublicSurvey: async (token: string): Promise<PublicSurveyDetailResponse> => {
    const { data } = await apiClient.get<PublicSurveyDetailResponse>(
      API_ENDPOINTS.SURVEY.GET_PUBLIC(token),
    );

    return data;
  },

  submitPublicSurvey: async (
    token: string,
    payload: SubmitPublicSurveyRequest,
  ): Promise<SubmitPublicSurveyResponse> => {
    const { data } = await apiClient.post<SubmitPublicSurveyResponse>(
      API_ENDPOINTS.SURVEY.SUBMIT_PUBLIC(token),
      payload,
    );

    return data;
  },

  getSurveyResponses: async (surveyId: number): Promise<SurveyResponsesListResponse> => {
    const { data } = await apiClient.get<SurveyResponsesListResponse>(
      API_ENDPOINTS.SURVEY.RESPONSES(surveyId),
    );

    return data;
  },

  runSurveyAnalysis: async (surveyId: number): Promise<SurveyAnalysisResponse> => {
    const { data } = await apiClient.post<SurveyAnalysisResponse>(
      API_ENDPOINTS.SURVEY.ANALYZE(surveyId),
    );

    return data;
  },

  getSurveyAnalysis: async (surveyId: number): Promise<SurveyAnalysisResponse> => {
    const { data } = await apiClient.get<SurveyAnalysisResponse>(
      API_ENDPOINTS.SURVEY.GET_ANALYSIS(surveyId),
    );

    return data;
  },
};

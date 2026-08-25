import type {
  AdminSurveyListResponse,
  AdminSurveyResponseDetailResponse,
  AdminSurveyResponsesListResponse,
  AdminUsersResponse,
  AdminUserSurveySummaryResponse,
  GrowthGranularity,
  ListAdminSurveyResponsesParams,
  ListAdminSurveysParams,
  ListAdminUsersParams,
  SetProfileStatusPayload,
  UserGrowthResponse,
} from '@/types/admin.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

export const adminService = {
  async listUsers(params?: ListAdminUsersParams): Promise<AdminUsersResponse> {
    const { data } = await apiClient.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, {
      params,
    });
    return data;
  },

  async getUserGrowth(granularity: GrowthGranularity): Promise<UserGrowthResponse> {
    const { data } = await apiClient.get<UserGrowthResponse>(API_ENDPOINTS.ADMIN.USER_GROWTH, {
      params: { granularity },
    });
    return data;
  },

  async getUserSurveySummary(userId: number): Promise<AdminUserSurveySummaryResponse> {
    const { data } = await apiClient.get<AdminUserSurveySummaryResponse>(
      API_ENDPOINTS.ADMIN.USER_SURVEY_SUMMARY(userId),
    );
    return data;
  },

  async listSurveys(params?: ListAdminSurveysParams): Promise<AdminSurveyListResponse> {
    const { data } = await apiClient.get<AdminSurveyListResponse>(
      API_ENDPOINTS.ADMIN.USER_SURVEYS,
      {
        params,
      },
    );
    return data;
  },

  async listSurveyResponses(
    surveyId: number,
    params?: ListAdminSurveyResponsesParams,
  ): Promise<AdminSurveyResponsesListResponse> {
    const { data } = await apiClient.get<AdminSurveyResponsesListResponse>(
      API_ENDPOINTS.ADMIN.SURVEY_RESPONSES(surveyId),
      {
        params,
      },
    );
    return data;
  },

  async getSurveyResponseDetail(
    surveyId: number,
    responseId: number,
  ): Promise<AdminSurveyResponseDetailResponse> {
    const { data } = await apiClient.get<AdminSurveyResponseDetailResponse>(
      API_ENDPOINTS.ADMIN.SURVEY_RESPONSE_DETAIL(surveyId, responseId),
    );
    return data;
  },

  async setUserStatus(
    userId: number,
    payload: SetProfileStatusPayload,
  ): Promise<{ profile_status: string }> {
    const { data } = await apiClient.patch<{ profile_status: string }>(
      API_ENDPOINTS.ADMIN.SET_USER_STATUS(userId),
      payload,
    );
    return data;
  },
};

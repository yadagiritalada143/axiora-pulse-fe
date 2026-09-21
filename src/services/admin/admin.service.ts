import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

import type {
  AdminDashboardStatsResponse,
  AdminDeleteUserResponse,
  AdminPlan,
  AdminPlanListResponse,
  AdminSurveyListResponse,
  AdminSurveyResponseDetailResponse,
  AdminSurveyResponsesListResponse,
  AdminUsersResponse,
  AdminUserSurveySummaryResponse,
  CreatePlanWithRazorpayPayload,
  GrowthGranularity,
  ListAdminSurveyResponsesParams,
  ListAdminSurveysParams,
  ListAdminUsersParams,
  RevenueAnalyticsPeriod,
  RevenueResponse,
  SetProfileStatusPayload,
  UpdatePlanPayload,
  UserGrowthAnalyticsPeriod,
  UserGrowthAnalyticsResponse,
  UserGrowthResponse,
  UsersByPlanResponse,
} from '../../types/admin.types';

export const adminService = {
  listUsers: async (params?: ListAdminUsersParams): Promise<AdminUsersResponse> => {
    const response = await apiClient.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, {
      params,
    });
    return response.data;
  },

  getUserGrowth: async (granularity: GrowthGranularity): Promise<UserGrowthResponse> => {
    const response = await apiClient.get<UserGrowthResponse>(API_ENDPOINTS.ADMIN.USER_GROWTH, {
      params: { granularity },
    });
    return response.data;
  },

  listSurveys: async (params?: ListAdminSurveysParams): Promise<AdminSurveyListResponse> => {
    const response = await apiClient.get<AdminSurveyListResponse>(
      API_ENDPOINTS.ADMIN.USER_SURVEYS,
      { params },
    );
    return response.data;
  },

  listSurveyResponses: async (
    surveyId: number,
    params?: ListAdminSurveyResponsesParams,
  ): Promise<AdminSurveyResponsesListResponse> => {
    const response = await apiClient.get<AdminSurveyResponsesListResponse>(
      API_ENDPOINTS.ADMIN.SURVEY_RESPONSES(surveyId),
      { params },
    );
    return response.data;
  },

  getSurveyResponseDetail: async (
    surveyId: number,
    responseId: number,
  ): Promise<AdminSurveyResponseDetailResponse> => {
    const response = await apiClient.get<AdminSurveyResponseDetailResponse>(
      API_ENDPOINTS.ADMIN.SURVEY_RESPONSE_DETAIL(surveyId, responseId),
    );
    return response.data;
  },

  getUserSurveySummary: async (userId: number): Promise<AdminUserSurveySummaryResponse> => {
    const response = await apiClient.get<AdminUserSurveySummaryResponse>(
      API_ENDPOINTS.ADMIN.USER_SURVEY_SUMMARY(userId),
    );
    return response.data;
  },

  setUserStatus: async (
    userId: number,
    payload: SetProfileStatusPayload,
  ): Promise<AdminUserSurveySummaryResponse> => {
    const response = await apiClient.patch<AdminUserSurveySummaryResponse>(
      API_ENDPOINTS.ADMIN.SET_USER_STATUS(userId),
      payload,
    );
    return response.data;
  },

  deleteUser: async (userId: number): Promise<AdminDeleteUserResponse> => {
    const response = await apiClient.delete<AdminDeleteUserResponse>(
      API_ENDPOINTS.ADMIN.DELETE_USER(userId),
    );
    return response.data;
  },

  getDashboardStats: async (): Promise<AdminDashboardStatsResponse> => {
    const response = await apiClient.get<AdminDashboardStatsResponse>(
      API_ENDPOINTS.ADMIN.DASHBOARD_STATS,
    );
    return response.data;
  },

  getAnalyticsUserGrowth: async (
    period: UserGrowthAnalyticsPeriod = 'month',
  ): Promise<UserGrowthAnalyticsResponse> => {
    const response = await apiClient.get<UserGrowthAnalyticsResponse>(
      API_ENDPOINTS.ADMIN.ANALYTICS_USER_GROWTH,
      { params: { period } },
    );
    return response.data;
  },

  getAnalyticsUsersByPlan: async (): Promise<UsersByPlanResponse> => {
    const response = await apiClient.get<UsersByPlanResponse>(
      API_ENDPOINTS.ADMIN.ANALYTICS_USERS_BY_PLAN,
    );
    return response.data;
  },

  getAnalyticsRevenue: async (
    period: RevenueAnalyticsPeriod = 'month',
  ): Promise<RevenueResponse> => {
    const response = await apiClient.get<RevenueResponse>(API_ENDPOINTS.ADMIN.ANALYTICS_REVENUE, {
      params: { period },
    });
    return response.data;
  },

  listPlans: async (): Promise<AdminPlanListResponse> => {
    const response = await apiClient.get<AdminPlanListResponse>(API_ENDPOINTS.ADMIN.PLANS);
    return response.data;
  },

  getPlan: async (planId: number): Promise<AdminPlan> => {
    const response = await apiClient.get<AdminPlan>(API_ENDPOINTS.ADMIN.PLAN_DETAIL(planId));
    return response.data;
  },

  createPlanWithRazorpay: async (payload: CreatePlanWithRazorpayPayload): Promise<AdminPlan> => {
    const response = await apiClient.post<AdminPlan>(
      API_ENDPOINTS.ADMIN.PLAN_CREATE_WITH_RAZORPAY,
      payload,
    );
    return response.data;
  },

  updatePlan: async (planId: number, payload: UpdatePlanPayload): Promise<AdminPlan> => {
    const response = await apiClient.put<AdminPlan>(
      API_ENDPOINTS.ADMIN.PLAN_UPDATE(planId),
      payload,
    );
    return response.data;
  },
};

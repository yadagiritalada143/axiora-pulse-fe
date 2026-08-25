export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
  created_at: string;
  workspace_count: number;
}

export interface AdminUsersPagination {
  total: number;
  limit: number;
  offset: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: AdminUsersPagination;
}

export interface ListAdminUsersParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export type GrowthGranularity = 'month' | 'year';

export interface UserGrowthPoint {
  /** "YYYY-MM" for month granularity, "YYYY" for year granularity. */
  period: string;
  count: number;
}

export interface UserGrowthResponse {
  granularity: GrowthGranularity;
  series: UserGrowthPoint[];
}

export interface AdminSurvey {
  id: number;
  user_id: number;
  owner_username: string;
  workspace_id: number;
  workspace_name: string;
  workspace_description: string | null;
  survey_link: string | null;
  status: 'Active' | 'Closed';
  question_count: number;
  responses_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminSurveyPagination {
  total: number;
  limit: number;
  offset: number;
}

export interface AdminSurveyListResponse {
  surveys: AdminSurvey[];
  pagination: AdminSurveyPagination;
}

export interface ListAdminSurveysParams {
  limit?: number;
  offset?: number;
  search?: string;
  user_id?: number;
}

export interface AdminUserSurveySummaryResponse {
  user_id: number;
  name: string;
  email: string;
  status: string;
  joined_on: string;
  surveys_created: number;
  total_responses: number;
}

export interface AdminSurveyAnswerPreviewItem {
  question: string;
  answer: unknown;
}

export interface AdminSurveyResponseItem {
  id: number;
  response_code: string;
  survey_id: number;
  respondent_email: string | null;
  answers: Record<string, unknown>[];
  answers_preview: AdminSurveyAnswerPreviewItem[];
  submitted_at: string;
  status: 'Completed';
  source: 'Web';
}

export interface AdminSurveyResponsePagination {
  total: number;
  limit: number;
  offset: number;
}

export interface AdminSurveyResponsesListResponse {
  survey_id: number;
  total_responses: number;
  responses: AdminSurveyResponseItem[];
  pagination: AdminSurveyResponsePagination;
}

export interface ListAdminSurveyResponsesParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface AdminSurveyResponseDetailResponse extends AdminSurveyResponseItem {
  user_id: number;
  owner_username: string;
  workspace_id: number;
  workspace_name: string;
  workspace_description: string | null;
}

export interface SetProfileStatusPayload {
  profile_status: 'Active' | 'Inactive' | 'Suspended';
}

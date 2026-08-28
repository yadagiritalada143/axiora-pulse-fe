import type { AdminUsersResponse, UserGrowthResponse } from '@/types/admin.types';
import { API_ENDPOINTS } from '@constants/api';
import { adminService } from '@services/admin/admin.service';
import { apiClient } from '@services/api';

jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('listUsers calls GET API_ENDPOINTS.ADMIN.USERS with query params and returns data', async () => {
    const mockResponse: AdminUsersResponse = {
      users: [
        {
          id: 1,
          username: 'john@example.com',
          display_name: 'John Doe',
          role: 'user',
          created_at: '2026-07-30T09:39:44.020Z',
          workspace_count: 2,
        },
      ],
      pagination: {
        total: 1,
        limit: 25,
        offset: 0,
      },
    };

    mockedApiClient.get.mockResolvedValue({ data: mockResponse });

    const params = { limit: 25, offset: 0, search: 'john' };
    const result = await adminService.listUsers(params);

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.USERS, {
      params,
    });
    expect(result).toEqual(mockResponse);
  });

  it('getUserGrowth calls GET API_ENDPOINTS.ADMIN.USER_GROWTH with granularity and returns data', async () => {
    const mockResponse: UserGrowthResponse = {
      granularity: 'month',
      series: [
        { period: '2026-06', count: 3 },
        { period: '2026-07', count: 0 },
        { period: '2026-08', count: 5 },
      ],
    };

    mockedApiClient.get.mockResolvedValue({ data: mockResponse });

    const result = await adminService.getUserGrowth('month');

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.USER_GROWTH, {
      params: { granularity: 'month' },
    });
    expect(result).toEqual(mockResponse);
  });

  it('getUserSurveySummary calls GET API_ENDPOINTS.ADMIN.USER_SURVEY_SUMMARY and returns data', async () => {
    const mockSummary = {
      user_id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'Active',
      joined_on: '2026-07-30T09:39:44.020Z',
      surveys_created: 4,
      total_responses: 120,
    };

    mockedApiClient.get.mockResolvedValue({ data: mockSummary });

    const result = await adminService.getUserSurveySummary(1);

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.USER_SURVEY_SUMMARY(1));
    expect(result).toEqual(mockSummary);
  });

  it('listSurveys calls GET API_ENDPOINTS.ADMIN.USER_SURVEYS and returns data', async () => {
    const mockSurveys = {
      surveys: [],
      pagination: { total: 0, limit: 25, offset: 0 },
    };

    mockedApiClient.get.mockResolvedValue({ data: mockSurveys });

    const params = { user_id: 1, limit: 10, offset: 0 };
    const result = await adminService.listSurveys(params);

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.USER_SURVEYS, {
      params,
    });
    expect(result).toEqual(mockSurveys);
  });

  it('listSurveyResponses calls GET API_ENDPOINTS.ADMIN.SURVEY_RESPONSES and returns data', async () => {
    const mockResponses = {
      survey_id: 12,
      total_responses: 0,
      responses: [],
      pagination: { total: 0, limit: 25, offset: 0 },
    };

    mockedApiClient.get.mockResolvedValue({ data: mockResponses });

    const result = await adminService.listSurveyResponses(12);

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.SURVEY_RESPONSES(12), {
      params: undefined,
    });
    expect(result).toEqual(mockResponses);
  });

  it('getSurveyResponseDetail calls GET API_ENDPOINTS.ADMIN.SURVEY_RESPONSE_DETAIL and returns data', async () => {
    const mockDetail = {
      id: 5,
      response_code: 'RESP-001',
      survey_id: 12,
      respondent_email: 'respondent@test.com',
      answers: [],
      answers_preview: [],
      submitted_at: '2026-08-01T00:00:00Z',
      status: 'Completed',
      source: 'Web',
      user_id: 1,
      owner_username: 'john',
      workspace_id: 2,
      workspace_name: 'Product Idea',
      workspace_description: 'Test workspace',
    };

    mockedApiClient.get.mockResolvedValue({ data: mockDetail });

    const result = await adminService.getSurveyResponseDetail(12, 5);

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.SURVEY_RESPONSE_DETAIL(12, 5),
    );
    expect(result).toEqual(mockDetail);
  });

  it('getDashboardStats calls GET API_ENDPOINTS.ADMIN.DASHBOARD_STATS and returns data', async () => {
    const mockStats = {
      total_users: 100,
      paid_users: 40,
      non_paid_users: 60,
      active_subscriptions: 35,
      total_workspaces: 80,
      active_workspaces: 70,
      archived_workspaces: 10,
      growth: {
        total_users: 12.5,
        paid_users: 8.3,
        non_paid_users: 15.7,
        active_subscriptions: 10.2,
        total_workspaces: 5.0,
        active_workspaces: 4.5,
        archived_workspaces: 1.2,
      },
    };

    mockedApiClient.get.mockResolvedValue({ data: mockStats });

    const result = await adminService.getDashboardStats();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
    expect(result).toEqual(mockStats);
  });

  it('getAnalyticsUserGrowth calls GET API_ENDPOINTS.ADMIN.ANALYTICS_USER_GROWTH with period and returns data', async () => {
    const mockGrowth = {
      period: 'month' as const,
      series: [{ period: '2026-08-01', count: 10 }],
    };

    mockedApiClient.get.mockResolvedValue({ data: mockGrowth });

    const result = await adminService.getAnalyticsUserGrowth('month');

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.ANALYTICS_USER_GROWTH, {
      params: { period: 'month' },
    });
    expect(result).toEqual(mockGrowth);
  });

  it('getAnalyticsUsersByPlan calls GET API_ENDPOINTS.ADMIN.ANALYTICS_USERS_BY_PLAN and returns data', async () => {
    const mockPlanData = {
      total_users: 100,
      plans: [{ plan: 'pro', user_count: 40, percentage: 40 }],
    };

    mockedApiClient.get.mockResolvedValue({ data: mockPlanData });

    const result = await adminService.getAnalyticsUsersByPlan();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.ANALYTICS_USERS_BY_PLAN);
    expect(result).toEqual(mockPlanData);
  });

  it('getAnalyticsRevenue calls GET API_ENDPOINTS.ADMIN.ANALYTICS_REVENUE with period and returns data', async () => {
    const mockRevenue = {
      period: 'month' as const,
      total_amount: 5000,
      series: [{ period: '2026-08-01', amount: 5000 }],
    };

    mockedApiClient.get.mockResolvedValue({ data: mockRevenue });

    const result = await adminService.getAnalyticsRevenue('month');

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ADMIN.ANALYTICS_REVENUE, {
      params: { period: 'month' },
    });
    expect(result).toEqual(mockRevenue);
  });
});

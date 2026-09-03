import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useAdminAnalyticsRevenue } from '@features/admin/hooks/useAdminAnalyticsRevenue';
import { useAdminAnalyticsUserGrowth } from '@features/admin/hooks/useAdminAnalyticsUserGrowth';
import { useAdminAnalyticsUsersByPlan } from '@features/admin/hooks/useAdminAnalyticsUsersByPlan';
import { useAdminDashboardStats } from '@features/admin/hooks/useAdminDashboardStats';
import { useAdminSetUserStatus } from '@features/admin/hooks/useAdminSetUserStatus';
import { useAdminSurveyResponseDetail } from '@features/admin/hooks/useAdminSurveyResponseDetail';
import { useAdminSurveyResponses } from '@features/admin/hooks/useAdminSurveyResponses';
import { useAdminSurveys } from '@features/admin/hooks/useAdminSurveys';
import { useAdminUserSurveySummary } from '@features/admin/hooks/useAdminUserSurveySummary';
import type { RevenueResponse, UserGrowthAnalyticsResponse } from '@features/admin/types';
import { adminService } from '@services/admin/admin.service';

jest.mock('@services/admin/admin.service', () => ({
  adminService: {
    getDashboardStats: jest.fn(),
    getAnalyticsUserGrowth: jest.fn(),
    getAnalyticsUsersByPlan: jest.fn(),
    getAnalyticsRevenue: jest.fn(),
    getUserSurveySummary: jest.fn(),
    listSurveys: jest.fn(),
    listSurveyResponses: jest.fn(),
    getSurveyResponseDetail: jest.fn(),
    setUserStatus: jest.fn(),
    listUsers: jest.fn(),
    getUserGrowth: jest.fn(),
    getInteractiveQuestions: jest.fn(),
    listAdminSurveyResponses: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedAdminService = jest.mocked(adminService);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAdminDashboardStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches dashboard stats', async () => {
    const mockData = {
      total_users: 10,
      paid_users: 5,
      non_paid_users: 5,
      active_subscriptions: 5,
      total_workspaces: 20,
      active_workspaces: 15,
      archived_workspaces: 5,
      growth: {
        total_users: 10,
        paid_users: 5,
        non_paid_users: 5,
        active_subscriptions: 5,
        total_workspaces: 20,
        active_workspaces: 15,
        archived_workspaces: 5,
      },
    };
    mockedAdminService.getDashboardStats.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminDashboardStats(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getDashboardStats).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useAdminAnalyticsUserGrowth', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches user growth analytics with default period', async () => {
    const mockData: UserGrowthAnalyticsResponse = {
      period: 'month',
      series: [{ period: '2026-08', count: 5 }],
    };
    mockedAdminService.getAnalyticsUserGrowth.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminAnalyticsUserGrowth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getAnalyticsUserGrowth).toHaveBeenCalledWith('month');
    expect(result.current.data).toEqual(mockData);
  });

  it('passes period through to the service', async () => {
    mockedAdminService.getAnalyticsUserGrowth.mockResolvedValue({
      period: 'week',
      series: [],
    });

    const { result } = renderHook(() => useAdminAnalyticsUserGrowth('week'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getAnalyticsUserGrowth).toHaveBeenCalledWith('week');
  });
});

describe('useAdminAnalyticsUsersByPlan', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches users by plan', async () => {
    const mockData = {
      total_users: 10,
      plans: [{ plan: 'pro', user_count: 6, percentage: 60 }],
    };
    mockedAdminService.getAnalyticsUsersByPlan.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminAnalyticsUsersByPlan(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getAnalyticsUsersByPlan).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useAdminAnalyticsRevenue', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches revenue analytics with default period', async () => {
    const mockData: RevenueResponse = {
      period: 'month',
      total_amount: 1000,
      series: [{ period: '2026-08', amount: 1000 }],
    };
    mockedAdminService.getAnalyticsRevenue.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminAnalyticsRevenue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getAnalyticsRevenue).toHaveBeenCalledWith('month');
    expect(result.current.data).toEqual(mockData);
  });

  it('passes period through to the service', async () => {
    mockedAdminService.getAnalyticsRevenue.mockResolvedValue({
      period: 'year',
      total_amount: 0,
      series: [],
    });

    const { result } = renderHook(() => useAdminAnalyticsRevenue('year'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getAnalyticsRevenue).toHaveBeenCalledWith('year');
  });
});

describe('useAdminUserSurveySummary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches user survey summary for a valid user id', async () => {
    const mockData = {
      user_id: 1,
      name: 'John',
      email: 'john@example.com',
      status: 'Active',
      joined_on: '2026-01-01',
      surveys_created: 3,
      total_responses: 10,
    };
    mockedAdminService.getUserSurveySummary.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminUserSurveySummary(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getUserSurveySummary).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual(mockData);
  });

  it('does not fetch when user id is invalid', () => {
    const { result } = renderHook(() => useAdminUserSurveySummary(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAdminService.getUserSurveySummary).not.toHaveBeenCalled();
  });
});

describe('useAdminSurveys', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches survey list with params', async () => {
    const mockData = {
      surveys: [],
      pagination: { total: 0, limit: 10, offset: 0 },
    };
    mockedAdminService.listSurveys.mockResolvedValue(mockData);

    const params = { limit: 10, offset: 0, user_id: 1 };
    const { result } = renderHook(() => useAdminSurveys(params), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.listSurveys).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useAdminSurveyResponses', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches survey responses for a valid survey id', async () => {
    const mockData = {
      survey_id: 1,
      total_responses: 0,
      responses: [],
      pagination: { total: 0, limit: 10, offset: 0 },
    };
    mockedAdminService.listSurveyResponses.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminSurveyResponses(1, { limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.listSurveyResponses).toHaveBeenCalledWith(1, { limit: 10 });
    expect(result.current.data).toEqual(mockData);
  });

  it('does not fetch when survey id is falsy', () => {
    const { result } = renderHook(() => useAdminSurveyResponses(0), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAdminService.listSurveyResponses).not.toHaveBeenCalled();
  });
});

describe('useAdminSurveyResponseDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches survey response detail for valid ids', async () => {
    const mockData = {
      id: 5,
      response_code: 'RESP-1',
      survey_id: 1,
      user_id: 1,
      owner_username: 'owner',
      workspace_id: 1,
      workspace_name: 'WS',
      workspace_description: null,
      respondent_email: 'a@b.com',
      answers: [] as Record<string, unknown>[],
      answers_preview: [] as { question: string; answer: unknown }[],
      submitted_at: '2026-01-01',
      status: 'Completed' as const,
      source: 'Web' as const,
    };
    mockedAdminService.getSurveyResponseDetail.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminSurveyResponseDetail(1, 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.getSurveyResponseDetail).toHaveBeenCalledWith(1, 5);
    expect(result.current.data).toEqual(mockData);
  });

  it('does not fetch when ids are invalid', () => {
    const { result } = renderHook(() => useAdminSurveyResponseDetail(0, 0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAdminService.getSurveyResponseDetail).not.toHaveBeenCalled();
  });
});

describe('useAdminSetUserStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls setUserStatus and shows success toast on success', async () => {
    const mockSummary = {
      user_id: 1,
      name: 'John',
      email: 'j@e.com',
      status: 'Inactive',
      joined_on: '2026-01-01',
      surveys_created: 1,
      total_responses: 2,
    };
    mockedAdminService.setUserStatus.mockResolvedValue(mockSummary);

    const { result } = renderHook(() => useAdminSetUserStatus(), { wrapper: createWrapper() });

    result.current.mutate({ userId: 1, payload: { profile_status: 'Active' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAdminService.setUserStatus).toHaveBeenCalledWith(1, {
      profile_status: 'Active',
    });
    expect(toast.success).toHaveBeenCalledWith('User status updated successfully.');
  });

  it('shows error toast when the mutation fails', async () => {
    mockedAdminService.setUserStatus.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useAdminSetUserStatus(), { wrapper: createWrapper() });

    result.current.mutate({ userId: 1, payload: { profile_status: 'Suspended' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('boom');
  });
});

import type { AdminUsersResponse } from '@/types/admin.types';
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
});

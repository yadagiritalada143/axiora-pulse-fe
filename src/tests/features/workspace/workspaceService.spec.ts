import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from '@/services/api';
import { workspaceService } from '@features/workspace/api/workspace.service';

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const {
  get: mockedGet,
  post: mockedPost,
  delete: mockedDelete,
} = apiClient as unknown as { get: jest.Mock; post: jest.Mock; delete: jest.Mock };

describe('workspaceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getWorkspaces requests the list endpoint and returns data', async () => {
    const data = { total: 2, workspaces: [] };
    mockedGet.mockResolvedValue({ data });

    const result = await workspaceService.getWorkspaces();

    expect(mockedGet).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.LIST);
    expect(result).toBe(data);
  });

  it('getWorkspaceById requests the detail endpoint and returns data', async () => {
    const data = { id: 5, name: 'Alpha' };
    mockedGet.mockResolvedValue({ data });

    const result = await workspaceService.getWorkspaceById(5);

    expect(mockedGet).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.DETAIL(5));
    expect(result).toBe(data);
  });

  it('createWorkspace posts the payload and returns data', async () => {
    const payload = { name: 'Alpha', description: 'desc' };
    const data = { id: 1, name: 'Alpha' };
    mockedPost.mockResolvedValue({ data });

    const result = await workspaceService.createWorkspace(payload);

    expect(mockedPost).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.CREATE, payload);
    expect(result).toBe(data);
  });

  it('deleteWorkspace calls the delete endpoint and returns data', async () => {
    const data = { status: 'success', message: 'deleted', workspace_id: 3 };
    mockedDelete.mockResolvedValue({ data });

    const result = await workspaceService.deleteWorkspace(3);

    expect(mockedDelete).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.DELETE(3));
    expect(result).toBe(data);
  });
});

// Mocked apiClient methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import { API_ENDPOINTS } from '@/constants/api';
import { workspaceService } from '@/features/workspace/api/workspace.service';
import type {
  CreateWorkspaceRequest,
  DeleteWorkspaceResponse,
  GetWorkspacesResponse,
  Workspace,
} from '@/features/workspace/types';
import { apiClient } from '@/services/api';

// See auth.service.test.ts for why this mocks the barrel directly rather than spreading
// `jest.requireActual` - the real client.ts pulls in `import.meta.env`, which Jest can't evaluate.
jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const workspace: Workspace = {
  id: 1,
  user_id: 7,
  name: 'My Workspace',
  description: 'A test workspace',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('workspaceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getWorkspaces fetches the list and returns the raw response body', async () => {
    const responseBody: GetWorkspacesResponse = { total: 1, workspaces: [workspace] };
    mockedApiClient.get.mockResolvedValue({ data: responseBody });

    const result = await workspaceService.getWorkspaces();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.LIST);
    expect(result).toBe(responseBody);
  });

  it('getWorkspaceById fetches a single workspace by id', async () => {
    mockedApiClient.get.mockResolvedValue({ data: workspace });

    const result = await workspaceService.getWorkspaceById(1);

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.DETAIL(1));
    expect(result).toBe(workspace);
  });

  it('createWorkspace posts the payload and returns the created workspace', async () => {
    const payload: CreateWorkspaceRequest = { name: 'My Workspace', description: 'A test' };
    mockedApiClient.post.mockResolvedValue({ data: workspace });

    const result = await workspaceService.createWorkspace(payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.CREATE, payload);
    expect(result).toBe(workspace);
  });

  it('deleteWorkspace deletes by id and returns the confirmation body', async () => {
    const responseBody: DeleteWorkspaceResponse = {
      status: 'success',
      message: 'Deleted',
      workspace_id: 1,
    };
    mockedApiClient.delete.mockResolvedValue({ data: responseBody });

    const result = await workspaceService.deleteWorkspace(1);

    expect(mockedApiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.DELETE(1));
    expect(result).toBe(responseBody);
  });
});

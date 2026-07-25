import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from '@/services/api';

import type {
  CreateWorkspaceRequest,
  DeleteWorkspaceResponse,
  GetWorkspacesResponse,
  Workspace,
} from '../types';

export const workspaceService = {
  getWorkspaces: async (): Promise<GetWorkspacesResponse> => {
    const { data } = await apiClient.get<GetWorkspacesResponse>(API_ENDPOINTS.WORKSPACE.LIST);

    return data;
  },

  getWorkspaceById: async (id: number): Promise<Workspace> => {
    const { data } = await apiClient.get<Workspace>(API_ENDPOINTS.WORKSPACE.DETAIL(id));

    return data;
  },

  createWorkspace: async (payload: CreateWorkspaceRequest): Promise<Workspace> => {
    const { data } = await apiClient.post<Workspace>(API_ENDPOINTS.WORKSPACE.CREATE, payload);

    return data;
  },

  deleteWorkspace: async (id: number): Promise<DeleteWorkspaceResponse> => {
    const { data } = await apiClient.delete<DeleteWorkspaceResponse>(
      API_ENDPOINTS.WORKSPACE.DELETE(id),
    );

    return data;
  },
};

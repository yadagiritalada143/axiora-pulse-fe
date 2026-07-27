import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from '@/services/api';

import type {
  CreateWorkspaceRequest,
  DeleteWorkspaceResponse,
  ExportWorkspaceReportRequest,
  ExportWorkspaceReportResult,
  GetWorkspacesResponse,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceChatRequest,
  WorkspaceChatResponse,
  WorkspaceStateResponse,
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

  updateWorkspace: async ({
    id,
    payload,
  }: {
    id: number;
    payload: UpdateWorkspaceRequest;
  }): Promise<Workspace> => {
    const { data } = await apiClient.put<Workspace>(API_ENDPOINTS.WORKSPACE.UPDATE(id), payload);

    return data;
  },

  deleteWorkspace: async (id: number): Promise<DeleteWorkspaceResponse> => {
    const { data } = await apiClient.delete<DeleteWorkspaceResponse>(
      API_ENDPOINTS.WORKSPACE.DELETE(id),
    );

    return data;
  },

  chatWithMentor: async (
    workspaceId: number,
    payload: WorkspaceChatRequest,
  ): Promise<WorkspaceChatResponse> => {
    // The mentor reply involves 1-2 sequential LLM calls (extraction + reply), and can trigger a
    // full multi-agent validation run — well past the default request timeout.
    const { data } = await apiClient.post<WorkspaceChatResponse>(
      API_ENDPOINTS.WORKSPACE.CHAT(workspaceId),
      payload,
      { timeout: 120_000 },
    );

    return data;
  },

  getWorkspaceState: async (workspaceId: number): Promise<WorkspaceStateResponse> => {
    const { data } = await apiClient.get<WorkspaceStateResponse>(
      API_ENDPOINTS.WORKSPACE.STATE(workspaceId),
    );

    return data;
  },

  resetMentor: async (workspaceId: number): Promise<WorkspaceStateResponse> => {
    const { data } = await apiClient.post<WorkspaceStateResponse>(
      API_ENDPOINTS.WORKSPACE.RESET(workspaceId),
    );

    return data;
  },

  exportReport: async (
    workspaceId: number,
    payload: ExportWorkspaceReportRequest,
  ): Promise<ExportWorkspaceReportResult> => {
    const response = await apiClient.post<Blob>(
      API_ENDPOINTS.WORKSPACE.REPORT_EXPORT(workspaceId),
      payload,
      { responseType: 'blob', timeout: 60_000 },
    );

    const disposition = response.headers['content-disposition'] as string | undefined;
    const filenameMatch = disposition?.match(/filename="?([^";]+)"?/);
    const filename = filenameMatch?.[1] ?? `${payload.agent_name}-report.${payload.format}`;

    return { blob: response.data, filename };
  },
};

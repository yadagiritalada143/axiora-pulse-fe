export interface Workspace {
  id: number;
  user_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface GetWorkspacesResponse {
  total: number;
  workspaces: Workspace[];
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface DeleteWorkspaceResponse {
  status: string;
  message: string;
  workspace_id: number;
}

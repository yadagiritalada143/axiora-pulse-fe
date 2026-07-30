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

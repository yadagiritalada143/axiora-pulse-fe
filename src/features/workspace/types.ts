import type { OrchestrationResult } from '@/types/orchestration.types';

export type WorkspaceMentorStateValue =
  'GATHERING_INFO' | 'READY_TO_VALIDATE' | 'VALIDATING' | 'VALIDATED';

export interface Workspace {
  id: number;
  user_id: number;
  name: string;
  description: string;
  state?: WorkspaceMentorStateValue;
  is_delete?: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceIdea {
  idea_title: string | null;
  idea_description: string | null;
  problem_statement: string | null;
  industry: string;
  founder_validation_goal: string;
  geography: string;
}

export interface WorkspaceConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface WorkspaceChatRequest {
  message: string;
}

export interface WorkspaceChatResponse {
  reply: string;
  workspace_id: number;
  state: WorkspaceMentorStateValue;
  idea: WorkspaceIdea;
  validation_result: OrchestrationResult | null;
}

export interface WorkspaceStateResponse {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  state: WorkspaceMentorStateValue;
  idea: WorkspaceIdea;
  conversation_history: WorkspaceConversationMessage[];
  validation_result: OrchestrationResult | null;
  created_at: string;
  updated_at: string;
}

export type WorkspaceReportAgent =
  'idea_validation_agent' | 'market_research_agent' | 'survey_intelligence_agent' | 'full';
export type WorkspaceReportFormat = 'pdf' | 'doc';

export interface ExportWorkspaceReportRequest {
  agent_name: WorkspaceReportAgent;
  format: WorkspaceReportFormat;
}

export interface ExportWorkspaceReportResult {
  blob: Blob;
  filename: string;
}

export interface GetWorkspacesResponse {
  total: number;
  workspaces: Workspace[];
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
  description: string;
}

export interface DeleteWorkspaceResponse {
  status: string;
  message: string;
  workspace_id: number;
}

export interface RestoreWorkspaceResponse {
  status: string;
  message: string;
  workspace_id: number;
  is_delete: boolean;
}

export interface WorkspaceAttachmentResponse {
  id: number;
  user_id: number;
  workspace_id: number;
  file_name: string;
  file_type: string;
  mime_type: string;
  s3_key: string;
  file_url: string;
  file_size_bytes: number | null;
  created_at: string;
  updated_at: string;
}

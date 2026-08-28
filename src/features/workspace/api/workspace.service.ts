import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from '@/services/api';
import type { MessageAttachment } from '@/types/chat.types';

import type {
  CreateWorkspaceRequest,
  DeleteWorkspaceResponse,
  ExportWorkspaceReportRequest,
  ExportWorkspaceReportResult,
  GetWorkspacesResponse,
  RestoreWorkspaceResponse,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceAttachmentListResponse,
  WorkspaceAttachmentResponse,
  DeleteAttachmentResponse,
  WorkspaceChatRequest,
  WorkspaceChatResponse,
  WorkspaceStateResponse,
} from '../types';

async function processReportBlob(rawBlob: Blob, format: string): Promise<Blob> {
  const buffer = await rawBlob.arrayBuffer();
  const text = new TextDecoder().decode(buffer.slice(0, 500));

  if (text.startsWith('%PDF')) {
    return new Blob([buffer], { type: 'application/pdf' });
  }

  if (text.trim().startsWith('JVBERi')) {
    const base64Str = new TextDecoder().decode(buffer).trim();
    const binaryStr = atob(base64Str);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([bytes.buffer], { type: 'application/pdf' });
  }

  if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
    const fullText = new TextDecoder().decode(buffer);
    try {
      const parsed = JSON.parse(fullText) as Record<string, unknown>;

      if (parsed.detail || parsed.message || parsed.error) {
        const errorMsg = String(parsed.detail ?? parsed.message ?? parsed.error);
        throw new Error(errorMsg);
      }

      const possibleBase64 =
        parsed.data ?? parsed.pdf ?? parsed.file ?? parsed.content ?? parsed.report;
      if (typeof possibleBase64 === 'string') {
        const cleanBase64 = possibleBase64.replace(/^data:application\/pdf;base64,/, '').trim();
        if (cleanBase64.startsWith('JVBERi')) {
          const binaryStr = atob(cleanBase64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          return new Blob([bytes.buffer], { type: 'application/pdf' });
        }
      }
    } catch (err) {
      if (err instanceof Error && !err.message.startsWith('Unexpected token')) {
        throw err;
      }
    }
  }

  const fallbackMime =
    format === 'pdf'
      ? 'application/pdf'
      : format === 'doc'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/octet-stream';

  return new Blob([buffer], { type: fallbackMime });
}

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

  getArchivedWorkspaces: async (): Promise<GetWorkspacesResponse> => {
    const { data } = await apiClient.get<GetWorkspacesResponse>(
      API_ENDPOINTS.WORKSPACE.ARCHIVED_LIST,
    );

    return data;
  },

  restoreWorkspace: async (id: number): Promise<RestoreWorkspaceResponse> => {
    const { data } = await apiClient.patch<RestoreWorkspaceResponse>(
      API_ENDPOINTS.WORKSPACE.RESTORE(id),
    );

    return data;
  },

  permanentDeleteWorkspace: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.WORKSPACE.PERMANENT_DELETE(id));
  },

  getAttachments: async (workspaceId: number): Promise<WorkspaceAttachmentListResponse> => {
    const { data } = await apiClient.get<WorkspaceAttachmentListResponse>(
      API_ENDPOINTS.WORKSPACE.ATTACHMENTS(workspaceId),
    );

    return data;
  },

  deleteAttachment: async (
    workspaceId: number,
    attachmentId: number,
  ): Promise<DeleteAttachmentResponse> => {
    const { data } = await apiClient.delete<DeleteAttachmentResponse>(
      API_ENDPOINTS.WORKSPACE.ATTACHMENT_DETAIL(workspaceId, attachmentId),
    );

    return data;
  },

  uploadAttachment: async (workspaceId: number, file: File): Promise<MessageAttachment> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<WorkspaceAttachmentResponse>(
      API_ENDPOINTS.WORKSPACE.ATTACHMENTS(workspaceId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return {
      id: String(data.id),
      name: data.file_name,
      url: data.file_url,
      mimeType: data.mime_type,
      sizeBytes: data.file_size_bytes ?? 0,
    };
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

    const rawBlob = response.data;

    const disposition = response.headers['content-disposition'] as string | undefined;
    let filename = '';
    if (disposition) {
      const filenameStarRegex = /filename\*=UTF-8''([^;]+)/i;
      const filenameStarMatch = filenameStarRegex.exec(disposition);
      if (filenameStarMatch?.[1]) {
        filename = decodeURIComponent(filenameStarMatch[1]);
      } else {
        const filenameRegex = /filename="?([^";]+)"?/i;
        const filenameMatch = filenameRegex.exec(disposition);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }
    }

    if (!filename) {
      const ext =
        payload.format === 'pdf' ? 'pdf' : payload.format === 'doc' ? 'docx' : payload.format;
      filename = `idea-validation-report.${ext}`;
    } else if (payload.format === 'pdf' && !filename.toLowerCase().endsWith('.pdf')) {
      filename = `${filename}.pdf`;
    }

    const processedBlob = await processReportBlob(rawBlob, payload.format);

    return { blob: processedBlob, filename };
  },

  downloadCertificate: async (workspaceId: number): Promise<ExportWorkspaceReportResult> => {
    const response = await apiClient.get<Blob>(API_ENDPOINTS.WORKSPACE.CERTIFICATE(workspaceId), {
      responseType: 'blob',
      timeout: 60_000,
    });

    const rawBlob = response.data;

    const disposition = response.headers['content-disposition'] as string | undefined;
    let filename = '';
    if (disposition) {
      const filenameStarRegex = /filename\*=UTF-8''([^;]+)/i;
      const filenameStarMatch = filenameStarRegex.exec(disposition);
      if (filenameStarMatch?.[1]) {
        filename = decodeURIComponent(filenameStarMatch[1]);
      } else {
        const filenameRegex = /filename="?([^";]+)"?/i;
        const filenameMatch = filenameRegex.exec(disposition);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }
    }

    if (!filename) {
      filename = `idea_validation_certificate_${workspaceId}.pdf`;
    } else if (!filename.toLowerCase().endsWith('.pdf')) {
      filename = `${filename}.pdf`;
    }

    const processedBlob = await processReportBlob(rawBlob, 'pdf');

    return { blob: processedBlob, filename };
  },
};

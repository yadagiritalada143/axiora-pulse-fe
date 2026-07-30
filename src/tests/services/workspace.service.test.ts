// Mocked apiClient methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import { API_ENDPOINTS } from '@/constants/api';
import { workspaceService } from '@/features/workspace/api/workspace.service';
import type {
  CreateWorkspaceRequest,
  DeleteWorkspaceResponse,
  ExportWorkspaceReportRequest,
  GetWorkspacesResponse,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceChatRequest,
  WorkspaceChatResponse,
  WorkspaceStateResponse,
} from '@/features/workspace/types';
import { apiClient } from '@/services/api';

// See auth.service.test.ts for why this mocks the barrel directly rather than spreading
// `jest.requireActual` - the real client.ts pulls in `import.meta.env`, which Jest can't evaluate.
jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// jsdom's `Blob` doesn't implement `arrayBuffer()` (unlike browsers/Node), but
// `workspaceService.exportReport` relies on it via `processReportBlob`. Polyfill it with
// `FileReader`, which jsdom does implement, so the blob-sniffing logic can be exercised here.
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error(reader.error?.message ?? 'FileReader error'));
      reader.readAsArrayBuffer(this);
    });
  };
}

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

  it('updateWorkspace puts the payload and returns the updated workspace', async () => {
    const payload: UpdateWorkspaceRequest = { name: 'Renamed', description: 'Updated' };
    mockedApiClient.put.mockResolvedValue({ data: workspace });

    const result = await workspaceService.updateWorkspace({ id: 1, payload });

    expect(mockedApiClient.put).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.UPDATE(1), payload);
    expect(result).toBe(workspace);
  });

  it('chatWithMentor posts the message with an extended timeout', async () => {
    const payload: WorkspaceChatRequest = { message: 'Hello mentor' };
    const responseBody: WorkspaceChatResponse = {
      reply: 'Hi there',
      workspace_id: 1,
      state: 'GATHERING_INFO',
      idea: {
        idea_title: null,
        idea_description: null,
        problem_statement: null,
        industry: '',
        founder_validation_goal: '',
        geography: '',
      },
      validation_result: null,
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await workspaceService.chatWithMentor(1, payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.CHAT(1), payload, {
      timeout: 120_000,
    });
    expect(result).toBe(responseBody);
  });

  it('getWorkspaceState fetches the current mentor state', async () => {
    const responseBody: WorkspaceStateResponse = {
      id: 1,
      user_id: 7,
      name: 'My Workspace',
      description: 'A test workspace',
      state: 'GATHERING_INFO',
      idea: {
        idea_title: null,
        idea_description: null,
        problem_statement: null,
        industry: '',
        founder_validation_goal: '',
        geography: '',
      },
      conversation_history: [],
      validation_result: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    mockedApiClient.get.mockResolvedValue({ data: responseBody });

    const result = await workspaceService.getWorkspaceState(1);

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.STATE(1));
    expect(result).toBe(responseBody);
  });

  it('resetMentor posts to the reset endpoint and returns the fresh state', async () => {
    const responseBody: WorkspaceStateResponse = {
      id: 1,
      user_id: 7,
      name: 'My Workspace',
      description: 'A test workspace',
      state: 'GATHERING_INFO',
      idea: {
        idea_title: null,
        idea_description: null,
        problem_statement: null,
        industry: '',
        founder_validation_goal: '',
        geography: '',
      },
      conversation_history: [],
      validation_result: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    mockedApiClient.post.mockResolvedValue({ data: responseBody });

    const result = await workspaceService.resetMentor(1);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACE.RESET(1));
    expect(result).toBe(responseBody);
  });

  describe('exportReport', () => {
    const payload: ExportWorkspaceReportRequest = { agent_name: 'full', format: 'pdf' };

    it('detects a raw PDF body and uses the filename from content-disposition', async () => {
      const rawBlob = new Blob(['%PDF-1.4 fake pdf contents'], {
        type: 'application/octet-stream',
      });
      mockedApiClient.post.mockResolvedValue({
        data: rawBlob,
        headers: { 'content-disposition': 'attachment; filename="report.pdf"' },
      });

      const result = await workspaceService.exportReport(1, payload);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.WORKSPACE.REPORT_EXPORT(1),
        payload,
        { responseType: 'blob', timeout: 60_000 },
      );
      expect(result.filename).toBe('report.pdf');
      expect(result.blob.type).toBe('application/pdf');
    });

    it('falls back to a default filename when there is no content-disposition header', async () => {
      const rawBlob = new Blob(['%PDF-1.4 fake pdf contents'], {
        type: 'application/octet-stream',
      });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.filename).toBe('idea-validation-report.pdf');
      expect(result.filename.endsWith('.pdf')).toBe(true);
    });

    it('decodes a base64-encoded PDF payload', async () => {
      const base64Pdf = btoa('%PDF-1.4 base64 pdf contents');
      const rawBlob = new Blob([base64Pdf], { type: 'text/plain' });
      mockedApiClient.post.mockResolvedValue({
        data: rawBlob,
        headers: { 'content-disposition': 'attachment; filename="report"' },
      });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.blob.type).toBe('application/pdf');
      expect(result.filename).toBe('report.pdf');
    });

    it('extracts base64 content wrapped in a JSON payload', async () => {
      const base64Pdf = btoa('%PDF-1.4 wrapped pdf contents');
      const jsonBody = JSON.stringify({ data: base64Pdf });
      const rawBlob = new Blob([jsonBody], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.blob.type).toBe('application/pdf');
    });

    it('rejects with the error message from a JSON error payload', async () => {
      const jsonBody = JSON.stringify({ detail: 'Report generation failed' });
      const rawBlob = new Blob([jsonBody], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      await expect(workspaceService.exportReport(1, payload)).rejects.toThrow(
        'Report generation failed',
      );
    });

    it('falls back to a plain blob with a guessed MIME type for unrecognized content', async () => {
      const rawBlob = new Blob(['just some plain text content'], { type: 'text/plain' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const docPayload: ExportWorkspaceReportRequest = { agent_name: 'full', format: 'doc' };
      const result = await workspaceService.exportReport(1, docPayload);

      expect(result.blob.type).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      expect(result.filename).toBe('idea-validation-report.docx');
    });

    it('uses filename* (RFC 5987) over filename when both are present', async () => {
      const rawBlob = new Blob(['%PDF-1.4 fake pdf contents'], {
        type: 'application/octet-stream',
      });
      mockedApiClient.post.mockResolvedValue({
        data: rawBlob,
        headers: {
          'content-disposition':
            'attachment; filename="fallback.pdf"; filename*=UTF-8\'\'star-report.pdf',
        },
      });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.filename).toBe('star-report.pdf');
    });

    it('falls back to a default filename when the content-disposition has no filename directive', async () => {
      const rawBlob = new Blob(['%PDF-1.4 fake pdf contents'], {
        type: 'application/octet-stream',
      });
      mockedApiClient.post.mockResolvedValue({
        data: rawBlob,
        headers: { 'content-disposition': 'attachment' },
      });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.filename).toBe('idea-validation-report.pdf');
    });

    it('does not force a .pdf extension when the format is not pdf, even with a filename present', async () => {
      const rawBlob = new Blob(['%PDF-1.4 fake pdf contents'], {
        type: 'application/octet-stream',
      });
      mockedApiClient.post.mockResolvedValue({
        data: rawBlob,
        headers: { 'content-disposition': 'attachment; filename="report.docx"' },
      });

      const docPayload: ExportWorkspaceReportRequest = { agent_name: 'full', format: 'doc' };
      const result = await workspaceService.exportReport(1, docPayload);

      expect(result.filename).toBe('report.docx');
    });

    it('rejects using the "message" field when "detail" is absent from the JSON error body', async () => {
      const jsonBody = JSON.stringify({ message: 'Something else failed' });
      const rawBlob = new Blob([jsonBody], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      await expect(workspaceService.exportReport(1, payload)).rejects.toThrow(
        'Something else failed',
      );
    });

    it('rejects using the "error" field when "detail" and "message" are absent', async () => {
      const jsonBody = JSON.stringify({ error: 'Yet another failure' });
      const rawBlob = new Blob([jsonBody], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      await expect(workspaceService.exportReport(1, payload)).rejects.toThrow(
        'Yet another failure',
      );
    });

    it('falls back to a plain blob when a JSON body has no recognizable error or base64 field', async () => {
      const jsonBody = JSON.stringify({ unrelated: true });
      const rawBlob = new Blob([jsonBody], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.blob.type).toBe('application/pdf');
    });

    it('falls back to a plain blob when the embedded base64 field does not look like a PDF', async () => {
      const jsonBody = JSON.stringify({ data: 'not-a-pdf-base64-string' });
      const rawBlob = new Blob([jsonBody], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.blob.type).toBe('application/pdf');
    });

    it('treats a JSON array body the same as a JSON object body', async () => {
      const jsonBody = JSON.stringify([1, 2, 3]);
      const rawBlob = new Blob([jsonBody], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.blob.type).toBe('application/pdf');
    });

    it('falls back to a generic octet-stream MIME type for an unrecognized format value', async () => {
      // `format` is typed as 'pdf' | 'doc', but the fallback-MIME and default-extension logic
      // both have a third branch for anything else (defensive coding against a backend that adds
      // a new format value before the frontend type is updated) - exercise it via a type cast.
      const rawBlob = new Blob(['just some plain text content'], { type: 'text/plain' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const unknownFormatPayload = {
        agent_name: 'full',
        format: 'txt',
      } as unknown as ExportWorkspaceReportRequest;
      const result = await workspaceService.exportReport(1, unknownFormatPayload);

      expect(result.blob.type).toBe('application/octet-stream');
      expect(result.filename).toBe('idea-validation-report.txt');
    });

    it('swallows a genuine JSON parse failure and falls back to a plain blob', async () => {
      // Must produce a "Unexpected token" SyntaxError message (V8-specific) - that's the only
      // JSON.parse failure `processReportBlob` treats as swallow-and-fall-back-to-blob; other
      // parse-failure messages (e.g. "Expected property name...") are re-thrown as-is.
      const rawBlob = new Blob(['{"a":}'], { type: 'application/json' });
      mockedApiClient.post.mockResolvedValue({ data: rawBlob, headers: {} });

      const result = await workspaceService.exportReport(1, payload);

      expect(result.blob.type).toBe('application/pdf');
    });
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { workspaceService } from '@features/workspace/api/workspace.service';
import { useWorkspaceAttachments } from '@features/workspace/hooks/useWorkspaceAttachments';

jest.mock('@features/workspace/api/workspace.service', () => ({
  workspaceService: {
    getAttachments: jest.fn(),
    deleteAttachment: jest.fn(),
    uploadAttachment: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedWorkspaceService = jest.mocked(workspaceService);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const FILE_FIXTURE = {
  id: 1,
  user_id: 1,
  workspace_id: 1,
  file_name: 'doc.pdf',
  file_type: 'pdf',
  mime_type: 'application/pdf',
  s3_key: 'uploads/doc.pdf',
  file_url: 'https://example.com/doc.pdf',
  file_size_bytes: 1234,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('useWorkspaceAttachments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches attachments for the workspace', async () => {
    mockedWorkspaceService.getAttachments.mockResolvedValue({
      total: 1,
      attachments: [FILE_FIXTURE],
    });

    const { result } = renderHook(() => useWorkspaceAttachments(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedWorkspaceService.getAttachments).toHaveBeenCalledWith(1);
    expect(result.current.attachments).toEqual([FILE_FIXTURE]);
    expect(result.current.total).toBe(1);
  });

  it('does not fetch when workspace id is not valid', () => {
    const { result } = renderHook(() => useWorkspaceAttachments(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedWorkspaceService.getAttachments).not.toHaveBeenCalled();
  });

  it('deletes an attachment and shows success toast', async () => {
    mockedWorkspaceService.getAttachments.mockResolvedValue({
      total: 1,
      attachments: [FILE_FIXTURE],
    });
    mockedWorkspaceService.deleteAttachment.mockResolvedValue({
      status: 'success',
      message: 'deleted',
      attachment_id: 1,
      workspace_id: 1,
    });

    const { result } = renderHook(() => useWorkspaceAttachments(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.deleteAttachment(1);

    await waitFor(() => expect(mockedWorkspaceService.deleteAttachment).toHaveBeenCalledWith(1, 1));
    expect(toast.success).toHaveBeenCalledWith('Attachment deleted successfully');
  });

  it('shows error toast when deletion fails', async () => {
    mockedWorkspaceService.getAttachments.mockResolvedValue({
      total: 1,
      attachments: [FILE_FIXTURE],
    });
    mockedWorkspaceService.deleteAttachment.mockRejectedValue(new Error('delete failed'));

    const { result } = renderHook(() => useWorkspaceAttachments(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.deleteAttachment(1);

    await waitFor(() => expect(result.current.isDeleting).toBe(false));
    expect(toast.error).toHaveBeenCalledWith('delete failed');
  });

  it('uploads an attachment and shows success toast', async () => {
    mockedWorkspaceService.getAttachments.mockResolvedValue({
      total: 0,
      attachments: [],
    });
    mockedWorkspaceService.uploadAttachment.mockResolvedValue({
      id: '1',
      name: FILE_FIXTURE.file_name,
      url: FILE_FIXTURE.file_url,
      mimeType: FILE_FIXTURE.mime_type,
      sizeBytes: FILE_FIXTURE.file_size_bytes,
    });

    const { result } = renderHook(() => useWorkspaceAttachments(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    void result.current.uploadAttachment(file);

    await waitFor(() =>
      expect(mockedWorkspaceService.uploadAttachment).toHaveBeenCalledWith(1, file),
    );
    expect(toast.success).toHaveBeenCalledWith('File uploaded successfully');
  });

  it('shows error toast when upload fails', async () => {
    mockedWorkspaceService.getAttachments.mockResolvedValue({
      total: 0,
      attachments: [],
    });
    mockedWorkspaceService.uploadAttachment.mockRejectedValue(new Error('upload failed'));

    const { result } = renderHook(() => useWorkspaceAttachments(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    await result.current.uploadAttachment(file).catch(() => undefined);

    expect(toast.error).toHaveBeenCalledWith('upload failed');
  });
});

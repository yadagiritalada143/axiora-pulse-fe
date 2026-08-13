import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { queryKeys } from '@constants/queryKeys';
import {
  useArchivedWorkspaces,
  useCreateWorkspace,
  useDeleteWorkspace,
  usePermanentDeleteWorkspace,
  useRestoreWorkspace,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspaces,
} from '@features/workspace/hooks/useWorkspaces';
import type { GetWorkspacesResponse, Workspace } from '@features/workspace/types';
import { apiClient } from '@services/api';

jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const workspace: Workspace = {
  id: 1,
  user_id: 9,
  name: 'Acme',
  description: 'An idea',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
}

describe('useWorkspaces', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the workspace list and exposes the response', async () => {
    const response: GetWorkspacesResponse = { total: 1, workspaces: [workspace] };
    mockedApiClient.get.mockResolvedValueOnce({ data: response });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/workspaces');
    expect(result.current.data).toEqual(response);
  });
});

describe('useWorkspace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches a single workspace by id', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: workspace });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWorkspace(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/workspaces/1');
    expect(result.current.data).toEqual(workspace);
  });

  it('does not fetch when the workspace id is falsy', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWorkspace(0), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });
});

describe('useCreateWorkspace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates the workspace queries on success', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: workspace });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateWorkspace(), { wrapper });

    result.current.mutate({ name: 'Acme', description: 'An idea' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.post).toHaveBeenCalledWith('/v1/workspaces', {
      name: 'Acme',
      description: 'An idea',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.all() });
  });

  it('surfaces an error when the request fails', async () => {
    mockedApiClient.post.mockRejectedValueOnce(new Error('network error'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateWorkspace(), { wrapper });

    result.current.mutate({ name: 'Acme' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useUpdateWorkspace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates both the workspace list and detail queries on success', async () => {
    mockedApiClient.put.mockResolvedValueOnce({ data: workspace });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateWorkspace(), { wrapper });

    result.current.mutate({ id: 1, payload: { name: 'Acme Renamed', description: 'Updated' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.put).toHaveBeenCalledWith('/v1/workspaces/1', {
      name: 'Acme Renamed',
      description: 'Updated',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.all() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.detail(1) });
  });

  it('surfaces an error when the request fails', async () => {
    mockedApiClient.put.mockRejectedValueOnce(new Error('network error'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateWorkspace(), { wrapper });

    result.current.mutate({ id: 1, payload: { name: 'Acme', description: '' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useDeleteWorkspace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates the workspace queries on success', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({
      data: { status: 'ok', message: 'deleted', workspace_id: 1 },
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteWorkspace(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/v1/workspaces/1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.all() });
  });
});

describe('useArchivedWorkspaces', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the archived workspace list', async () => {
    const archived: Workspace = { ...workspace, is_delete: true };
    const response: GetWorkspacesResponse = { total: 1, workspaces: [archived] };
    mockedApiClient.get.mockResolvedValueOnce({ data: response });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useArchivedWorkspaces(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/workspaces?is_delete=true');
    expect(result.current.data).toEqual(response);
  });
});

describe('useRestoreWorkspace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates the workspace queries on success', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({
      data: { status: 'ok', message: 'restored', workspace_id: 1, is_delete: false },
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRestoreWorkspace(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/v1/workspaces/1/restore');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.all() });
  });
});

describe('usePermanentDeleteWorkspace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates the workspace queries on success', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({
      data: { status: 'ok', message: 'deleted', workspace_id: 1 },
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => usePermanentDeleteWorkspace(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/v1/workspaces/1/permanent');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.all() });
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { queryKeys } from '@/constants/queryKeys';
import { workspaceService } from '@features/workspace/api';
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useWorkspace,
  useWorkspaces,
} from '@features/workspace/hooks/useWorkspaces';

jest.mock('@features/workspace/api', () => ({
  workspaceService: {
    getWorkspaces: jest.fn(),
    getWorkspaceById: jest.fn(),
    createWorkspace: jest.fn(),
    deleteWorkspace: jest.fn(),
  },
}));

const { getWorkspaces, getWorkspaceById, createWorkspace, deleteWorkspace } =
  workspaceService as unknown as {
    getWorkspaces: jest.Mock;
    getWorkspaceById: jest.Mock;
    createWorkspace: jest.Mock;
    deleteWorkspace: jest.Mock;
  };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { wrapper: Wrapper, queryClient };
}

describe('workspace hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useWorkspaces fetches the workspace list', async () => {
    const data = { total: 0, workspaces: [] };
    getWorkspaces.mockResolvedValue(data);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(getWorkspaces).toHaveBeenCalledTimes(1);
  });

  it('useWorkspace fetches a single workspace when an id is provided', async () => {
    const ws = { id: 7, name: 'Alpha' };
    getWorkspaceById.mockResolvedValue(ws);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWorkspace(7), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getWorkspaceById).toHaveBeenCalledWith(7);
  });

  it('useWorkspace is disabled when the id is falsy', () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWorkspace(0), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getWorkspaceById).not.toHaveBeenCalled();
  });

  it('useCreateWorkspace creates a workspace and invalidates the list', async () => {
    createWorkspace.mockResolvedValue({ id: 1 });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateWorkspace(), { wrapper });
    await result.current.mutateAsync({ name: 'Alpha' });

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.workspace.all(),
      }),
    );
    expect(createWorkspace).toHaveBeenCalledWith({ name: 'Alpha' }, expect.anything());
  });

  it('useDeleteWorkspace deletes a workspace and invalidates the list', async () => {
    deleteWorkspace.mockResolvedValue({
      status: 'success',
      message: 'deleted',
      workspace_id: 2,
    });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteWorkspace(), { wrapper });
    await result.current.mutateAsync(2);

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.workspace.all(),
      }),
    );
    expect(deleteWorkspace).toHaveBeenCalledWith(2, expect.anything());
  });
});

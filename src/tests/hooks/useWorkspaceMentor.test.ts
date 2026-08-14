// Mocked workspaceService methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { queryKeys } from '@constants/queryKeys';
import { workspaceService } from '@features/workspace/api';
import {
  useExportWorkspaceReport,
  useResetWorkspaceMentor,
  useWorkspaceChat,
  useWorkspaceState,
} from '@features/workspace/hooks/useWorkspaceMentor';
import type { WorkspaceChatResponse, WorkspaceStateResponse } from '@features/workspace/types';

jest.mock('@features/workspace/api', () => ({
  workspaceService: {
    getWorkspaceState: jest.fn(),
    chatWithMentor: jest.fn(),
    resetMentor: jest.fn(),
    exportReport: jest.fn(),
  },
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

const mockedWorkspaceService = workspaceService as jest.Mocked<typeof workspaceService>;
const mockedToast = toast as jest.Mocked<typeof toast>;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function createWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

const baseIdea = {
  idea_title: null,
  idea_description: null,
  problem_statement: null,
  industry: '',
  founder_validation_goal: '',
  geography: '',
};

function buildState(overrides: Partial<WorkspaceStateResponse> = {}): WorkspaceStateResponse {
  return {
    id: 1,
    user_id: 7,
    name: 'My Workspace',
    description: 'A test workspace',
    state: 'GATHERING_INFO',
    idea: baseIdea,
    conversation_history: [],
    validation_result: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useWorkspaceState', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the workspace mentor state', async () => {
    const state = buildState();
    mockedWorkspaceService.getWorkspaceState.mockResolvedValue(state);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useWorkspaceState(1), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedWorkspaceService.getWorkspaceState).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual(state);
  });

  it('does not fetch when the workspace id is falsy', () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useWorkspaceState(0), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedWorkspaceService.getWorkspaceState).not.toHaveBeenCalled();
  });
});

describe('useWorkspaceChat', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('optimistically appends the user message before the request resolves', async () => {
    const initialState = buildState();
    let resolveChat: (value: WorkspaceChatResponse) => void = () => {};
    mockedWorkspaceService.chatWithMentor.mockReturnValue(
      new Promise((resolve) => {
        resolveChat = resolve;
      }),
    );

    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.workspace.state(1), initialState);

    const { result } = renderHook(() => useWorkspaceChat(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ message: 'Hello mentor' });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<WorkspaceStateResponse>(queryKeys.workspace.state(1));
      expect(cached?.conversation_history).toEqual([{ role: 'user', content: 'Hello mentor' }]);
    });

    act(() => {
      resolveChat({
        reply: 'Hi, tell me more',
        workspace_id: 1,
        state: 'GATHERING_INFO',
        idea: baseIdea,
        validation_result: null,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<WorkspaceStateResponse>(queryKeys.workspace.state(1));
    expect(cached?.conversation_history).toEqual([
      { role: 'user', content: 'Hello mentor' },
      { role: 'assistant', content: 'Hi, tell me more' },
    ]);
    expect(cached?.state).toBe('GATHERING_INFO');
    expect(mockedWorkspaceService.chatWithMentor).toHaveBeenCalledWith(1, {
      message: 'Hello mentor',
    });
  });

  it('merges state, idea and validation_result from the response on success', async () => {
    const initialState = buildState();
    mockedWorkspaceService.chatWithMentor.mockResolvedValue({
      reply: 'Great, ready to validate',
      workspace_id: 1,
      state: 'READY_TO_VALIDATE',
      idea: { ...baseIdea, idea_title: 'Acme' },
      validation_result: null,
    });

    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.workspace.state(1), initialState);
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useWorkspaceChat(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ message: 'Ready?' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<WorkspaceStateResponse>(queryKeys.workspace.state(1));
    expect(cached?.state).toBe('READY_TO_VALIDATE');
    expect(cached?.idea.idea_title).toBe('Acme');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.detail(1) });
  });

  it('rolls back the optimistic update when the request fails', async () => {
    const initialState = buildState();
    mockedWorkspaceService.chatWithMentor.mockRejectedValue(new Error('network error'));

    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.workspace.state(1), initialState);

    const { result } = renderHook(() => useWorkspaceChat(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ message: 'Hello mentor' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = queryClient.getQueryData<WorkspaceStateResponse>(queryKeys.workspace.state(1));
    expect(cached?.conversation_history).toEqual([]);
  });

  it('is a no-op on the cache when there is no previously cached state to update or roll back', async () => {
    // No `setQueryData` seed here - `onMutate`'s and `onSuccess`'s cache updaters both guard on
    // `current` being defined, and `onError`'s rollback guards on `context.previous` being
    // truthy; this exercises the "nothing cached yet" branch of all three.
    mockedWorkspaceService.chatWithMentor.mockResolvedValue({
      reply: 'Hi there',
      workspace_id: 1,
      state: 'GATHERING_INFO',
      idea: baseIdea,
      validation_result: null,
    });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useWorkspaceChat(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ message: 'Hello mentor' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      queryClient.getQueryData<WorkspaceStateResponse>(queryKeys.workspace.state(1)),
    ).toBeUndefined();
  });

  it('does not attempt a rollback on error when there was nothing cached beforehand', async () => {
    mockedWorkspaceService.chatWithMentor.mockRejectedValue(new Error('network error'));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useWorkspaceChat(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ message: 'Hello mentor' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(
      queryClient.getQueryData<WorkspaceStateResponse>(queryKeys.workspace.state(1)),
    ).toBeUndefined();
  });
});

describe('useResetWorkspaceMentor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('replaces the cached state and invalidates the workspace detail on success', async () => {
    const resetState = buildState({ conversation_history: [] });
    mockedWorkspaceService.resetMentor.mockResolvedValue(resetState);

    const queryClient = createQueryClient();
    queryClient.setQueryData(
      queryKeys.workspace.state(1),
      buildState({ conversation_history: [{ role: 'user', content: 'old message' }] }),
    );
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useResetWorkspaceMentor(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedWorkspaceService.resetMentor).toHaveBeenCalledWith(1);
    const cached = queryClient.getQueryData<WorkspaceStateResponse>(queryKeys.workspace.state(1));
    expect(cached).toEqual(resetState);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.workspace.detail(1) });
  });
});

describe('useExportWorkspaceReport', () => {
  const createObjectURL = jest.fn(() => 'blob:mock-url');
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('triggers a browser download and shows a success toast', async () => {
    const blob = new Blob(['pdf content'], { type: 'application/pdf' });
    mockedWorkspaceService.exportReport.mockResolvedValue({ blob, filename: 'report.pdf' });

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useExportWorkspaceReport(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ agent_name: 'full', format: 'pdf' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedWorkspaceService.exportReport).toHaveBeenCalledWith(1, {
      agent_name: 'full',
      format: 'pdf',
    });
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(mockedToast.success).toHaveBeenCalledWith('Report downloaded successfully.');

    clickSpy.mockRestore();
  });

  it('shows an error toast when the export fails', async () => {
    mockedWorkspaceService.exportReport.mockRejectedValue(new Error('Export failed'));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useExportWorkspaceReport(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ agent_name: 'full', format: 'pdf' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToast.error).toHaveBeenCalledWith('Export failed');
  });

  it('shows a generic error toast when the failure is not an Error instance', async () => {
    mockedWorkspaceService.exportReport.mockRejectedValue('not an error');

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useExportWorkspaceReport(1), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ agent_name: 'full', format: 'pdf' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToast.error).toHaveBeenCalledWith(
      'Failed to export the report. Please try again.',
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { workspaceService } from '@features/workspace/api';
import { useWorkspaceLiveState } from '@features/workspace/hooks/useWorkspaceLiveState';
import type { WorkspaceLiveStateResponse } from '@features/workspace/types';

jest.mock('@features/workspace/api', () => ({
  workspaceService: {
    getLiveState: jest.fn(),
  },
}));

jest.mock('@/services/api/tokenManager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(() => 'mock-jwt-token'),
  },
}));

const mockLiveStateResponse: WorkspaceLiveStateResponse = {
  workspace_id: '10',
  mentor_state: 'READY_TO_VALIDATE',
  current_step_id: 1,
  current_step_name: 'Idea Validation',
  steps: [
    {
      id: 1,
      name: 'Idea Validation',
      description: 'Validation ready',
      status: 'active',
      score: null,
      completed_at: null,
      key_activities: ['Problem identification'],
    },
  ],
  execution: {
    is_running: false,
    run_id: null,
    active_agent: null,
    active_agent_label: null,
    current_action: null,
    progress_pct: 0,
    elapsed_seconds: 0,
    started_at: null,
  },
  recent_activities: [],
  updated_at: '2026-09-22T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useWorkspaceLiveState', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns undefined liveState and does not call getLiveState when workspaceId is omitted', () => {
    const { result } = renderHook(() => useWorkspaceLiveState(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.liveState).toBeUndefined();
    expect(result.current.isStreaming).toBe(false);
    expect(workspaceService.getLiveState).not.toHaveBeenCalled();
  });

  it('loads fallback query liveState when getLiveState succeeds', async () => {
    jest.mocked(workspaceService.getLiveState).mockResolvedValueOnce(mockLiveStateResponse);

    // Mock fetch to reject immediately so SSE falls back to query cleanly
    global.fetch = jest.fn().mockRejectedValue(new Error('SSE simulated off'));

    const { result } = renderHook(() => useWorkspaceLiveState(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.liveState).toBeDefined();
    });

    expect(result.current.liveState?.workspace_id).toBe('10');
    expect(result.current.liveState?.current_step_name).toBe('Idea Validation');
  });

  it('handles SSE stream events and sets liveStreamData', async () => {
    jest.mocked(workspaceService.getLiveState).mockResolvedValueOnce(mockLiveStateResponse);

    const updatedState: WorkspaceLiveStateResponse = {
      ...mockLiveStateResponse,
      execution: {
        ...mockLiveStateResponse.execution,
        is_running: true,
        current_action: 'Analyzing market...',
        progress_pct: 50,
      },
    };

    const sseChunk = `event: agent_progress\ndata: ${JSON.stringify(updatedState)}\n\n`;
    const encoder = new TextEncoder();

    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({ done: false, value: encoder.encode(sseChunk) })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: jest.fn(),
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    });

    const { result } = renderHook(() => useWorkspaceLiveState(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.liveState?.execution.is_running).toBe(true);
    });

    expect(result.current.liveState?.execution.current_action).toBe('Analyzing market...');
    expect(result.current.liveState?.execution.progress_pct).toBe(50);
  });
});

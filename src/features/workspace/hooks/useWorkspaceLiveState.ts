import { QueryClient, QueryClientContext, useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';

import { appConfig } from '@/config/app.config';
import { API_ENDPOINTS } from '@/constants/api';
import { queryKeys } from '@/constants/queryKeys';
import { tokenManager } from '@/services/api/tokenManager';

import { workspaceService } from '../api';
import type { WorkspaceLiveStateResponse } from '../types';

export interface UseWorkspaceLiveStateResult {
  liveState: WorkspaceLiveStateResponse | undefined;
  isStreaming: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

export function useWorkspaceLiveState(
  workspaceId?: number | string | null,
): UseWorkspaceLiveStateResult {
  const contextClient = useContext(QueryClientContext);
  const queryClient = contextClient ?? fallbackQueryClient;

  const [liveStreamData, setLiveStreamData] = useState<WorkspaceLiveStateResponse | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<Error | null>(null);

  // 1. Fallback Query (provides initial snapshot and polls if stream is inactive)
  const fallbackQuery = useQuery<WorkspaceLiveStateResponse, Error>(
    {
      queryKey: queryKeys.workspace.liveState(workspaceId),
      queryFn: () =>
        workspaceId
          ? workspaceService.getLiveState(workspaceId)
          : Promise.reject(new Error('Missing workspaceId')),
      enabled: Boolean(workspaceId && contextClient),
      staleTime: 4_000,
      refetchInterval: isStreaming ? false : 10_000,
    },
    queryClient,
  );

  // 2. Real-Time SSE Stream
  useEffect(() => {
    if (!workspaceId) return;

    const wsId = workspaceId;
    const abortController = new AbortController();
    let isCancelled = false;

    async function connectStream() {
      const token = tokenManager.getAccessToken();
      const baseUrl =
        appConfig.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const streamUrl = `${baseUrl}${API_ENDPOINTS.WORKSPACE.LIVE_STREAM(wsId)}`;

      try {
        const response = await fetch(streamUrl, {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Live stream connection failed: HTTP ${response.status}`);
        }

        if (isCancelled) return;

        setIsStreaming(true);
        setStreamError(null);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (!isCancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() ?? '';

          for (const rawMessage of messages) {
            if (!rawMessage.trim()) continue;

            const lines = rawMessage.split('\n');
            let dataString = '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                dataString = line.slice(6);
              } else if (line.startsWith('data:')) {
                dataString = line.slice(5);
              }
            }

            if (dataString) {
              try {
                const parsed = JSON.parse(dataString) as WorkspaceLiveStateResponse;
                if (parsed && Array.isArray(parsed.steps)) {
                  setLiveStreamData(parsed);
                  queryClient.setQueryData(queryKeys.workspace.liveState(wsId), parsed);
                }
              } catch {
                // Ignore SSE non-JSON or heartbeat comments
              }
            }
          }
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted && !isCancelled) {
          setIsStreaming(false);
          setStreamError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!isCancelled) {
          setIsStreaming(false);
        }
      }
    }

    void connectStream();

    return () => {
      isCancelled = true;
      abortController.abort();
      setIsStreaming(false);
      setLiveStreamData(null);
    };
  }, [workspaceId, queryClient]);

  const activeStreamData =
    workspaceId && liveStreamData?.workspace_id === String(workspaceId) ? liveStreamData : null;

  const liveState = activeStreamData ?? fallbackQuery.data;

  return {
    liveState,
    isStreaming,
    isLoading: fallbackQuery.isLoading && !liveState,
    error: streamError ?? fallbackQuery.error,
    refetch: fallbackQuery.refetch,
  };
}

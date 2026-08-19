import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Globe,
  Loader2,
  Search,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { OrchestrationResult } from '@/types/orchestration.types';
import { cn } from '@lib/utils';

import { useResearchStream } from '../hooks/useResearchStream';

export type WebSearchStatus =
  | 'idle'
  | 'searching'
  | 'sources_available'
  | 'search_complete'
  | 'assistant_streaming'
  | 'complete'
  | 'search_error';

interface WebSearchDrawerProps {
  runId?: string | null;
  ideaTitle?: string;
  isLive?: boolean;
  result?: OrchestrationResult | null;
  className?: string;
  defaultExpanded?: boolean;
  isAssistantStreaming?: boolean;
  searchStatus?: WebSearchStatus;
  onRetry?: () => void;
}

export function WebSearchDrawer({
  runId,
  ideaTitle,
  isLive = false,
  result,
  className,
  defaultExpanded = true,
  isAssistantStreaming = false,
  searchStatus,
  onRetry,
}: WebSearchDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'sources' | 'queries'>('sources');
  const drawerRef = useRef<HTMLDivElement>(null);

  const streamState = useResearchStream({
    runId,
    ideaTitle,
    enabled: true,
    result,
  });

  const {
    queries,
    sources,
    activeQuery,
    isStreaming,
    isComplete,
    error,
    totalQueries,
    totalSources,
  } = streamState;

  const currentStatus: WebSearchStatus = (() => {
    if (searchStatus) return searchStatus;
    if (error) return 'search_error';
    if (result || isComplete) {
      if (isAssistantStreaming) return 'assistant_streaming';
      if (sources.length > 0) return 'complete';
      return 'search_complete';
    }
    if (isStreaming || isLive) {
      if (sources.length > 0) return 'sources_available';
      return 'searching';
    }
    if (sources.length === 0 && queries.length === 0) return 'idle';
    return 'complete';
  })();

  const isSearching = currentStatus === 'searching' || currentStatus === 'sources_available';
  const isCompleteStatus =
    currentStatus === 'search_complete' ||
    currentStatus === 'assistant_streaming' ||
    currentStatus === 'complete';
  const isErrorStatus = currentStatus === 'search_error';

  useEffect(() => {
    if (isExpanded && isSearching) {
      drawerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded, isSearching, sources.length]);

  if (currentStatus === 'idle' && sources.length === 0 && queries.length === 0) {
    return null;
  }

  const latestQuery =
    activeQuery ??
    (queries.length > 0 ? queries[queries.length - 1]?.query : null) ??
    (ideaTitle ? `what is ${ideaTitle.toLowerCase()} do a market research` : null);

  const getStatusText = (): string => {
    switch (currentStatus) {
      case 'searching':
      case 'sources_available':
        return 'Arya is researching…';
      case 'assistant_streaming':
      case 'search_complete':
      case 'complete':
        return totalSources > 0
          ? `Arya researched ${totalSources} ${totalSources === 1 ? 'source' : 'sources'}`
          : 'Arya finished researching the web';
      case 'search_error':
        return "Arya couldn't complete the research";
      default:
        return 'Arya is researching…';
    }
  };

  return (
    <div
      ref={drawerRef}
      className={cn(
        'border-border/60 bg-muted/15 text-foreground/90 my-2 overflow-hidden rounded-xl border font-sans text-xs shadow-xs transition-all duration-200 select-none',
        isSearching && 'border-[#FF4500]/40 ring-1 ring-[#FF4500]/20',
        isErrorStatus && 'border-destructive/40 ring-destructive/20 ring-1',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="hover:bg-muted/30 flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-left transition-colors"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex size-4.5 shrink-0 items-center justify-center">
            {isSearching ? (
              <Loader2 className="size-4 animate-spin text-[#FF4500]" aria-hidden />
            ) : isErrorStatus ? (
              <AlertCircle className="text-destructive size-4" />
            ) : (
              <Globe className="text-muted-foreground group-hover:text-foreground size-4 transition-colors" />
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <span className="text-foreground truncate font-medium">{getStatusText()}</span>

            {isSearching && (
              <span className="relative flex size-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4500] opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#FF4500]" />
              </span>
            )}

            {isCompleteStatus && (
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-border/50 border-t px-3.5 pt-2.5 pb-3">
          {isErrorStatus ? (
            <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-center justify-between rounded-lg border p-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error ?? "Arya couldn't complete the research. Please try again."}</span>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="bg-destructive/10 hover:bg-destructive/20 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <>
              {latestQuery && (
                <div className="bg-background/50 text-muted-foreground mb-2.5 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs">
                  <Search
                    className={cn('size-3 shrink-0', isSearching && 'animate-pulse text-[#FF4500]')}
                  />
                  <span className="text-foreground/80 truncate font-mono text-[11px]">
                    {latestQuery}
                  </span>
                </div>
              )}

              {(totalSources > 0 || totalQueries > 0) && totalQueries > 0 && (
                <div className="border-border/40 mb-2 flex items-center gap-4 border-b pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sources')}
                    className={cn(
                      'relative cursor-pointer pb-1 font-medium transition-colors',
                      activeTab === 'sources'
                        ? 'text-foreground font-semibold after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#FF4500]'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Sources ({totalSources})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('queries')}
                    className={cn(
                      'relative cursor-pointer pb-1 font-medium transition-colors',
                      activeTab === 'queries'
                        ? 'text-foreground font-semibold after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#FF4500]'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Queries ({totalQueries})
                  </button>
                </div>
              )}

              {activeTab === 'sources' && (
                <div className="divide-border/30 max-h-72 space-y-1 divide-y overflow-y-auto pr-1">
                  {sources.length > 0 ? (
                    sources.map((source, idx) => {
                      let hostname = 'web-source';
                      try {
                        if (source.url) {
                          hostname = new URL(source.url).hostname.replace('www.', '');
                        }
                      } catch {
                        // Fallback
                      }

                      return (
                        <a
                          key={source.url + idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group hover:bg-muted/40 flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-all"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                              alt=""
                              className="bg-background size-4 shrink-0 rounded-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="text-foreground truncate text-xs font-medium transition-colors group-hover:text-[#FF4500]">
                              {source.title ?? hostname}
                            </span>
                          </div>

                          <div className="text-muted-foreground group-hover:text-foreground flex shrink-0 items-center gap-1.5">
                            <span className="text-muted-foreground font-mono text-[11px]">
                              {hostname}
                            </span>
                            <ExternalLink className="size-3 text-[#FF4500] opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </a>
                      );
                    })
                  ) : isSearching ? (
                    <div className="text-muted-foreground flex items-center gap-2 px-2 py-3 text-xs">
                      <Loader2 className="size-3.5 shrink-0 animate-spin text-[#FF4500]" />
                      <span>Arya is gathering relevant sources…</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-2 text-center text-xs">
                      No sources recorded.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'queries' && (
                <div className="divide-border/30 max-h-72 space-y-1 divide-y overflow-y-auto pr-1">
                  {queries.length > 0 ? (
                    queries.map((q, idx) => (
                      <div
                        key={q.query + idx}
                        className="flex items-center justify-between gap-3 px-2.5 py-1.5 text-xs"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Search className="text-muted-foreground size-3 shrink-0" />
                          <span className="text-foreground min-w-0 truncate font-mono text-[11px]">
                            {q.query}
                          </span>
                        </div>
                        <span className="text-muted-foreground shrink-0 text-[10px]">
                          {q.agent ?? q.agent_name ?? 'Market Research Agent'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-2 text-center text-xs">
                      No queries recorded.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

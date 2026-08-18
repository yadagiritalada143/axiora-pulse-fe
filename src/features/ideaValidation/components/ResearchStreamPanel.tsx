import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import type { OrchestrationResult } from '@/types/orchestration.types';
import { cn } from '@lib/utils';

import { useResearchStream, type ResearchStreamState } from '../hooks/useResearchStream';

interface ResearchStreamPanelProps {
  runId?: string | null;
  ideaTitle?: string;
  isLive?: boolean;
  result?: OrchestrationResult | null;
  className?: string;
  defaultExpanded?: boolean;
}

export function ResearchStreamPanel({
  runId,
  ideaTitle,
  isLive = true,
  result,
  className,
  defaultExpanded = true,
}: ResearchStreamPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'sources' | 'queries'>('sources');

  const streamState: ResearchStreamState = useResearchStream({
    runId,
    ideaTitle,
    enabled: isLive,
    result,
  });

  const { queries, sources, activeQuery, isStreaming, isComplete, totalQueries, totalSources } =
    streamState;

  if (queries.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <div
      className={cn(
        'border-border/60 bg-muted/20 overflow-hidden rounded-xl border shadow-xs transition-all duration-200',
        isStreaming && 'border-[#FF4500]/40 ring-1 ring-[#FF4500]/30',
        className,
      )}
    >
      {/* Panel Header */}
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left select-none"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex size-8 items-center justify-center rounded-lg bg-[#FF4500]/10 text-[#FF4500]">
            {isStreaming ? (
              <Sparkles className="size-4 animate-spin text-[#FF4500]" />
            ) : (
              <Globe className="size-4 text-[#FF4500]" />
            )}
            {isStreaming && (
              <span className="absolute -top-1 -right-1 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4500] opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[#FF4500]" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-xs font-semibold tracking-tight sm:text-sm">
                Live Web Research & Source Discovery
              </h3>

              {isStreaming ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FF4500]/10 px-2 py-0.5 text-[10px] font-medium text-[#FF4500]">
                  <Loader2 className="size-2.5 animate-spin" /> Live Stream
                </span>
              ) : isComplete ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Completed
                </span>
              ) : null}
            </div>

            <p className="text-muted-foreground mt-0.5 text-[11px]">
              {isStreaming
                ? activeQuery
                  ? `Searching: "${activeQuery.length > 55 ? `${activeQuery.slice(0, 55)}…` : activeQuery}"`
                  : 'Analyzing web sources & market data…'
                : `${totalQueries} queries executed • ${totalSources} web sources captured`}
            </p>
          </div>
        </div>

        <div className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors">
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>

      {/* Expanded Stream Content */}
      {isExpanded && (
        <div className="border-border/60 border-t px-4 pt-3 pb-4">
          {/* Active Streaming Query Bar (Gemini / ChatGPT Style) */}
          {isStreaming && activeQuery && (
            <div className="relative mb-3.5 overflow-hidden rounded-lg border border-[#FF4500]/30 bg-linear-to-r from-[#FF4500]/10 via-[#FF6B35]/5 to-transparent p-2.5">
              <div className="flex items-center gap-2">
                <Search className="size-3.5 shrink-0 animate-pulse text-[#FF4500]" />
                <span className="text-[11px] font-medium tracking-wider text-[#FF4500] uppercase">
                  Active Web Search
                </span>
              </div>
              <p className="text-foreground mt-1 truncate font-mono text-xs">
                &quot;{activeQuery}&quot;
              </p>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between border-b pb-2">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('sources')}
                className={cn(
                  'relative pb-1 text-xs font-medium transition-colors',
                  activeTab === 'sources'
                    ? 'text-foreground font-semibold after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#FF4500]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Captured Sources ({totalSources})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('queries')}
                className={cn(
                  'relative pb-1 text-xs font-medium transition-colors',
                  activeTab === 'queries'
                    ? 'text-foreground font-semibold after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#FF4500]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Search Queries ({totalQueries})
              </button>
            </div>
          </div>

          {activeTab === 'sources' && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {sources.length > 0 ? (
                sources.map((source, idx) => {
                  let hostname = 'web-source';
                  try {
                    hostname = new URL(source.url).hostname.replace('www.', '');
                  } catch {
                    // Fallback
                  }

                  return (
                    <a
                      key={source.url + idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border-border/70 bg-background/80 hover:bg-background flex flex-col justify-between rounded-lg border p-2.5 transition-all duration-150 hover:border-[#FF4500]/50 hover:shadow-xs"
                    >
                      <div>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium text-[#FF4500]">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                              alt=""
                              className="size-3.5 rounded-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {hostname}
                          </span>
                          <ExternalLink className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:text-[#FF4500] group-hover:opacity-100" />
                        </div>
                        <h4 className="text-foreground line-clamp-1 text-xs font-semibold group-hover:underline">
                          {source.title ?? hostname}
                        </h4>
                        {source.snippet ? (
                          <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-relaxed">
                            {source.snippet}
                          </p>
                        ) : null}
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="text-muted-foreground col-span-2 py-4 text-center text-xs">
                  {isStreaming ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-3.5 animate-spin text-[#FF4500]" /> Capturing live
                      web sources…
                    </span>
                  ) : (
                    'No sources recorded for this run.'
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-2">
              {queries.map((q, idx) => (
                <div
                  key={q.query + idx}
                  className="bg-background/80 border-border/70 flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs"
                >
                  <Search className="text-muted-foreground size-3.5 shrink-0" />
                  <span className="text-foreground min-w-0 flex-1 truncate font-mono text-[11px]">
                    {q.query}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    {q.agent ?? 'Market Research Agent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

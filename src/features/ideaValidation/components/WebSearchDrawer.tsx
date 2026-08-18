import { CheckCircle2, ChevronDown, Globe, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

import type { OrchestrationResult } from '@/types/orchestration.types';
import { cn } from '@lib/utils';

import { useResearchStream, type ResearchStreamState } from '../hooks/useResearchStream';

interface WebSearchDrawerProps {
  runId?: string | null;
  ideaTitle?: string;
  isLive?: boolean;
  result?: OrchestrationResult | null;
  className?: string;
  defaultExpanded?: boolean;
}

export function WebSearchDrawer({
  runId,
  ideaTitle,
  isLive = false,
  result,
  className,
  defaultExpanded = true,
}: WebSearchDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const streamState: ResearchStreamState = useResearchStream({
    runId,
    ideaTitle,
    enabled: true,
    result,
  });

  const { queries, sources, activeQuery, isStreaming } = streamState;
  const isSearching = isLive || isStreaming;

  if (queries.length === 0 && sources.length === 0 && !isSearching) {
    return null;
  }

  const latestQuery =
    activeQuery ?? (queries.length > 0 ? queries[queries.length - 1]?.query : null);
  const displayedSources = showAll ? sources : sources.slice(0, 5);

  return (
    <div className={cn('text-foreground/90 my-2 font-sans text-xs select-none', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="group text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 py-1 text-xs font-medium transition-colors"
      >
        {isSearching ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-[#FF4500]" aria-hidden />
        ) : (
          <Globe className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors" />
        )}
        <span>Searching the web</span>
        {isSearching && (
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4500] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#FF4500]" />
          </span>
        )}
        <ChevronDown
          className={cn(
            'text-muted-foreground group-hover:text-foreground size-3.5 transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-border/60 mt-2 ml-2 space-y-2 border-l pl-3">
          {latestQuery && (
            <div className="text-muted-foreground/90 flex items-center gap-2 py-0.5 text-xs font-normal">
              <Search className="text-muted-foreground size-3.5 shrink-0" />
              <span className="truncate">{latestQuery}</span>
            </div>
          )}

          {sources.length > 0 ? (
            displayedSources.map((source, idx) => {
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
                  className="group hover:bg-muted/40 -mx-1.5 flex items-center justify-between gap-3 rounded-md px-1.5 py-1 transition-colors"
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
                    <span className="text-foreground/90 truncate text-xs font-normal transition-colors group-hover:text-[#FF4500]">
                      {source.title ?? hostname}
                    </span>
                  </div>

                  <div className="text-muted-foreground flex shrink-0 items-center gap-1 font-mono text-[11px]">
                    <span>{hostname}</span>
                    <CheckCircle2 className="text-muted-foreground/70 size-3" />
                  </div>
                </a>
              );
            })
          ) : isSearching ? (
            <div className="text-muted-foreground flex items-center gap-2 py-1 text-xs font-normal">
              <Loader2 className="size-3.5 shrink-0 animate-spin text-[#FF4500]" />
              <span>Searching on web....</span>
            </div>
          ) : null}

          {sources.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground mt-1 block cursor-pointer text-[11px] font-medium transition-colors"
            >
              {showAll ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

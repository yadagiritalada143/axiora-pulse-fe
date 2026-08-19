import { Globe, Loader2, Search, Sparkles } from 'lucide-react';

import type { OrchestrationResult } from '@/types/orchestration.types';

import { useResearchStream } from '../hooks/useResearchStream';

interface LiveAgentSearchIndicatorProps {
  runId?: string | null;
  ideaTitle?: string;
  result?: OrchestrationResult | null;
}

export function LiveAgentSearchIndicator({
  runId,
  ideaTitle,
  result,
}: LiveAgentSearchIndicatorProps) {
  const { queries, sources, activeQuery, totalSources, totalQueries } = useResearchStream({
    runId,
    ideaTitle,
    enabled: true,
    result,
  });

  const latestSource = sources.length > 0 ? sources[sources.length - 1] : null;
  const lastQuery = queries.length > 0 ? queries[queries.length - 1] : null;
  const latestQuery = activeQuery ?? lastQuery?.query ?? null;
  let currentAgent = 'Market Research Agent';
  if (latestSource?.agent_name && typeof latestSource.agent_name === 'string') {
    currentAgent = latestSource.agent_name;
  } else if (lastQuery?.agent && typeof lastQuery.agent === 'string') {
    currentAgent = lastQuery.agent;
  } else if (lastQuery?.agent_name && typeof lastQuery.agent_name === 'string') {
    currentAgent = lastQuery.agent_name;
  }

  let hostname = 'web-source';
  if (latestSource?.url) {
    try {
      hostname = new URL(latestSource.url).hostname.replace('www.', '');
    } catch {
      // Fallback
    }
  }

  return (
    <div className="to-background space-y-2.5 rounded-xl border border-[#FF4500]/30 bg-linear-to-br from-[#FF4500]/10 via-[#FF6B35]/5 p-3.5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4500] opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#FF4500]" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-[#FF4500] uppercase">
            Live Web Search Active
          </span>
        </div>
        <span className="border-border/60 bg-background/80 text-muted-foreground rounded-full border px-2 py-0.5 font-mono text-[10px]">
          {totalQueries} queries • {totalSources} sources
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FF4500]/15 px-2 py-0.5 text-xs font-semibold text-[#FF4500]">
          <Sparkles className="size-3 animate-spin" />
          {currentAgent}
        </span>
        <span className="text-foreground truncate text-xs font-medium">
          is inspecting live market signals & competitor data…
        </span>
      </div>

      {latestSource ? (
        <div className="border-border/60 bg-background/90 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
          <Globe className="size-3.5 shrink-0 animate-pulse text-[#FF4500]" />
          <div className="min-w-0 flex-1 truncate">
            <span className="text-muted-foreground mr-1.5 text-[11px] font-medium">
              Inspecting Source:
            </span>
            <span className="text-foreground font-semibold">{latestSource.title ?? hostname}</span>
            <span className="text-muted-foreground ml-1.5 font-mono text-[10px]">({hostname})</span>
          </div>
        </div>
      ) : latestQuery ? (
        <div className="border-border/60 bg-background/90 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
          <Search className="size-3.5 shrink-0 animate-pulse text-[#FF4500]" />
          <div className="min-w-0 flex-1 truncate">
            <span className="text-muted-foreground mr-1.5 text-[11px] font-medium">
              Searching Query:
            </span>
            <span className="text-foreground font-mono text-[11px]">&quot;{latestQuery}&quot;</span>
          </div>
        </div>
      ) : (
        <div className="border-border/60 bg-background/90 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
          <Loader2 className="size-3.5 shrink-0 animate-spin text-[#FF4500]" />
          <span className="text-muted-foreground text-xs">
            Connecting to live web research stream…
          </span>
        </div>
      )}
    </div>
  );
}

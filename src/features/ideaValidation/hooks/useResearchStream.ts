import { useEffect, useState, useRef } from 'react';

import type {
  OrchestrationResult,
  ResearchStreamQueryEvent,
  ResearchStreamSourceEvent,
} from '@/types/orchestration.types';
import { API_ENDPOINTS } from '@constants/api';

interface UseResearchStreamOptions {
  runId?: string | null;
  ideaTitle?: string;
  enabled?: boolean;
  result?: OrchestrationResult | null;
}

export interface ResearchStreamState {
  queries: ResearchStreamQueryEvent[];
  sources: ResearchStreamSourceEvent[];
  activeQuery: string | null;
  isStreaming: boolean;
  isComplete: boolean;
  totalQueries: number;
  totalSources: number;
}

export function useResearchStream({
  runId,
  enabled = true,
  result,
}: UseResearchStreamOptions): ResearchStreamState {
  const [queries, setQueries] = useState<ResearchStreamQueryEvent[]>([]);
  const [sources, setSources] = useState<ResearchStreamSourceEvent[]>([]);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !runId || runId.startsWith('run-')) {
      setTimeout(() => setIsStreaming(false), 0);
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const streamUrl = `${baseUrl}${API_ENDPOINTS.ORCHESTRATION.RESEARCH_STREAM(runId)}`;

    let es: EventSource | null = null;
    try {
      es = new EventSource(streamUrl);
      eventSourceRef.current = es;
      setTimeout(() => {
        setIsStreaming(true);
        setIsComplete(false);
      }, 0);

      const handleEvent = (event: MessageEvent) => {
        try {
          const rawData = String(event.data);
          const parsed = JSON.parse(rawData) as {
            event?: string;
            type?: string;
            run_id?: string;
            data?: Record<string, unknown>;
          };

          const eventName = String(event.type ?? parsed.event ?? parsed.type ?? '');

          if (eventName === 'snapshot' && parsed.data) {
            const snap = parsed.data as unknown as {
              queries?: ResearchStreamQueryEvent[];
              sources?: ResearchStreamSourceEvent[];
            };
            if (Array.isArray(snap.queries)) {
              setQueries(snap.queries);
            }
            if (Array.isArray(snap.sources)) {
              setSources(snap.sources);
            }
          } else if (eventName === 'research_query' || parsed.type === 'query') {
            const queryObj = (parsed.data ?? parsed) as unknown as ResearchStreamQueryEvent;
            if (queryObj.query) {
              setQueries((prev) => {
                if (prev.some((q) => q.query === queryObj.query)) return prev;
                return [...prev, queryObj];
              });
              setActiveQuery(queryObj.query);
            }
          } else if (eventName === 'research_source' || parsed.type === 'source') {
            const sourceObj = (parsed.data ?? parsed) as unknown as ResearchStreamSourceEvent;
            if (sourceObj.url) {
              setSources((prev) => {
                if (prev.some((s) => s.url === sourceObj.url)) return prev;
                return [...prev, sourceObj];
              });
            }
          } else if (
            eventName === 'run_completed' ||
            eventName === 'complete' ||
            parsed.type === 'complete'
          ) {
            setIsStreaming(false);
            setIsComplete(true);
            setActiveQuery(null);
            es?.close();
          }
        } catch {
          // Ignore parsing errors
        }
      };

      es.onmessage = handleEvent;
      es.addEventListener('snapshot', handleEvent as EventListener);
      es.addEventListener('research_query', handleEvent as EventListener);
      es.addEventListener('research_source', handleEvent as EventListener);
      es.addEventListener('run_completed', handleEvent as EventListener);

      es.onerror = () => {
        es?.close();
        setTimeout(() => setIsStreaming(false), 0);
      };
    } catch {
      setTimeout(() => setIsStreaming(false), 0);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [runId, enabled]);

  useEffect(() => {
    if (!result) return;

    const realQueries: ResearchStreamQueryEvent[] = [];
    const realSources: ResearchStreamSourceEvent[] = [];
    const now = new Date().toISOString();

    const rawResult = result as unknown as Record<string, unknown>;
    const rawQueries = rawResult.research_queries;
    const rawSources = rawResult.research_sources;

    if (Array.isArray(rawQueries) && rawQueries.length > 0) {
      rawQueries.forEach((item: unknown, idx: number) => {
        const qRecord = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        const queryVal = typeof qRecord.query === 'string' ? qRecord.query : '';
        const agentVal =
          typeof qRecord.agent_name === 'string' ? qRecord.agent_name : 'Market Research Agent';
        const statusVal = typeof qRecord.status === 'string' ? qRecord.status : 'completed';
        const timeVal = typeof qRecord.timestamp === 'string' ? qRecord.timestamp : now;

        realQueries.push({
          type: 'query',
          query: queryVal,
          agent: agentVal,
          agent_name: agentVal,
          status: statusVal,
          index: idx + 1,
          timestamp: timeVal,
        });
      });
    }

    if (Array.isArray(rawSources) && rawSources.length > 0) {
      rawSources.forEach((item: unknown) => {
        const sRecord = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        const urlVal = typeof sRecord.url === 'string' ? sRecord.url : '';
        const titleVal = typeof sRecord.title === 'string' ? sRecord.title : urlVal;
        const snippetVal = typeof sRecord.snippet === 'string' ? sRecord.snippet : undefined;
        const agentVal =
          typeof sRecord.agent_name === 'string' ? sRecord.agent_name : 'Market Research Agent';
        const timeVal = typeof sRecord.timestamp === 'string' ? sRecord.timestamp : now;

        realSources.push({
          type: 'source',
          query: 'Web Research',
          title: titleVal,
          url: urlVal,
          snippet: snippetVal,
          agent: agentVal,
          agent_name: agentVal,
          timestamp: timeVal,
        });
      });
    }

    if (realQueries.length === 0 || realSources.length === 0) {
      const agentResults = result.agent_results;
      const marketData = agentResults?.market_research_agent?.data;
      const ideaData = agentResults?.idea_validation_agent?.data;
      const surveyData = agentResults?.survey_intelligence_agent?.data;

      if (marketData?.target_customer_segments) {
        marketData.target_customer_segments.forEach((segment: string, idx: number) => {
          realQueries.push({
            type: 'query',
            query: `Target Customer Segment & ICP Analysis: "${segment}"`,
            agent: 'Market Research Agent',
            index: idx + 1,
            timestamp: now,
          });
        });
      }

      if (ideaData?.falsifiable_problem_sentence) {
        realQueries.push({
          type: 'query',
          query: `Hypothesis Falsifiability Test: "${ideaData.falsifiable_problem_sentence}"`,
          agent: 'Idea Validation Agent',
          index: realQueries.length + 1,
          timestamp: now,
        });
      }

      if (marketData?.competitor_overview) {
        marketData.competitor_overview.forEach((comp: string) => {
          let url = 'https://axiorapulse.com/research/competitor';
          if (comp.includes('http://') || comp.includes('https://')) {
            const match = /https?:\/\/[^\s]+/.exec(comp);
            if (match) {
              url = match[0];
            }
          }

          realSources.push({
            type: 'source',
            query: marketData.market_opportunity_summary ?? 'Competitor Analysis',
            title: comp.slice(0, 70),
            url,
            snippet: `Market competitor data & positioning analysis: ${comp}`,
            timestamp: now,
          });
        });
      }

      if (marketData?.opportunity_signals) {
        marketData.opportunity_signals.forEach((sig: string, idx: number) => {
          realSources.push({
            type: 'source',
            query: 'Market Opportunity Signals',
            title: `Opportunity Signal #${idx + 1}: ${sig.slice(0, 50)}`,
            url: `https://axiorapulse.com/signals/${idx + 1}`,
            snippet: sig,
            timestamp: now,
          });
        });
      }

      if (surveyData?.questions) {
        surveyData.questions.forEach((q) => {
          realQueries.push({
            type: 'query',
            query: `Survey Hypothesis Validation: "${q.target_hypothesis ?? q.question_text}"`,
            agent: 'Survey Intelligence Agent',
            index: realQueries.length + 1,
            timestamp: now,
          });
        });
      }
    }

    if (realQueries.length > 0) {
      setTimeout(() => setQueries(realQueries), 0);
    }

    if (realSources.length > 0) {
      setTimeout(() => setSources(realSources), 0);
    }
  }, [result]);

  return {
    queries,
    sources,
    activeQuery,
    isStreaming,
    isComplete: isComplete || result !== null,
    totalQueries: queries.length,
    totalSources: sources.length,
  };
}

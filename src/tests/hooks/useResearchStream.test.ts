import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

import type { OrchestrationResult } from '@/types/orchestration.types';
import {
  extractFromValidationResult,
  useResearchStream,
} from '@features/ideaValidation/hooks/useResearchStream';

describe('extractFromValidationResult', () => {
  it('returns empty arrays when result is null', () => {
    expect(extractFromValidationResult(null)).toEqual({ queries: [], sources: [] });
  });

  it('returns empty arrays when result is undefined', () => {
    expect(extractFromValidationResult(undefined)).toEqual({ queries: [], sources: [] });
  });

  it('extracts research_queries and research_sources', () => {
    const result = {
      run_id: 'r1',
      research_queries: [
        {
          query: 'What is the market?',
          agent_name: 'Market',
          status: 'completed',
          timestamp: 't1',
        },
      ],
      research_sources: [
        { url: 'https://example.com', title: 'Example', snippet: 'snip', agent_name: 'Market' },
      ],
      agent_results: {},
    } as unknown as OrchestrationResult;

    const { queries, sources } = extractFromValidationResult(result);
    expect(queries).toHaveLength(1);
    expect(queries[0]?.query).toBe('What is the market?');
    expect(queries[0]?.agent_name).toBe('Market');
    expect(queries[0]?.index).toBe(1);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.url).toBe('https://example.com');
    expect(sources[0]?.title).toBe('Example');
    expect(sources[0]?.snippet).toBe('snip');
  });

  it('applies default agent and status when fields missing', () => {
    const result = {
      run_id: 'r1',
      research_queries: [{ query: 'q' }],
      research_sources: [{ url: 'https://u.com' }],
    } as unknown as OrchestrationResult;
    const { queries, sources } = extractFromValidationResult(result);
    expect(queries[0]?.agent_name).toBe('Market Research Agent');
    expect(queries[0]?.status).toBe('completed');
    expect(sources[0]?.agent_name).toBe('Market Research Agent');
    expect(sources[0]?.title).toBe('https://u.com');
  });

  it('skips query items without a query string', () => {
    const result = {
      research_queries: [{ status: 'completed' }],
      research_sources: [],
    } as unknown as OrchestrationResult;
    const { queries } = extractFromValidationResult(result);
    expect(queries).toHaveLength(0);
  });

  it('falls back to agent results when no raw queries/sources', () => {
    const result = {
      run_id: 'r1',
      agent_results: {
        market_research_agent: {
          data: {
            target_customer_segments: ['Segment A', 'Segment B'],
            competitor_overview: ['Competitor X at https://competitor.com'],
            opportunity_signals: ['Signal 1'],
            market_opportunity_summary: 'Big market',
          },
        },
        idea_validation_agent: {
          data: { falsifiable_problem_sentence: 'The problem is X' },
        },
        survey_intelligence_agent: {
          data: {
            questions: [
              { target_hypothesis: 'H1' },
              { target_hypothesis: null, question_text: 'Fallback question' },
            ],
          },
        },
      },
    } as unknown as OrchestrationResult;

    const { queries, sources } = extractFromValidationResult(result);
    expect(queries.length).toBeGreaterThan(0);
    expect(queries[0]?.query).toContain('Target Customer Segment');
    expect(queries.some((q) => q.query.includes('Hypothesis Falsifiability'))).toBe(true);
    expect(queries.some((q) => q.query.includes('Survey Hypothesis Validation'))).toBe(true);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.title?.includes('Competitor X'))).toBe(true);
    expect(sources.some((s) => s.title?.includes('Opportunity Signal'))).toBe(true);
    expect(sources[0]?.url).toBe('https://competitor.com');
  });

  it('handles competitor entries without a URL', () => {
    const result = {
      agent_results: {
        market_research_agent: {
          data: {
            competitor_overview: ['Plain Competitor'],
          },
        },
      },
    } as unknown as OrchestrationResult;
    const { sources } = extractFromValidationResult(result);
    expect(sources[0]?.url).toBe('https://axiorapulse.com/research/competitor');
  });
});

describe('useResearchStream (legacy)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default empty research state', () => {
    const { result } = renderHook(() =>
      useResearchStream({ runId: 'test-run-123', enabled: true }),
    );

    expect(result.current.totalQueries).toBe(0);
    expect(result.current.totalSources).toBe(0);
  });

  it('extracts real research queries and web sources from backend validation result', () => {
    const mockResult = {
      idea_id: 'idea-1',
      orchestration_run_id: 'run-1',
      validation_score: 85,
      confidence_rating: 0.9,
      verdict: 'build',
      strengths: [],
      risks: [],
      assumptions: [],
      recommendations: [],
      mentor_summary: 'Summary',
      disclaimer: '',
      created_at: '2026-08-18T12:00:00Z',
      agent_results: {
        market_research_agent: {
          score: 85,
          confidence: 0.9,
          model_used: 'gpt-4',
          tokens_input: 100,
          tokens_output: 200,
          executed_at: '2026-08-18T12:00:00Z',
          data: {
            audience_narrowness_score: 80,
            primary_icp_summary: 'ICP',
            secondary_segments: [],
            persona_summary: 'Persona',
            red_flags: [],
            market_opportunity_score: 85,
            market_opportunity_summary: 'Market Opportunity Summary',
            target_customer_segments: ['B2B SaaS Founders', 'Mid-market Tech Product Teams'],
            competitor_overview: ['Competitor A: https://example.com/comp-a', 'Competitor B'],
            opportunity_signals: ['High willingness to pay for validated customer research'],
            risk_signals: [],
            confidence: 0.9,
          },
        },
      },
    };

    const { result } = renderHook(() =>
      useResearchStream({ runId: 'run-1', result: mockResult, enabled: true }),
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.queries.length).toBeGreaterThan(0);
    expect(result.current.sources.length).toBeGreaterThan(0);
    expect(result.current.isComplete).toBe(true);
  });

  it('does not stream when disabled', () => {
    const { result } = renderHook(() =>
      useResearchStream({ runId: 'test-run-123', enabled: false }),
    );

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.totalQueries).toBe(0);
  });
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, cb: (event: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(cb);
  }

  close() {
    this.closed = true;
  }
}

function execListeners(es: MockEventSource, type: string, event: { data: string }) {
  const msg = { data: event.data, type } as unknown as MessageEvent;
  (es.listeners[type] ?? []).forEach((cb) => cb(msg));
  es.onmessage?.(msg);
}

describe('useResearchStream', () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    (global as Record<string, unknown>).EventSource = MockEventSource;
  });

  afterEach(() => {
    delete (global as Record<string, unknown>).EventSource;
  });

  it('returns extracted data when disabled or no streaming runId', () => {
    const result = {
      run_id: 'r1',
      research_queries: [{ query: 'q1' }],
      research_sources: [],
    } as unknown as OrchestrationResult;
    const { result: hookResult } = renderHook(() => useResearchStream({ enabled: false, result }), {
      wrapper: createWrapper(),
    });
    expect(hookResult.current.queries).toHaveLength(1);
    expect(hookResult.current.isComplete).toBe(true);
    expect(hookResult.current.error).toBeNull();
  });

  it('does not connect for run- prefixed ids', () => {
    renderHook(() => useResearchStream({ runId: 'run-123' }), { wrapper: createWrapper() });
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it('connects to stream and applies snapshot event', async () => {
    const { result } = renderHook(() => useResearchStream({ runId: 'abc-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const es = MockEventSource.instances[0];
    if (!es) throw new Error('expected a connected EventSource');
    execListeners(es, 'snapshot', {
      data: JSON.stringify({
        event: 'snapshot',
        data: {
          queries: [{ query: 'snap-q' }],
          sources: [{ url: 'https://s.com', title: 'S' }],
        },
      }),
    });

    await waitFor(() => expect(result.current.queries[0]?.query).toBe('snap-q'));
  });

  it('applies research_query and research_source events', async () => {
    const { result } = renderHook(() => useResearchStream({ runId: 'abc-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const es = MockEventSource.instances[0];
    if (!es) throw new Error('expected a connected EventSource');
    execListeners(es, 'research_query', {
      data: JSON.stringify({ event: 'research_query', data: { query: 'new-q' } }),
    });
    execListeners(es, 'research_source', {
      data: JSON.stringify({
        event: 'research_source',
        data: { url: 'https://x.com', title: 'X' },
      }),
    });

    await waitFor(() => expect(result.current.queries.some((q) => q.query === 'new-q')).toBe(true));
    await waitFor(() =>
      expect(result.current.sources.some((s) => s.url === 'https://x.com')).toBe(true),
    );
    expect(result.current.activeQuery).toBe('new-q');
  });

  it('dedupes duplicate query and source events', async () => {
    const { result } = renderHook(() => useResearchStream({ runId: 'abc-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const es = MockEventSource.instances[0];
    if (!es) throw new Error('expected a connected EventSource');
    execListeners(es, 'research_query', {
      data: JSON.stringify({ event: 'research_query', data: { query: 'dup' } }),
    });
    execListeners(es, 'research_query', {
      data: JSON.stringify({ event: 'research_query', data: { query: 'dup' } }),
    });

    await waitFor(() =>
      expect(result.current.queries.filter((q) => q.query === 'dup')).toHaveLength(1),
    );
  });

  it('handles run_completed event', async () => {
    const { result } = renderHook(() => useResearchStream({ runId: 'abc-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const es = MockEventSource.instances[0];
    if (!es) throw new Error('expected a connected EventSource');
    execListeners(es, 'run_completed', {
      data: JSON.stringify({ event: 'run_completed' }),
    });

    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(result.current.isStreaming).toBe(false);
    expect(es.closed).toBe(true);
  });

  it('sets error on onerror', async () => {
    const { result } = renderHook(() => useResearchStream({ runId: 'abc-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const es = MockEventSource.instances[0];
    if (!es) throw new Error('expected a connected EventSource');
    es.onerror?.();

    await waitFor(() => expect(result.current.error).toBe('Web search failed. Please try again.'));
  });
});

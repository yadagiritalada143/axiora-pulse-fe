import { renderHook, act } from '@testing-library/react';

import { useResearchStream } from '@features/ideaValidation/hooks/useResearchStream';

describe('useResearchStream', () => {
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

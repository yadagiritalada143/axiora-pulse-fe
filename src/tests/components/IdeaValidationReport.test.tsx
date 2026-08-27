import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { IdeaValidationReport } from '@features/ideaValidation/components/IdeaValidationReport';
import {
  useDownloadCertificate,
  useExportWorkspaceReport,
} from '@features/workspace/hooks/useWorkspaceMentor';

jest.mock('@features/workspace/hooks/useWorkspaceMentor', () => ({
  useExportWorkspaceReport: jest.fn(),
  useDownloadCertificate: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

const mockedUseExportWorkspaceReport = useExportWorkspaceReport as jest.Mock;
const mockedUseDownloadCertificate = useDownloadCertificate as jest.Mock;

const RESPONSE: OrchestrationRunResponse = {
  run_id: 'run-1',
  workspace_id: '1',
  idea_id: '1',
  workflow_type: 'idea_validation',
  status: 'completed',
  error: null,
  started_at: '2026-01-01T00:00:00.000Z',
  completed_at: '2026-01-01T00:01:00.000Z',
  result: {
    idea_id: '1',
    orchestration_run_id: 'run-1',
    validation_score: 82,
    confidence_rating: 0.9,
    verdict: 'build',
    strengths: ['Clear problem statement', 'Large addressable market'],
    risks: ['High customer acquisition cost'],
    assumptions: ['Retailers are willing to pay monthly'],
    recommendations: ['Run a pilot with 3 retailers'],
    agent_results: {
      idea_validation_agent: {
        score: 80,
        confidence: 0.9,
        data: {
          problem_clarity_score: 80,
          falsifiable_problem_sentence: 'Retailers lose 10% of revenue to stockouts monthly.',
          problem_statement_summary: 'Retailers struggle with demand forecasting.',
          pain_type_classification: 'painkiller',
          who_and_frequency: 'SMB retailers and warehouse managers, weekly.',
          current_workarounds: ['Manual spreadsheets'],
          assumption_list: ['Retailers track inventory digitally'],
          red_flags: [],
          initial_recommendation: 'proceed_to_validation',
          confidence: 0.9,
        },
        model_used: 'gpt-pulse',
        tokens_input: 100,
        tokens_output: 200,
        executed_at: '2026-01-01T00:00:30.000Z',
      },
      market_research_agent: {
        score: 75,
        confidence: 0.85,
        data: {
          audience_narrowness_score: 70,
          primary_icp_summary: 'Independent grocery stores with 2-10 locations.',
          secondary_segments: ['Pharmacies'],
          persona_summary: 'Owner-operator who manages inventory manually.',
          red_flags: [],
          market_opportunity_score: 78,
          market_opportunity_summary: 'Growing demand for AI-driven inventory tools.',
          target_customer_segments: ['Independent grocers'],
          competitor_overview: ['Legacy ERP vendors'],
          opportunity_signals: ['Rising SaaS adoption in retail'],
          risk_signals: ['Long sales cycles'],
          confidence: 0.85,
        },
        model_used: 'gpt-pulse',
        tokens_input: 110,
        tokens_output: 210,
        executed_at: '2026-01-01T00:00:45.000Z',
      },
      survey_intelligence_agent: {
        score: 72,
        confidence: 0.7,
        data: {
          survey_title: 'Inventory Pain Point Survey',
          survey_objective: 'Validate willingness to pay for automated forecasting.',
          target_audience_summary: 'Independent grocery store owners.',
          questions: [
            {
              question_text: 'How do you currently forecast demand?',
              question_type: 'open_ended',
              target_hypothesis: 'Verify manual workaround usage.',
            },
          ],
          survey_quality_score: 72,
          confidence: 0.7,
          disclaimer: 'AI generated survey guidance.',
        },
        model_used: 'gpt-pulse',
        tokens_input: 90,
        tokens_output: 180,
        executed_at: '2026-01-01T00:01:00.000Z',
      },
    },
    mentor_summary: 'This idea shows strong signal for a pilot launch.',
    disclaimer: 'This report is AI-generated guidance, not investment advice.',
    created_at: '2026-01-01T00:00:00.000Z',
  },
};

describe('IdeaValidationReport', () => {
  beforeEach(() => {
    mockedUseExportWorkspaceReport.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockedUseDownloadCertificate.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the aggregate score, verdict, and summary sections', () => {
    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={RESPONSE}
        onRetake={jest.fn()}
      />,
    );

    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('build')).toBeInTheDocument();
    expect(screen.getByText('Confidence 90%')).toBeInTheDocument();

    expect(screen.getByText('Clear problem statement')).toBeInTheDocument();
    expect(screen.getByText('High customer acquisition cost')).toBeInTheDocument();
    expect(screen.getByText('Retailers are willing to pay monthly')).toBeInTheDocument();
    expect(screen.getByText('Run a pilot with 3 retailers')).toBeInTheDocument();

    expect(
      screen.getByText('This idea shows strong signal for a pilot launch.'),
    ).toBeInTheDocument();
  });

  it('renders a dedicated section for each completed agent', () => {
    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={RESPONSE}
        onRetake={jest.fn()}
      />,
    );

    // Idea Validation
    expect(screen.getByText('Retailers struggle with demand forecasting.')).toBeInTheDocument();
    expect(
      screen.getByText('Retailers lose 10% of revenue to stockouts monthly.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Manual spreadsheets')).toBeInTheDocument();

    // Market Research
    expect(screen.getByText('Independent grocery stores with 2-10 locations.')).toBeInTheDocument();
    expect(screen.getByText('Growing demand for AI-driven inventory tools.')).toBeInTheDocument();
    expect(screen.getByText('Legacy ERP vendors')).toBeInTheDocument();

    // Survey Intelligence
    expect(screen.getByText('Inventory Pain Point Survey')).toBeInTheDocument();
    expect(screen.getByText(/how do you currently forecast demand\?/i)).toBeInTheDocument();
  });

  it('exports each agent report independently as a PDF', async () => {
    const mutate = jest.fn();
    mockedUseExportWorkspaceReport.mockReturnValue({ mutate, isPending: false });
    const user = userEvent.setup();

    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={RESPONSE}
        onRetake={jest.fn()}
      />,
    );

    const exportButtons = screen.getAllByRole('button', { name: /export/i });
    const [ideaValidationExport, marketResearchExport, surveyIntelligenceExport] = exportButtons;
    if (!ideaValidationExport || !marketResearchExport || !surveyIntelligenceExport) {
      throw new Error('Expected three per-agent export buttons');
    }

    await user.click(ideaValidationExport);
    expect(mutate).toHaveBeenLastCalledWith(
      { agent_name: 'idea_validation_agent', format: 'pdf' },
      expect.objectContaining({ onError: expect.any(Function) as unknown }),
    );

    await user.click(marketResearchExport);
    expect(mutate).toHaveBeenLastCalledWith(
      { agent_name: 'market_research_agent', format: 'pdf' },
      expect.objectContaining({ onError: expect.any(Function) as unknown }),
    );

    await user.click(surveyIntelligenceExport);
    expect(mutate).toHaveBeenLastCalledWith(
      { agent_name: 'survey_intelligence_agent', format: 'pdf' },
      expect.objectContaining({ onError: expect.any(Function) as unknown }),
    );

    expect(mutate).toHaveBeenCalledTimes(3);
  });

  it('calls onRetake when the Retake button is clicked', async () => {
    const onRetake = jest.fn();
    const user = userEvent.setup();
    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={RESPONSE}
        onRetake={onRetake}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Retake' }));

    expect(onRetake).toHaveBeenCalledTimes(1);
  });

  it('renders a failure message and no agent sections when the orchestration run has no result', () => {
    const failedResponse: OrchestrationRunResponse = {
      ...RESPONSE,
      status: 'failed',
      result: null,
      error: 'The orchestration workflow timed out.',
    };

    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={failedResponse}
        onRetake={jest.fn()}
      />,
    );

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('The orchestration workflow timed out.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
  });

  it('does not crash when the LLM-backed agent output omits or malforms list fields', () => {
    const baseResult = RESPONSE.result;
    if (!baseResult) {
      throw new Error('Expected the fixture response to have a result');
    }
    const { idea_validation_agent, market_research_agent, survey_intelligence_agent } =
      baseResult.agent_results;
    if (!idea_validation_agent || !market_research_agent || !survey_intelligence_agent) {
      throw new Error('Expected the fixture response to have all three agent results');
    }

    // Agent output has no strict runtime schema on the backend - a field typed as
    // string[] can still arrive as null, undefined, or entirely missing.
    const malformedResponse = {
      ...RESPONSE,
      result: {
        ...baseResult,
        strengths: null,
        risks: undefined,
        agent_results: {
          idea_validation_agent: {
            ...idea_validation_agent,
            data: {
              ...idea_validation_agent.data,
              current_workarounds: null,
              assumption_list: undefined,
            },
          },
          market_research_agent: {
            ...market_research_agent,
            data: {
              ...market_research_agent.data,
              target_customer_segments: null,
            },
          },
          survey_intelligence_agent: {
            ...survey_intelligence_agent,
            data: {
              ...survey_intelligence_agent.data,
              questions: null,
            },
          },
        },
      },
    } as unknown as OrchestrationRunResponse;

    expect(() =>
      render(
        <IdeaValidationReport
          workspaceId={1}
          ideaTitle="Inventory AI"
          response={malformedResponse}
          onRetake={jest.fn()}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText('Idea Validation Report')).toBeInTheDocument();
  });

  it('renders a readable string when a list field is an object instead of a string', () => {
    const baseResult = RESPONSE.result;
    if (!baseResult) {
      throw new Error('Expected the fixture response to have a result');
    }
    const { market_research_agent } = baseResult.agent_results;
    if (!market_research_agent) {
      throw new Error('Expected the fixture response to have a market_research_agent result');
    }

    // The model doesn't always follow the "return a plain string per segment"
    // instruction - it can return a structured object instead.
    const responseWithObjectSegment = {
      ...RESPONSE,
      result: {
        ...baseResult,
        agent_results: {
          ...baseResult.agent_results,
          market_research_agent: {
            ...market_research_agent,
            data: {
              ...market_research_agent.data,
              target_customer_segments: [
                {
                  segment: 'Independent grocery stores',
                  early_adopter_traits: 'Tech-savvy owner-operators',
                  buyer_motivation: 'Reduce stockouts',
                },
              ],
            },
          },
        },
      },
    } as unknown as OrchestrationRunResponse;

    expect(() =>
      render(
        <IdeaValidationReport
          workspaceId={1}
          ideaTitle="Inventory AI"
          response={responseWithObjectSegment}
          onRetake={jest.fn()}
        />,
      ),
    ).not.toThrow();

    expect(
      screen.getByText(
        'Independent grocery stores — Tech-savvy owner-operators — Reduce stockouts',
      ),
    ).toBeInTheDocument();
  });

  it('shows an error toast when an export request fails', async () => {
    mockedUseExportWorkspaceReport.mockReturnValue({
      mutate: (
        _payload: { agent_name: string; format: string },
        options?: { onError?: () => void },
      ) => options?.onError?.(),
      isPending: false,
    });
    const user = userEvent.setup();

    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={RESPONSE}
        onRetake={jest.fn()}
      />,
    );

    const [firstExportButton] = screen.getAllByRole('button', { name: /export/i });
    if (!firstExportButton) {
      throw new Error('Expected at least one export button');
    }
    await user.click(firstExportButton);

    expect(toast.error).toHaveBeenCalledWith('Failed to export the report. Please try again.');
  });

  it('stringifies a non-string, non-object list item', () => {
    const baseResult = RESPONSE.result;
    if (!baseResult) {
      throw new Error('Expected the fixture response to have a result');
    }

    const responseWithNumericStrength = {
      ...RESPONSE,
      result: {
        ...baseResult,
        strengths: [42],
      },
    } as unknown as OrchestrationRunResponse;

    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={responseWithNumericStrength}
        onRetake={jest.fn()}
      />,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders certificate of completion card and triggers certificate download on click', async () => {
    const user = userEvent.setup();
    const mockDownloadMutate = jest.fn();
    mockedUseDownloadCertificate.mockReturnValue({
      mutate: mockDownloadMutate,
      isPending: false,
    });

    render(
      <IdeaValidationReport
        workspaceId={1}
        ideaTitle="Inventory AI"
        response={RESPONSE}
        onRetake={jest.fn()}
      />,
    );

    expect(screen.getByText('Certificate of Completion')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();

    const certButtons = screen.getAllByRole('button', { name: /download certificate/i });
    expect(certButtons.length).toBeGreaterThanOrEqual(1);

    const firstCertButton = certButtons[0];
    if (!firstCertButton) {
      throw new Error('Expected at least one certificate button');
    }
    await user.click(firstCertButton);

    expect(mockDownloadMutate).toHaveBeenCalledTimes(1);
  });
});

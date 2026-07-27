import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { IdeaValidationReport } from '@features/ideaValidation/components/IdeaValidationReport';
import { useExportWorkspaceReport } from '@features/workspace/hooks/useWorkspaceMentor';

jest.mock('@features/workspace/hooks/useWorkspaceMentor', () => ({
  useExportWorkspaceReport: jest.fn(),
}));

const mockedUseExportWorkspaceReport = useExportWorkspaceReport as jest.Mock;

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
      clarity_agent: {
        score: 80,
        confidence: 0.9,
        data: {
          idea_clarity_score: 80,
          problem_summary: 'Retailers struggle with demand forecasting.',
          customer_hypothesis: 'SMB retailers and warehouse managers.',
          key_assumptions: ['Retailers track inventory digitally'],
          red_flags: [],
          initial_recommendation: 'Proceed to pilot',
          confidence: 0.9,
          disclaimer: 'AI generated',
        },
        model_used: 'gpt-pulse',
        tokens_input: 100,
        tokens_output: 200,
        executed_at: '2026-01-01T00:00:30.000Z',
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the validation score, verdict, and report sections from the response', () => {
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

    expect(screen.getByText('Retailers struggle with demand forecasting.')).toBeInTheDocument();
    expect(screen.getByText('SMB retailers and warehouse managers.')).toBeInTheDocument();

    expect(screen.getByText('Clear problem statement')).toBeInTheDocument();
    expect(screen.getByText('High customer acquisition cost')).toBeInTheDocument();
    expect(screen.getByText('Retailers are willing to pay monthly')).toBeInTheDocument();
    expect(screen.getByText('Run a pilot with 3 retailers')).toBeInTheDocument();

    expect(
      screen.getByText('This idea shows strong signal for a pilot launch.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This report is AI-generated guidance, not investment advice.'),
    ).toBeInTheDocument();
  });

  it('exports the full report as a PDF when the Export button is clicked', async () => {
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

    await user.click(screen.getByRole('button', { name: /export/i }));

    expect(mutate).toHaveBeenCalledWith(
      { agent_name: 'full', format: 'pdf' },
      expect.objectContaining({ onError: expect.any(Function) as unknown }),
    );
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

  it('renders a failure message when the orchestration run has no result', () => {
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
  });
});

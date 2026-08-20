import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { SurveyAnalysisReport } from '@/features/survey/components/SurveyAnalysisReport';
import { useRunSurveyAnalysis, useSurveyAnalysis } from '@/features/survey/hooks/useSurveys';
import type { SurveyAnalysisResult, SurveyResponse } from '@/features/survey/types';

jest.mock('@/features/survey/hooks/useSurveys', () => ({
  useSurveyAnalysis: jest.fn(),
  useRunSurveyAnalysis: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedUseSurveyAnalysis = useSurveyAnalysis as jest.Mock;
const mockedUseRunSurveyAnalysis = useRunSurveyAnalysis as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

const baseSurvey: SurveyResponse = {
  id: 5,
  user_id: 1,
  workspace_id: 42,
  public_token: 'abc123token',
  survey_link: null,
  questions: [{ id: 1, question: 'What is your challenge?', questionType: 'text', options: [] }],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

const fullAnalysis: SurveyAnalysisResult = {
  analysis_id: 'sa-101',
  survey_id: 5,
  analysis_timestamp: '2026-01-04T12:00:00.000Z',
  purpose: 'Customer Discovery and Problem Validation',
  executive_summary: 'Target customers strongly validate the core manual workflow bottleneck.',
  target_population: {
    definition: 'B2B Sales Leaders & Ops Managers',
  },
  data_quality: {
    response_quality_score: 92,
    response_reliability_score: 88,
    sample_quality_score: 85,
    fraud_risk_score: 5,
  },
  validation: {
    validation_confidence_score: 94,
    evidence_strength_score: 90,
    problems: [
      {
        problem_statement: 'Manual lead data enrichment takes over 5 hours per week',
        status: 'validated',
        confidence_score: 95,
        evidence_for: ['85% of respondents cite lost productivity'],
      },
    ],
    segments: [
      {
        segment_name: 'Mid-Market SaaS Ops',
        status: 'validated',
        confidence_score: 90,
      },
    ],
    adoption_readiness: [
      {
        readiness_level: 'High Readiness',
        drivers: ['Immediate ROI', 'Time savings'],
        barriers: ['Security compliance approval'],
      },
    ],
    problem_solution_fit_indicators: ['Strong willingness to trial automated workflows'],
  },
  customer_intelligence: {
    pain_points: [
      {
        pain_point: 'Repetitive copy-pasting across CRMs',
        severity: 'High',
        description: 'Team loses half a day every Friday manually synchronizing deals',
      },
    ],
    sentiment: [
      {
        summary: 'High frustration with existing manual tooling; eager for automation',
      },
    ],
    objections: [
      {
        objection: 'Migration complexity from legacy CRM',
      },
    ],
  },
  recommendations: [
    {
      recommended_action: 'Position as a 1-click CRM auto-enrichment engine',
      rationale: 'Addresses primary frustration without requiring workflow overhaul',
      priority: 'High',
    },
  ],
  gtm_handoff: {
    priority_segments: ['Mid-Market Sales Ops'],
    value_proposition_implications: ['Save 5+ hours weekly per rep'],
    feature_priorities: ['Native CRM Sync'],
    adoption_barriers: ['Security Reviews'],
  },
};

describe('SurveyAnalysisReport', () => {
  beforeEach(() => {
    mockedUseSurveyAnalysis.mockReturnValue({ data: undefined, isLoading: false });
    mockedUseRunSurveyAnalysis.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a loading spinner while analysis query is loading', () => {
    mockedUseSurveyAnalysis.mockReturnValue({ data: undefined, isLoading: true });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={0} />);

    expect(screen.getByText('Loading survey intelligence data...')).toBeInTheDocument();
  });

  it('renders the empty state and disabled button when 0 responses are collected', () => {
    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={0} />);

    expect(screen.getByText('No Response Analysis Available Yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run AI Analysis/i })).toBeDisabled();
    expect(screen.getByText('0 responses')).toBeInTheDocument();
  });

  it('enables the Run AI Analysis button when responses >= 1', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_payload, options) => options?.onSuccess?.());
    mockedUseRunSurveyAnalysis.mockReturnValue({ mutate, isPending: false });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={3} />);

    const runBtn = screen.getByRole('button', { name: /^Run AI Analysis$/i });
    expect(runBtn).toBeEnabled();

    await user.click(runBtn);

    expect(mutate).toHaveBeenCalled();
    expect(mockedToast.success).toHaveBeenCalledWith(
      'Survey response intelligence analysis completed!',
    );
  });

  it('shows in-flight synthesizing banner when analysis mutation is pending', () => {
    mockedUseRunSurveyAnalysis.mockReturnValue({ mutate: jest.fn(), isPending: true });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={3} />);

    expect(screen.getByText('Synthesizing Market Intelligence...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyzing Responses.../i })).toBeDisabled();
  });

  it('renders full analysis metrics, validation status, pain points and GTM recommendations', () => {
    mockedUseSurveyAnalysis.mockReturnValue({
      data: { survey_id: 5, status: 'success', analysis_result: fullAnalysis },
      isLoading: false,
    });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={10} />);

    // Top Header & Summary
    expect(screen.getByText(/Survey Response Intelligence/i)).toBeInTheDocument();
    expect(
      screen.getByText('Target customers strongly validate the core manual workflow bottleneck.'),
    ).toBeInTheDocument();

    // Scorecards
    expect(screen.getByText('92%')).toBeInTheDocument(); // Quality
    expect(screen.getByText('94%')).toBeInTheDocument(); // Confidence
    expect(screen.getByText('90%')).toBeInTheDocument(); // Evidence strength
    expect(screen.getByText('88%')).toBeInTheDocument(); // Reliability
    expect(screen.getByText('5%')).toBeInTheDocument(); // Fraud Risk

    // Validated Problems
    expect(
      screen.getByText('Manual lead data enrichment takes over 5 hours per week'),
    ).toBeInTheDocument();
    expect(screen.getByText('85% of respondents cite lost productivity')).toBeInTheDocument();

    // Persona Fit
    expect(screen.getByText('Mid-Market SaaS Ops')).toBeInTheDocument();
    expect(screen.getByText(/High Readiness/i)).toBeInTheDocument();

    // Pain Points & Sentiment
    expect(screen.getByText('Repetitive copy-pasting across CRMs')).toBeInTheDocument();
    expect(
      screen.getByText(/Team loses half a day every Friday manually synchronizing deals/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/High frustration with existing manual tooling/i)).toBeInTheDocument();
    expect(screen.getByText('Migration complexity from legacy CRM')).toBeInTheDocument();

    // Recommendations & GTM
    expect(
      screen.getByText('Position as a 1-click CRM auto-enrichment engine'),
    ).toBeInTheDocument();
    expect(screen.getByText('Save 5+ hours weekly per rep')).toBeInTheDocument();
  });

  it('handles mutation error and displays toast', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_payload, options) =>
      options?.onError?.({ response: { data: { detail: 'API Rate limit exceeded' } } }),
    );
    mockedUseRunSurveyAnalysis.mockReturnValue({ mutate, isPending: false });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={2} />);

    await user.click(screen.getByRole('button', { name: /^Run AI Analysis$/i }));

    expect(mockedToast.error).toHaveBeenCalledWith('API Rate limit exceeded');
  });

  it('safely renders backend canonical insight dictionaries without React child object errors', () => {
    const canonicalInsightAnalysis: SurveyAnalysisResult = {
      analysis_id: 'sa-202',
      survey_id: 5,
      analysis_timestamp: '2026-01-04T12:00:00.000Z',
      purpose: 'Customer Discovery',
      executive_summary: 'Full canonical validation passed',
      data_quality: {
        response_quality_score: 95,
        exclusion_reasons: [
          {
            insight_id: 'ex-1',
            capability_id: 'SI.18',
            type: 'fraud',
            statement: 'IP similarity detected',
            status: 'quarantined',
          },
        ],
      },
      validation: {
        problems: [
          {
            insight_id: 'in-1',
            capability_id: 'SI.34',
            type: 'problem',
            statement: 'High manual overhead in data reconciliation',
            status: 'validated',
            affected_segment: 'Enterprise Finance Ops',
            frequency_or_magnitude: 'Daily',
            supporting_evidence: [
              {
                insight_id: 'ev-1',
                statement: '70% of respondents spend 3+ hours daily reconciling ledger errors',
              },
            ],
            opposing_evidence: [
              {
                insight_id: 'op-1',
                statement: 'Smaller teams use spreadsheet macros with minimal complaints',
              },
            ],
            sample_basis: 15,
            confidence_score: 91,
            confidence_band: 'very-high',
            limitations: ['Limited to North America sample'],
            business_implication: 'Huge willingness to pay for automated ledger sync',
            recommended_action: 'Prioritize automated reconciliation connectors in Q3',
          },
        ],
        segments: [
          {
            insight_id: 'seg-1',
            capability_id: 'SI.32',
            statement: 'Enterprise Finance Ops',
            status: 'validated',
            confidence_score: 89,
          },
        ],
        adoption_readiness: [
          {
            insight_id: 'ar-1',
            statement: 'High Adoption Intent',
            drivers: [
              {
                insight_id: 'dr-1',
                statement: 'Time savings and error reduction',
              },
            ],
            barriers: [
              {
                insight_id: 'ba-1',
                statement: 'SOC2 Type II compliance requirement',
              },
            ],
          },
        ],
        problem_solution_fit_indicators: [
          {
            insight_id: 'fit-1',
            statement: 'Strong willingness to pay confirmed by 80% of segment',
          },
        ],
      },
      customer_intelligence: {
        pain_points: [
          {
            insight_id: 'pp-1',
            capability_id: 'SI.25',
            statement: 'Repetitive reconciliation errors',
            severity: 'Critical',
            description: 'Manual ledger typing leads to costly reconciliation gaps',
          },
        ],
        sentiment: [
          {
            insight_id: 'st-1',
            capability_id: 'SI.24',
            statement: 'Highly motivated to replace legacy manual tooling',
          },
        ],
        objections: [
          {
            insight_id: 'obj-1',
            capability_id: 'SI.31',
            statement: 'Security clearance process takes 6+ weeks',
          },
        ],
      },
      recommendations: [
        {
          insight_id: 'rec-1',
          capability_id: 'SI.44',
          statement: 'Ship automated bank-to-ledger sync integration',
          status: 'recommendation',
          priority: 'High',
          business_implication: 'Addresses 85% of primary objections from CFO buyers',
          recommended_action: 'Build pilot program with 5 design partners',
        },
      ],
      gtm_handoff: {
        priority_segments: [
          {
            insight_id: 'gtm-1',
            statement: 'Mid-Market & Enterprise Finance Teams',
          },
        ],
        value_proposition_implications: [
          {
            insight_id: 'gtm-2',
            statement: 'Eliminate 15+ manual accounting hours per week',
          },
        ],
        feature_priorities: [
          {
            insight_id: 'gtm-3',
            statement: 'Instant QuickBooks and NetSuite sync',
          },
        ],
        adoption_barriers: [
          {
            insight_id: 'gtm-4',
            statement: 'Enterprise SSO and SOC2 audits required',
          },
        ],
      },
    };

    mockedUseSurveyAnalysis.mockReturnValue({
      data: { survey_id: 5, status: 'success', analysis_result: canonicalInsightAnalysis },
      isLoading: false,
    });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={5} />);

    // Problem statements & rich insight fields rendered without throwing
    expect(screen.getByText('High manual overhead in data reconciliation')).toBeInTheDocument();
    expect(
      screen.getByText('70% of respondents spend 3+ hours daily reconciling ledger errors'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Smaller teams use spreadsheet macros with minimal complaints'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Huge willingness to pay for automated ledger sync/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Prioritize automated reconciliation connectors in Q3/i),
    ).toBeInTheDocument();

    // Segments & readiness
    expect(screen.getByText('Enterprise Finance Ops')).toBeInTheDocument();
    expect(screen.getByText('High Adoption Intent')).toBeInTheDocument();
    expect(screen.getByText(/Time savings and error reduction/i)).toBeInTheDocument();
    expect(screen.getByText(/SOC2 Type II compliance requirement/i)).toBeInTheDocument();

    // Customer Intelligence & GTM
    expect(screen.getByText('Repetitive reconciliation errors')).toBeInTheDocument();
    expect(
      screen.getByText('Highly motivated to replace legacy manual tooling'),
    ).toBeInTheDocument();
    expect(screen.getByText('Security clearance process takes 6+ weeks')).toBeInTheDocument();
    expect(screen.getByText('Ship automated bank-to-ledger sync integration')).toBeInTheDocument();
    expect(screen.getByText('Mid-Market & Enterprise Finance Teams')).toBeInTheDocument();
    expect(screen.getByText('Instant QuickBooks and NetSuite sync')).toBeInTheDocument();
  });
});

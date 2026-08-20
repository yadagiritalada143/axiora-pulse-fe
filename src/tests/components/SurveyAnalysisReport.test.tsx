import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { surveyService } from '@/features/survey/api/survey.service';
import { SurveyAnalysisReport } from '@/features/survey/components/SurveyAnalysisReport';
import { useRunSurveyAnalysis, useSurveyAnalysis } from '@/features/survey/hooks/useSurveys';
import type { SurveyAnalysisResult, SurveyResponse } from '@/features/survey/types';

jest.mock('@/features/survey/hooks/useSurveys', () => ({
  useSurveyAnalysis: jest.fn(),
  useRunSurveyAnalysis: jest.fn(),
}));

jest.mock('@/features/survey/api/survey.service', () => ({
  surveyService: {
    downloadAgentReport: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const mockedUseSurveyAnalysis = useSurveyAnalysis as jest.Mock;
const mockedUseRunSurveyAnalysis = useRunSurveyAnalysis as jest.Mock;
const mockedSurveyService = surveyService as jest.Mocked<typeof surveyService>;
const mockedToast = toast;

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

    expect(screen.getByText('Loading Arya analysis data...')).toBeInTheDocument();
  });

  it('renders the empty state and disabled button when 0 responses are collected', () => {
    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={0} />);

    expect(screen.getByText('No Response Analysis Available Yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Arya Analysis/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Share Survey Link/i })).toBeInTheDocument();
  });

  it('enables the Run Arya Analysis button when responses >= 1', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_payload, options) => options?.onSuccess?.());
    mockedUseRunSurveyAnalysis.mockReturnValue({ mutate, isPending: false });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={3} />);

    const runBtn = screen.getByRole('button', { name: /^Run Arya Analysis$/i });
    expect(runBtn).toBeEnabled();

    await user.click(runBtn);

    expect(mutate).toHaveBeenCalled();
    expect(mockedToast.success).toHaveBeenCalledWith('Arya survey analysis completed!');
  });

  it('shows in-flight synthesizing banner when analysis mutation is pending', () => {
    mockedUseRunSurveyAnalysis.mockReturnValue({ mutate: jest.fn(), isPending: true });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={3} />);

    expect(screen.getByText('Arya is synthesizing market intelligence...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyzing.../i })).toBeDisabled();
  });

  it('renders executive decision sections: Overall Result, Key Findings, Problem & Demand Validation, Needs, and Next Steps', () => {
    mockedUseSurveyAnalysis.mockReturnValue({
      data: { survey_id: 5, status: 'success', analysis_result: fullAnalysis },
      isLoading: false,
    });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={10} />);

    // Top Header & Summary
    expect(screen.getByText('Survey Analysis')).toBeInTheDocument();
    expect(screen.getByText('Arya Intelligence')).toBeInTheDocument();
    expect(
      screen.getByText('Target customers strongly validate the core manual workflow bottleneck.'),
    ).toBeInTheDocument();

    // 10 Core Decision Sections
    expect(screen.getByText('Key Findings')).toBeInTheDocument();
    expect(screen.getByText('Freshness appears important')).toBeInTheDocument();
    expect(screen.getByText('Consistency may be a pain point')).toBeInTheDocument();
    expect(screen.getByText('Repeat purchasing exists')).toBeInTheDocument();
    expect(screen.getByText('Existing alternatives are satisfying')).toBeInTheDocument();

    // Problem Validation
    expect(screen.getByText('Problem Validation')).toBeInTheDocument();
    expect(
      screen.getByText('Manual lead data enrichment takes over 5 hours per week'),
    ).toBeInTheDocument();

    // Demand Validation
    expect(screen.getByText('Demand Validation')).toBeInTheDocument();
    expect(screen.getByText('What we observed')).toBeInTheDocument();
    expect(screen.getByText("What we don't know")).toBeInTheDocument();

    // Customer Needs & Value Proposition
    expect(screen.getByText('What Customers May Need')).toBeInTheDocument();
    expect(screen.getByText('Freshness')).toBeInTheDocument();
    expect(screen.getByText('Consistent taste')).toBeInTheDocument();
    expect(screen.getByText('Affordable value')).toBeInTheDocument();
    expect(screen.getByText('Value Proposition to Test')).toBeInTheDocument();
    expect(screen.getByText(/Save 5\+ hours weekly per rep/i)).toBeInTheDocument();

    // Still Unknown & What To Do Next
    expect(screen.getByText('Still Unknown (Validation Gaps)')).toBeInTheDocument();
    expect(screen.getByText('What To Do Next')).toBeInTheDocument();
    expect(screen.getByText('Collect More Responses')).toBeInTheDocument();
    expect(screen.getByText('Measure Switching Intent')).toBeInTheDocument();
  });

  it('toggles collapsible technical methodology details in the footer', () => {
    mockedUseSurveyAnalysis.mockReturnValue({
      data: { survey_id: 5, status: 'success', analysis_result: fullAnalysis },
      isLoading: false,
    });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={1} />);

    const toggleBtn = screen.getByRole('button', {
      name: /Analysis Details & Technical Methodology/i,
    });
    expect(screen.queryByText('Response Completeness')).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText('Response Completeness')).toBeInTheDocument();
    expect(screen.getByText('Known Limitations')).toBeInTheDocument();
  });

  it('handles navigation callback when action buttons are clicked', () => {
    mockedUseSurveyAnalysis.mockReturnValue({
      data: { survey_id: 5, status: 'success', analysis_result: fullAnalysis },
      isLoading: false,
    });

    const mockNavigate = jest.fn();
    const mockShare = jest.fn();

    render(
      <SurveyAnalysisReport
        survey={baseSurvey}
        workspaceId={42}
        totalResponses={5}
        onNavigateTab={mockNavigate}
        onOpenShare={mockShare}
      />,
    );

    const addQuestionBtn = screen.getByRole('button', { name: /Add Question/i });
    fireEvent.click(addQuestionBtn);
    expect(mockNavigate).toHaveBeenCalledWith('editor');

    const collectResponsesBtn = screen.getByRole('button', { name: /^Collect Responses$/i });
    fireEvent.click(collectResponsesBtn);
    expect(mockShare).toHaveBeenCalled();
  });

  it('downloads the agent PDF report when Export Report is clicked', async () => {
    const user = userEvent.setup();
    const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/mock-uuid');
    const mockRevokeObjectURL = jest.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    mockedUseSurveyAnalysis.mockReturnValue({
      data: { survey_id: 5, status: 'success', analysis_result: fullAnalysis },
      isLoading: false,
    });

    const fakeBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
    mockedSurveyService.downloadAgentReport.mockResolvedValueOnce({
      blob: fakeBlob,
      filename: 'survey_intelligence_report_42.pdf',
    });

    render(<SurveyAnalysisReport survey={baseSurvey} workspaceId={42} totalResponses={5} />);

    const exportBtn = screen.getByRole('button', { name: /Export Report/i });
    await user.click(exportBtn);

    expect(mockedSurveyService.downloadAgentReport).toHaveBeenCalledWith(
      42,
      'survey_intelligence_agent',
      'pdf',
    );
    expect(mockCreateObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
    expect(mockedToast.success).toHaveBeenCalledWith(
      'Survey intelligence report downloaded successfully.',
    );
  });
});

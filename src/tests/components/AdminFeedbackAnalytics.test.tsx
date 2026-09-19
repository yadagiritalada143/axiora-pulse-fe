import { render, screen } from '@testing-library/react';

import type { AdminUserFeedbackItem, FeedbackQuestion } from '@/types/feedback.types';
import { AdminFeedbackAnalytics } from '@features/feedback/components/admin/AdminFeedbackAnalytics';
import {
  useAdminFeedbackQuestions,
  useAdminUserFeedbackSubmissions,
} from '@features/feedback/hooks/useFeedback';

jest.mock('@features/feedback/hooks/useFeedback', () => ({
  useAdminFeedbackQuestions: jest.fn(),
  useAdminUserFeedbackSubmissions: jest.fn(),
}));

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: '400px', height: '200px' }}>{children}</div>
    ),
  };
});

const mockedUseAdminFeedbackQuestions = useAdminFeedbackQuestions as jest.Mock;
const mockedUseAdminUserFeedbackSubmissions = useAdminUserFeedbackSubmissions as jest.Mock;

const mockQuestions: FeedbackQuestion[] = [
  {
    id: 1,
    question: 'How seamless was your experience?',
    answer_type: 'emoji',
    answers: ['🤕', '🙁', '😐', '🙂', '😍'],
    optional: false,
    is_display: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    question: 'Which areas provided the most value?',
    answer_type: 'checkboxes',
    answers: ['Workshop Content & Materials', 'Mentorship'],
    optional: false,
    is_display: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const mockFeedbackItems: AdminUserFeedbackItem[] = [
  {
    id: 1,
    user_id: 101,
    user_email: 'test11@mailinator.com',
    user_display_name: 'test11',
    workspace_id: 34,
    questionnaire_id: 1,
    question: 'How seamless was your experience?',
    user_answers: ['😍'],
    submission_date: '2026-09-18T14:39:00Z',
  },
  {
    id: 2,
    user_id: 101,
    user_email: 'test11@mailinator.com',
    user_display_name: 'test11',
    workspace_id: 34,
    questionnaire_id: 2,
    question: 'Which areas provided the most value?',
    user_answers: ['Workshop Content & Materials'],
    submission_date: '2026-09-18T14:39:00Z',
  },
];

describe('AdminFeedbackAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty message when no feedback items exist', () => {
    mockedUseAdminFeedbackQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockedUseAdminUserFeedbackSubmissions.mockReturnValue({
      data: { feedback: [], pagination: { total: 0, limit: 100, offset: 0, has_more: false } },
      isLoading: false,
    });

    render(<AdminFeedbackAnalytics />);

    expect(screen.getByText('No Feedback Data Yet')).toBeInTheDocument();
  });

  it('renders KPI summary cards, user sentiment, and question breakdown', () => {
    mockedUseAdminFeedbackQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockedUseAdminUserFeedbackSubmissions.mockReturnValue({
      data: {
        feedback: mockFeedbackItems,
        pagination: { total: 2, limit: 100, offset: 0, has_more: false },
      },
      isLoading: false,
    });

    render(<AdminFeedbackAnalytics />);

    expect(screen.getByText('Feedback Sessions')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction Score')).toBeInTheDocument();
    expect(screen.getByText('Unique Founders')).toBeInTheDocument();
    expect(screen.getByText('Total Answers')).toBeInTheDocument();

    expect(screen.getByText('User Sentiment')).toBeInTheDocument();
    expect(screen.getByText('Response Breakdown by Question')).toBeInTheDocument();
    expect(screen.getAllByText('How seamless was your experience?').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText('Which areas provided the most value?').length,
    ).toBeGreaterThanOrEqual(1);
  });
});

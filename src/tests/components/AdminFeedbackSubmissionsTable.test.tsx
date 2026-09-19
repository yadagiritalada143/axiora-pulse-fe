import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminUserFeedbackItem } from '@/types/feedback.types';
import { AdminFeedbackSubmissionsTable } from '@features/feedback/components/admin/AdminFeedbackSubmissionsTable';
import { useAdminUserFeedbackSubmissions } from '@features/feedback/hooks/useFeedback';

jest.mock('@features/feedback/hooks/useFeedback', () => ({
  useAdminUserFeedbackSubmissions: jest.fn(),
}));

const mockedUseAdminUserFeedbackSubmissions = useAdminUserFeedbackSubmissions as jest.Mock;

const mockFeedbackItems: AdminUserFeedbackItem[] = [
  {
    id: 1,
    user_id: 101,
    user_email: 'test11@mailinator.com',
    user_display_name: 'test11',
    workspace_id: 34,
    questionnaire_id: 1,
    question: 'How seamless was your experience generating and...',
    user_answers: ['🤕'],
    submission_date: '2026-09-18T14:39:00Z',
  },
  {
    id: 2,
    user_id: 101,
    user_email: 'test11@mailinator.com',
    user_display_name: 'test11',
    workspace_id: 34,
    questionnaire_id: 2,
    question: 'Which areas of the venture program provided the...',
    user_answers: ['Workshop Content & Materials'],
    submission_date: '2026-09-18T14:39:00Z',
  },
  {
    id: 3,
    user_id: 101,
    user_email: 'test11@mailinator.com',
    user_display_name: 'test11',
    workspace_id: 34,
    questionnaire_id: 3,
    question: 'What additional support or resources would help a...',
    user_answers: ['Haa I will'],
    submission_date: '2026-09-18T14:39:00Z',
  },
];

describe('AdminFeedbackSubmissionsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('groups multiple questions from the same user submission into 1 consolidated row', () => {
    mockedUseAdminUserFeedbackSubmissions.mockReturnValue({
      data: {
        feedback: mockFeedbackItems,
        pagination: { total: 3, limit: 50, offset: 0, has_more: false },
      },
      isLoading: false,
      isError: false,
    });

    render(<AdminFeedbackSubmissionsTable />);

    expect(screen.getByText('User Feedback Submissions')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /grouped \(1\)/i })).toBeInTheDocument();

    expect(screen.getByText('test11')).toBeInTheDocument();
    expect(screen.getByText('test11@mailinator.com')).toBeInTheDocument();
    expect(screen.getByText('Workspace 34')).toBeInTheDocument();
    expect(screen.getByText('3 Questions Answered')).toBeInTheDocument();
  });

  it('expands row to reveal inline question-by-question breakdown', async () => {
    const user = userEvent.setup();
    mockedUseAdminUserFeedbackSubmissions.mockReturnValue({
      data: {
        feedback: mockFeedbackItems,
        pagination: { total: 3, limit: 50, offset: 0, has_more: false },
      },
      isLoading: false,
      isError: false,
    });

    render(<AdminFeedbackSubmissionsTable />);

    const expandButton = screen.getByLabelText(/expand row/i);
    await user.click(expandButton);

    expect(screen.getByText('Question-by-Question Breakdown')).toBeInTheDocument();
    expect(
      screen.getByText('How seamless was your experience generating and...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Which areas of the venture program provided the...'),
    ).toBeInTheDocument();
  });

  it('toggles to All Answers raw view mode', async () => {
    const user = userEvent.setup();
    mockedUseAdminUserFeedbackSubmissions.mockReturnValue({
      data: {
        feedback: mockFeedbackItems,
        pagination: { total: 3, limit: 50, offset: 0, has_more: false },
      },
      isLoading: false,
      isError: false,
    });

    render(<AdminFeedbackSubmissionsTable />);

    const rawButton = screen.getByRole('button', { name: /all answers \(3\)/i });
    await user.click(rawButton);

    expect(screen.getByText('Submitted Answers')).toBeInTheDocument();
  });
});

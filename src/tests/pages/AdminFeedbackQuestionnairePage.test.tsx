import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAdminFeedbackQuestions, useAdminUserFeedbackSubmissions } from '@features/feedback';
import AdminFeedbackQuestionnairePage from '@pages/AdminFeedbackQuestionnairePage';

jest.mock('@features/feedback', () => ({
  useAdminFeedbackQuestions: jest.fn(),
  useAdminUserFeedbackSubmissions: jest.fn(),
  useCreateFeedbackQuestion: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useUpdateFeedbackQuestion: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useToggleFeedbackQuestionDisplay: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));

jest.mock('@features/feedback/components/admin', () => ({
  AdminFeedbackQuestionList: () => <div data-testid="admin-question-list">Question List Mock</div>,
  AdminFeedbackSubmissionsTable: () => (
    <div data-testid="admin-submissions-table">Submissions Table Mock</div>
  ),
  FeedbackQuestionDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="feedback-question-dialog">Feedback Question Dialog</div> : null,
}));

const mockedUseAdminFeedbackQuestions = useAdminFeedbackQuestions as jest.Mock;
const mockedUseAdminUserFeedbackSubmissions = useAdminUserFeedbackSubmissions as jest.Mock;

describe('AdminFeedbackQuestionnairePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAdminFeedbackQuestions.mockReturnValue({
      data: [
        {
          id: 1,
          question: 'Rate experience',
          answer_type: 'emoji',
          answers: ['Good', 'Bad'],
          is_display: true,
        },
        {
          id: 2,
          question: 'Favorite feature',
          answer_type: 'checkboxes',
          answers: ['A', 'B'],
          is_display: false,
        },
      ],
      isLoading: false,
    });

    mockedUseAdminUserFeedbackSubmissions.mockReturnValue({
      data: {
        data: [],
        pagination: { total: 12, limit: 1, offset: 0, has_more: true },
      },
      isLoading: false,
    });
  });

  it('renders stats overview cards and default questions tab', () => {
    render(<AdminFeedbackQuestionnairePage />);

    expect(screen.getByText('Feedback Questionnaire')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // total questions
    expect(screen.getByText('Active on Form')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // active questions
    expect(screen.getByText('Total Submissions')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // total submissions

    expect(screen.getByTestId('admin-question-list')).toBeInTheDocument();
  });

  it('opens add question dialog when Add Question button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminFeedbackQuestionnairePage />);

    const addButton = screen.getByRole('button', { name: /add question/i });
    await user.click(addButton);

    expect(screen.getByTestId('feedback-question-dialog')).toBeInTheDocument();
  });

  it('switches to User Submissions tab', async () => {
    const user = userEvent.setup();
    render(<AdminFeedbackQuestionnairePage />);

    const submissionsTab = screen.getByRole('tab', { name: /submissions/i });
    await user.click(submissionsTab);

    expect(screen.getByTestId('admin-submissions-table')).toBeInTheDocument();
  });
});

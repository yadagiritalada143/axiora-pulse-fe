import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { FeedbackQuestion } from '@/types/feedback.types';
import { FeedbackQuestionnaireModal } from '@features/feedback/components/user/FeedbackQuestionnaireModal';
import {
  useDisplayedFeedbackQuestions,
  useSubmitUserFeedback,
} from '@features/feedback/hooks/useFeedback';

jest.mock('@features/feedback/hooks/useFeedback', () => ({
  useDisplayedFeedbackQuestions: jest.fn(),
  useSubmitUserFeedback: jest.fn(),
}));

const mockedUseDisplayedFeedbackQuestions = useDisplayedFeedbackQuestions as jest.Mock;
const mockedUseSubmitUserFeedback = useSubmitUserFeedback as jest.Mock;

const mockQuestions: FeedbackQuestion[] = [
  {
    id: 1,
    question: 'How would you rate your experience?',
    answer_type: 'emoji',
    answers: ['Not Like', 'Poor', 'Okay', 'Good', 'Definitely'],
    optional: false,
    is_display: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    question: 'What features did you use most?',
    answer_type: 'checkboxes',
    answers: ['Idea Validation', 'Market Research', 'Surveys'],
    optional: false,
    is_display: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

describe('FeedbackQuestionnaireModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockSubmitMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSubmitUserFeedback.mockReturnValue({
      mutate: mockSubmitMutate,
      isPending: false,
    });
  });

  it('renders loading state when questions are fetching', () => {
    mockedUseDisplayedFeedbackQuestions.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(
      <FeedbackQuestionnaireModal open={true} onOpenChange={mockOnOpenChange} workspaceId={101} />,
    );

    expect(screen.getByText(/loading feedback questionnaire/i)).toBeInTheDocument();
  });

  it('renders fallback when no questions are available', () => {
    mockedUseDisplayedFeedbackQuestions.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <FeedbackQuestionnaireModal open={true} onOpenChange={mockOnOpenChange} workspaceId={101} />,
    );

    expect(screen.getByText(/no feedback questions are currently required/i)).toBeInTheDocument();
  });

  it('navigates through questions and submits feedback with certificate download', async () => {
    const user = userEvent.setup();
    mockedUseDisplayedFeedbackQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isError: false,
    });
    mockSubmitMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });

    render(
      <FeedbackQuestionnaireModal open={true} onOpenChange={mockOnOpenChange} workspaceId={101} />,
    );

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('How would you rate your experience?')).toBeInTheDocument();

    const definitelyButton = screen.getByText('Definitely');
    await user.click(definitelyButton);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('What features did you use most?')).toBeInTheDocument();

    const previousButton = screen.getByRole('button', { name: /previous/i });
    await user.click(previousButton);
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();

    const nextButtonAgain = screen.getByRole('button', { name: /next/i });
    await user.click(nextButtonAgain);

    const ideaOption = screen.getByText('Idea Validation');
    await user.click(ideaOption);

    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    expect(mockSubmitMutate).toHaveBeenCalledWith(
      {
        workspace_id: 101,
        answers: expect.arrayContaining([
          expect.objectContaining({ questionnaire_id: 1, user_answers: ['Definitely'] }),
          expect.objectContaining({ questionnaire_id: 2, user_answers: ['Idea Validation'] }),
        ]),
      },
      expect.anything(),
    );

    expect(await screen.findByText('Thank you for your feedback!')).toBeInTheDocument();

    const gotItButton = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(gotItButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles 5-star rating questions properly and displays dynamic title', async () => {
    const user = userEvent.setup();
    mockedUseDisplayedFeedbackQuestions.mockReturnValue({
      data: [
        {
          id: 10,
          question: 'How do you feel about Axiora Pulse?',
          answer_type: 'emoji',
          answers: ['⭐', '⭐', '⭐', '⭐', '⭐'],
          optional: false,
          is_display: true,
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(
      <FeedbackQuestionnaireModal open={true} onOpenChange={mockOnOpenChange} workspaceId={101} />,
    );

    expect(screen.getByText(/tap a star to rate/i)).toBeInTheDocument();

    const star1Button = screen.getByRole('button', { name: /rate 1 stars/i });
    await user.click(star1Button);

    expect(screen.getByText(/1 star — very dissatisfied/i)).toBeInTheDocument();

    const star4Button = screen.getByRole('button', { name: /rate 4 stars/i });
    await user.click(star4Button);

    expect(screen.getByText(/4 stars — satisfied \/ good/i)).toBeInTheDocument();
  });

  it('selects 3 stars and submits 3 stars (⭐⭐⭐) when backend returns cumulative star answers', async () => {
    const user = userEvent.setup();
    mockedUseDisplayedFeedbackQuestions.mockReturnValue({
      data: [
        {
          id: 10,
          question: 'How do you rate this app?',
          answer_type: 'emoji',
          answers: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
          optional: false,
          is_display: true,
        },
      ],
      isLoading: false,
      isError: false,
    });
    mockSubmitMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });

    render(
      <FeedbackQuestionnaireModal open={true} onOpenChange={mockOnOpenChange} workspaceId={101} />,
    );

    const star3Button = screen.getByRole('button', { name: /rate 3 stars/i });
    await user.click(star3Button);

    expect(screen.getByText(/3 stars — neutral \/ average/i)).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await user.click(submitButton);

    expect(mockSubmitMutate).toHaveBeenCalledWith(
      {
        workspace_id: 101,
        answers: [
          {
            questionnaire_id: 10,
            user_answers: ['⭐⭐⭐'],
          },
        ],
      },
      expect.anything(),
    );
  });
});

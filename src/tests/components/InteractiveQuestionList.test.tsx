import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { InteractiveQuestionList } from '@features/admin/components/InteractiveQuestionList';
import { onboardingService } from '@services/onboarding';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/onboarding', () => ({
  onboardingService: {
    listAllInteractiveQuestions: jest.fn(),
    deleteInteractiveQuestion: jest.fn(),
  },
}));

const mockedOnboardingService = jest.mocked(onboardingService);

const questionDates = {
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function renderList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(<InteractiveQuestionList />, { wrapper: Wrapper });
}

describe('InteractiveQuestionList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an empty state when there are no questions', async () => {
    mockedOnboardingService.listAllInteractiveQuestions.mockResolvedValue([]);

    renderList();

    expect(await screen.findByText('No questions have been added yet.')).toBeInTheDocument();
  });

  it('lists every question with its type, requirement, and options', async () => {
    mockedOnboardingService.listAllInteractiveQuestions.mockResolvedValue([
      {
        id: 1,
        question: 'What best describes your role?',
        answer_type: 'radiobuttons',
        optional: false,
        answers: ['Founder', 'Engineer'],
        ...questionDates,
      },
      {
        id: 2,
        question: 'What should I call you?',
        answer_type: 'textarea',
        optional: true,
        answers: [],
        ...questionDates,
      },
    ]);

    renderList();

    expect(await screen.findByText('What best describes your role?')).toBeInTheDocument();

    expect(screen.getByText('Single choice')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Founder')).toBeInTheDocument();

    expect(screen.getByText('What should I call you?')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('deletes a question after confirming the alert dialog', async () => {
    mockedOnboardingService.listAllInteractiveQuestions.mockResolvedValue([
      {
        id: 1,
        question: 'What should I call you?',
        answer_type: 'textarea',
        optional: false,
        answers: [],
        ...questionDates,
      },
    ]);

    mockedOnboardingService.deleteInteractiveQuestion.mockResolvedValue({
      message: 'Deleted successfully',
    });

    const user = userEvent.setup();

    renderList();

    await screen.findByText('What should I call you?');

    await user.click(
      screen.getByRole('button', {
        name: 'Delete "What should I call you?"',
      }),
    );

    expect(screen.getByText('Delete this question?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(mockedOnboardingService.deleteInteractiveQuestion).toHaveBeenCalledWith(1),
    );
  });

  it('closes the dialog without deleting when cancelled', async () => {
    mockedOnboardingService.listAllInteractiveQuestions.mockResolvedValue([
      {
        id: 1,
        question: 'What should I call you?',
        answer_type: 'textarea',
        optional: false,
        answers: [],
        ...questionDates,
      },
    ]);

    const user = userEvent.setup();

    renderList();

    await screen.findByText('What should I call you?');

    await user.click(
      screen.getByRole('button', {
        name: 'Delete "What should I call you?"',
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Delete this question?')).not.toBeInTheDocument();

    expect(mockedOnboardingService.deleteInteractiveQuestion).not.toHaveBeenCalled();
  });
});

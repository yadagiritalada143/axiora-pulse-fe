import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { InteractiveQuestionForm } from '@features/admin/components/InteractiveQuestionForm';
import { onboardingService } from '@services/onboarding';

// Radix's <Select> observes its trigger size via ResizeObserver, which jsdom doesn't implement.
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
global.ResizeObserver = MockResizeObserver;

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/onboarding', () => ({
  onboardingService: {
    createInteractiveQuestion: jest.fn(),
  },
}));

const mockedOnboardingService = jest.mocked(onboardingService);

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return render(<InteractiveQuestionForm />, { wrapper: Wrapper });
}

describe('InteractiveQuestionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits a short-text question without options', async () => {
    mockedOnboardingService.createInteractiveQuestion.mockResolvedValue({
      id: 7,
      questionId: 7,
      question: 'What should I call you?',
      question_type: 'text',
      optional: false,
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Question title'), 'What should I call you?');
    await user.click(screen.getByRole('button', { name: 'Add question' }));

    await waitFor(() =>
      expect(mockedOnboardingService.createInteractiveQuestion).toHaveBeenCalledWith({
        question: 'What should I call you?',
        question_type: 'text',
        optional: false,
        answers: undefined,
      }),
    );
  });

  it('shows two option inputs by default when switching to a choice type', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('combobox', { name: 'Question type' }));
    await user.click(screen.getByRole('option', { name: 'Single choice' }));

    expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument();
  });

  it('submits a choice question with its options and optional flag', async () => {
    mockedOnboardingService.createInteractiveQuestion.mockResolvedValue({
      id: 8,
      questionId: 8,
      question: 'Favorite color?',
      question_type: 'radio',
      optional: true,
      answers: ['Red', 'Blue'],
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Question title'), 'Favorite color?');
    await user.click(screen.getByRole('combobox', { name: 'Question type' }));
    await user.click(screen.getByRole('option', { name: 'Single choice' }));
    await user.type(screen.getByPlaceholderText('Option 1'), 'Red');
    await user.type(screen.getByPlaceholderText('Option 2'), 'Blue');
    await user.click(screen.getByRole('checkbox', { name: 'This question is optional' }));
    await user.click(screen.getByRole('button', { name: 'Add question' }));

    await waitFor(() =>
      expect(mockedOnboardingService.createInteractiveQuestion).toHaveBeenCalledWith({
        question: 'Favorite color?',
        question_type: 'radio',
        optional: true,
        answers: ['Red', 'Blue'],
      }),
    );
  });

  it('does not submit a choice question with fewer than 2 filled options', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Question title'), 'Favorite color?');
    await user.click(screen.getByRole('combobox', { name: 'Question type' }));
    await user.click(screen.getByRole('option', { name: 'Single choice' }));
    await user.type(screen.getByPlaceholderText('Option 1'), 'Red');
    await user.click(screen.getByRole('button', { name: 'Add question' }));

    expect(await screen.findByText('Option cannot be empty')).toBeInTheDocument();
    expect(mockedOnboardingService.createInteractiveQuestion).not.toHaveBeenCalled();
  });
});

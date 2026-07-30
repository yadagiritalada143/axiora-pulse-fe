import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { InteractiveQuestionForm } from '@features/admin/components/InteractiveQuestionForm';
import { onboardingService } from '@services/onboarding';

class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

global.ResizeObserver = MockResizeObserver;

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@services/onboarding', () => ({
  onboardingService: {
    createInteractiveQuestion: jest.fn(),
  },
}));

const mockedOnboardingService = jest.mocked(onboardingService);

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(<InteractiveQuestionForm />, {
    wrapper: Wrapper,
  });
}

describe('InteractiveQuestionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedOnboardingService.createInteractiveQuestion.mockResolvedValue({
      id: 1,
      question: 'test',
      answer_type: 'textarea',
      optional: false,
      answers: [],
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    });
  });

  it('submits a textarea question without options', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText('Question title'), 'What should I call you?');

    await user.click(
      screen.getByRole('button', {
        name: /add question/i,
      }),
    );

    await waitFor(() =>
      expect(mockedOnboardingService.createInteractiveQuestion).toHaveBeenCalledWith({
        question: 'What should I call you?',
        answer_type: 'textarea',
        optional: false,
        answers: [],
      }),
    );
  });

  it('shows two option inputs when selecting single choice', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(
      screen.getByRole('combobox', {
        name: /question type/i,
      }),
    );

    await user.click(
      screen.getByRole('option', {
        name: /single choice/i,
      }),
    );

    expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument();
  });

  it('submits a choice question with options and optional flag', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText('Question title'), 'Favorite color?');

    await user.click(
      screen.getByRole('combobox', {
        name: /question type/i,
      }),
    );

    await user.click(
      screen.getByRole('option', {
        name: /single choice/i,
      }),
    );

    await user.type(screen.getByPlaceholderText('Option 1'), 'Red');

    await user.type(screen.getByPlaceholderText('Option 2'), 'Blue');

    await user.click(
      screen.getByRole('checkbox', {
        name: /this question is optional/i,
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: /add question/i,
      }),
    );

    await waitFor(() =>
      expect(mockedOnboardingService.createInteractiveQuestion).toHaveBeenCalledWith({
        question: 'Favorite color?',
        answer_type: 'radiobuttons',
        optional: true,
        answers: ['Red', 'Blue'],
      }),
    );
  });

  it('clears the options list when switching back to textarea', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('combobox', { name: /question type/i }));
    await user.click(screen.getByRole('option', { name: /single choice/i }));

    expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: /question type/i }));
    await user.click(screen.getByRole('option', { name: /short text/i }));

    expect(screen.queryByPlaceholderText('Option 1')).not.toBeInTheDocument();
  });

  it('adds another option field and removes one via the remove button', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('combobox', { name: /question type/i }));
    await user.click(screen.getByRole('option', { name: /single choice/i }));

    expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Option 3')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add option/i }));

    expect(screen.getByPlaceholderText('Option 3')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', { name: /remove option/i });
    const lastRemoveButton = removeButtons.at(-1);
    if (!lastRemoveButton) throw new Error('No remove buttons found');
    await user.click(lastRemoveButton);

    expect(screen.queryByPlaceholderText('Option 3')).not.toBeInTheDocument();
  });

  it('disables the remove option button once only two options remain', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('combobox', { name: /question type/i }));
    await user.click(screen.getByRole('option', { name: /single choice/i }));

    const removeButtons = screen.getAllByRole('button', { name: /remove option/i });
    expect(removeButtons).toHaveLength(2);
    removeButtons.forEach((button) => expect(button).toBeDisabled());
  });

  it('keeps existing options when switching between two choice-based types', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByRole('combobox', { name: /question type/i }));
    await user.click(screen.getByRole('option', { name: /single choice/i }));

    await user.type(screen.getByPlaceholderText('Option 1'), 'Red');
    await user.type(screen.getByPlaceholderText('Option 2'), 'Blue');

    // Switching to another choice-based type shouldn't reset the options that are
    // already filled in (fields.length is no longer 0, so no fresh options are appended).
    await user.click(screen.getByRole('combobox', { name: /question type/i }));
    await user.click(screen.getByRole('option', { name: /dropdown/i }));

    expect(screen.getByPlaceholderText('Option 1')).toHaveValue('Red');
    expect(screen.getByPlaceholderText('Option 2')).toHaveValue('Blue');
  });

  it('disables the submit button and shows a loader while the mutation is pending', async () => {
    const user = userEvent.setup();
    let resolveCreate: (() => void) | undefined;

    mockedOnboardingService.createInteractiveQuestion.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = () =>
            resolve({
              id: 1,
              question: 'test',
              answer_type: 'textarea',
              optional: false,
              answers: [],
              created_at: '2026-01-01',
              updated_at: '2026-01-01',
            });
        }),
    );

    renderForm();

    await user.type(screen.getByLabelText('Question title'), 'What should I call you?');
    await user.click(screen.getByRole('button', { name: /add question/i }));

    const submitButton = await screen.findByRole('button', { name: /add question/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton.querySelector('svg')).toBeInTheDocument();

    resolveCreate?.();
    await waitFor(() => expect(submitButton).toBeEnabled());
  });

  it('does not submit choice question with empty option', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText('Question title'), 'Favorite color?');

    await user.click(
      screen.getByRole('combobox', {
        name: /question type/i,
      }),
    );

    await user.click(
      screen.getByRole('option', {
        name: /single choice/i,
      }),
    );

    await user.type(screen.getByPlaceholderText('Option 1'), 'Red');

    await user.click(
      screen.getByRole('button', {
        name: /add question/i,
      }),
    );

    expect(await screen.findByText('Option cannot be empty')).toBeInTheDocument();

    expect(mockedOnboardingService.createInteractiveQuestion).not.toHaveBeenCalled();
  });
});

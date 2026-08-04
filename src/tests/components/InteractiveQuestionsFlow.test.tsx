import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactModule from 'react';

import type { InteractiveQuestion } from '@/types/onboarding.types';
import { STORAGE_KEYS } from '@constants/storage';
import { InteractiveQuestionsFlow } from '@features/onboarding/components/InteractiveQuestionsFlow';
import { useAuthStore } from '@store/auth.store';
import { storage } from '@utils/storage';

// framer-motion's real timers/rAF-driven exit animations make DOM assertions racy in
// jsdom - swap it for a passthrough so mount/unmount happens synchronously like any
// other conditional render, keeping these tests about behavior, not animation timing.
jest.mock('framer-motion', () => {
  const ReactActual = jest.requireActual<typeof ReactModule>('react');

  function MockMotionDiv(props: Record<string, unknown>) {
    const rest = { ...props };
    delete rest.initial;
    delete rest.animate;
    delete rest.exit;
    delete rest.variants;
    delete rest.transition;
    delete rest.custom;

    return ReactActual.createElement('div', rest);
  }

  return {
    motion: { div: MockMotionDiv },
    AnimatePresence: ({ children }: { children?: unknown }) => children,
  };
});

jest.mock('@utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockMutate = jest.fn((_payload: unknown, options?: { onSuccess?: () => void }) => {
  options?.onSuccess?.();
});
let mockIsPending = false;

jest.mock('@features/onboarding/hooks', () => ({
  useSubmitInteractiveAnswers: () => ({ mutate: mockMutate, isPending: mockIsPending }),
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockSetHasCompletedQuestionnaire = jest.fn();

const QUESTIONS: InteractiveQuestion[] = [
  {
    id: 101,
    question: 'What should I call you?',
    answer_type: 'textarea',
    optional: false,
    answers: [],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 102,
    question: 'Pick a role',
    answer_type: 'radiobuttons',
    optional: false,
    answers: ['Founder', 'Engineer'],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 103,
    question: 'Anything else?',
    answer_type: 'textarea',
    optional: true,
    answers: [],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

async function answerFirstAndAdvance(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('Type your answer here'), 'Farhan');
  await user.click(screen.getByRole('button', { name: 'Next' }));
}

describe('InteractiveQuestionsFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
    (storage.get as jest.Mock).mockReturnValue(null);
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        setHasCompletedQuestionnaire: mockSetHasCompletedQuestionnaire,
      } as unknown as Parameters<typeof useAuthStore>[0] extends (state: infer S) => unknown
        ? S
        : never),
    );
  });

  it('renders nothing when there are no questions', () => {
    render(<InteractiveQuestionsFlow questions={[]} />);

    expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
  });

  it('starts on the first question with Back disabled and Next disabled until answered', () => {
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.getByText('What should I call you?')).toBeInTheDocument();
    expect(screen.getByText('Pulse')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next once a mandatory question is answered, and hides the close icon', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Type your answer here'), 'Farhan');
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('persists the draft on Next, and Back restores the previous step and answer', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await answerFirstAndAdvance(user);

    expect(storage.set).toHaveBeenLastCalledWith(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT, {
      stepIndex: 1,
      answers: { 101: ['Farhan'] },
    });
    expect(screen.getByText('Pick a role')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('What should I call you?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer here')).toHaveValue('Farhan');
  });

  it('resumes from an existing draft', () => {
    (storage.get as jest.Mock).mockReturnValue({
      stepIndex: 1,
      answers: { 101: ['Farhan'] },
    });

    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.getByText('Pick a role')).toBeInTheDocument();
  });

  it('shows an optional question with a close icon that skips to the next question', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await answerFirstAndAdvance(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Anything else?')).toBeInTheDocument();
    const closeButton = screen.getByRole('button', { name: 'Close' });

    await user.click(closeButton);

    expect(screen.getByText("You're All Set!")).toBeInTheDocument();
  });

  it('treats a regular checkbox selection as answered', async () => {
    const user = userEvent.setup();
    const multiQuestion: InteractiveQuestion = {
      id: 201,
      question: 'What matters to you?',
      answer_type: 'checkboxes',
      optional: false,
      answers: ['Speed', 'Quality'],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    render(<InteractiveQuestionsFlow questions={[multiQuestion]} />);

    await user.click(screen.getByRole('checkbox', { name: 'Speed' }));

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('reaches the completion screen after the last question', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await answerFirstAndAdvance(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText("You're All Set!")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retake' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Data' })).toBeInTheDocument();
  });

  it('asks for confirmation before retaking, and restarts from Question 1 on confirm', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await answerFirstAndAdvance(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await user.click(screen.getByRole('button', { name: 'Retake' }));
    expect(screen.getByText('Retake the questions?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Retake the questions?')).not.toBeInTheDocument();
    expect(screen.getByText("You're All Set!")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retake' }));
    await user.click(screen.getByRole('button', { name: 'Yes, start over' }));

    expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT);
    expect(screen.getByText('What should I call you?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer here')).toHaveValue('');
  });

  it('submits questionnaire answers, marks the questionnaire complete, and calls onCompleted', async () => {
    const user = userEvent.setup();
    const onCompleted = jest.fn();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} onCompleted={onCompleted} />);

    await answerFirstAndAdvance(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' })); // skip optional Q3

    await user.click(screen.getByRole('button', { name: 'Submit Data' }));

    expect(mockMutate).toHaveBeenCalledWith(
      [
        { questionnaire_id: 101, user_answers: ['Farhan'] },
        { questionnaire_id: 102, user_answers: ['Founder'] },
      ],
      expect.any(Object),
    );
    expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT);
    expect(mockSetHasCompletedQuestionnaire).toHaveBeenCalledWith(true);
    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("You're All Set!")).not.toBeInTheDocument();
  });

  it('submits successfully without an onCompleted callback', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await answerFirstAndAdvance(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await user.click(screen.getByRole('button', { name: 'Submit Data' }));

    expect(mockSetHasCompletedQuestionnaire).toHaveBeenCalledWith(true);
  });

  it('disables the completion actions and shows a submitting label while pending', async () => {
    mockIsPending = true;
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await answerFirstAndAdvance(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByRole('button', { name: 'Retake' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  });
});

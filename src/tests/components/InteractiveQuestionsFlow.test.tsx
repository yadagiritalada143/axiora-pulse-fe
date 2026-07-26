import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactModule from 'react';

import type { InteractiveQuestion } from '@/types/onboarding.types';
import { STORAGE_KEYS } from '@constants/storage';
import { InteractiveQuestionsFlow } from '@features/onboarding/components/InteractiveQuestionsFlow';
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

const QUESTIONS: InteractiveQuestion[] = [
  {
    id: 1,
    questionId: 101,
    question: 'What should I call you?',
    question_type: 'text',
    optional: false,
  },
  {
    id: 2,
    questionId: 102,
    question: 'Pick a role',
    question_type: 'radio',
    optional: false,
    answers: ['Founder', 'Engineer'],
  },
  {
    id: 3,
    questionId: 103,
    question: 'Anything else?',
    question_type: 'text',
    optional: true,
  },
];

async function goToQuestion2(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.type(screen.getByPlaceholderText('Type your answer here'), 'Farhan');
  await user.click(screen.getByRole('button', { name: 'Next' }));
}

describe('InteractiveQuestionsFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
    (storage.get as jest.Mock).mockReturnValue(null);
  });

  it('renders nothing when there are no questions', () => {
    render(<InteractiveQuestionsFlow questions={[]} />);

    expect(screen.queryByText(/help ai mentor/i)).not.toBeInTheDocument();
  });

  it('starts on the intro screen with no Back button', () => {
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.getByText('Help AI Mentor Understand Your Idea')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('moves to the question stepper after Continue, showing the Pulse wordmark', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('What should I call you?')).toBeInTheDocument();
    expect(screen.getByText('Pulse')).toBeInTheDocument();
  });

  it('keeps Next disabled on a mandatory question until answered, and hides the close icon', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Type your answer here'), 'Farhan');
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('accepts a free-text "Other" answer as sufficient to enable Next', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);
    await goToQuestion2(user);

    await user.click(screen.getByRole('radio', { name: /others/i }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.type(screen.getByRole('textbox'), 'Growth Lead');
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('treats a regular multi-select option alongside Other as answered even with no Other text', async () => {
    const user = userEvent.setup();
    const multiQuestion: InteractiveQuestion = {
      id: 1,
      questionId: 201,
      question: 'What matters to you?',
      question_type: 'multi_select',
      optional: false,
      answers: ['Speed', 'Quality'],
    };
    render(<InteractiveQuestionsFlow questions={[multiQuestion]} />);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.click(screen.getByRole('checkbox', { name: 'Speed' }));
    await user.click(screen.getByRole('checkbox', { name: /others/i }));

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('lets an optional question be skipped and shows a close icon that dismisses the flow', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await goToQuestion2(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Anything else?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('Anything else?')).not.toBeInTheDocument();
  });

  it('persists the answer draft to storage on Next, and Back restores the previous answer', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);
    await goToQuestion2(user);

    expect(storage.set).toHaveBeenLastCalledWith(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT, {
      stepIndex: 1,
      answers: { 101: ['Farhan'] },
    });

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('What should I call you?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer here')).toHaveValue('Farhan');
  });

  it('resumes from an existing draft, skipping the intro screen', () => {
    (storage.get as jest.Mock).mockReturnValue({
      stepIndex: 1,
      answers: { 101: ['Farhan'] },
    });

    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.queryByText('Help AI Mentor Understand Your Idea')).not.toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Pick a role')).toBeInTheDocument();
  });

  it('reaches the completion screen after the last question', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);
    await goToQuestion2(user);
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
    await goToQuestion2(user);
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
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer here')).toHaveValue('');
  });

  it('submits only answered questions and dismisses the flow on success', async () => {
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);
    await goToQuestion2(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' })); // skip optional Q3

    await user.click(screen.getByRole('button', { name: 'Submit Data' }));

    expect(mockMutate).toHaveBeenCalledWith(
      [
        { interactive_question_ID: 101, answer: ['Farhan'] },
        { interactive_question_ID: 102, answer: ['Founder'] },
      ],
      expect.any(Object),
    );
    expect(screen.queryByText("You're All Set!")).not.toBeInTheDocument();
  });

  it('disables the completion actions and shows a submitting label while pending', async () => {
    mockIsPending = true;
    const user = userEvent.setup();
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);
    await goToQuestion2(user);
    await user.click(screen.getByRole('radio', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByRole('button', { name: 'Retake' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  });
});

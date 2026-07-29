import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactModule from 'react';

import type { InteractiveQuestion } from '@/types/onboarding.types';
import { InteractiveQuestionsFlow } from '@features/onboarding/components/InteractiveQuestionsFlow';
import { storage } from '@utils/storage';

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
  useSubmitInteractiveAnswers: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

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
  });

  it('renders nothing when there are no questions', () => {
    render(<InteractiveQuestionsFlow questions={[]} />);

    expect(screen.queryByText(/help ai mentor/i)).not.toBeInTheDocument();
  });

  it('starts on the first question with Back disabled', () => {
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.getByText('What should I call you?')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('shows the first question and the Pulse wordmark', () => {
    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.getByText('What should I call you?')).toBeInTheDocument();
    expect(screen.getByText('Pulse')).toBeInTheDocument();
  });

  it('accepts free text answers', async () => {
    const user = userEvent.setup();

    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Type your answer here'), 'Farhan');

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('submits questionnaire answers with the new payload format', async () => {
    const user = userEvent.setup();

    render(<InteractiveQuestionsFlow questions={QUESTIONS} />);

    await answerFirstAndAdvance(user);

    await user.click(screen.getByRole('radio', { name: 'Founder' }));

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await user.click(screen.getByRole('button', { name: 'Submit Data' }));

    expect(mockMutate).toHaveBeenCalledWith(
      [
        {
          questionnaire_id: 101,
          user_answers: ['Farhan'],
        },
        {
          questionnaire_id: 102,
          user_answers: ['Founder'],
        },
      ],
      expect.any(Object),
    );

    expect(screen.queryByText("You're All Set!")).not.toBeInTheDocument();
  });

  it('supports checkbox questions', async () => {
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
});

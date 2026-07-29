import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import type { InteractiveQuestion } from '@/types/onboarding.types';
import {
  useInteractiveQuestions,
  useSubmitInteractiveAnswers,
} from '@features/onboarding/hooks/useInteractiveQuestions';
import { onboardingService } from '@services/onboarding';

jest.mock('@services/onboarding', () => ({
  onboardingService: {
    getInteractiveQuestions: jest.fn(),
    submitInteractiveAnswers: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const FIXTURE_QUESTIONS: InteractiveQuestion[] = [
  {
    id: 1,
    question: 'What should I call you?',
    answer_type: 'textarea',
    optional: false,
    answers: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useInteractiveQuestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches questions when enabled', async () => {
    (onboardingService.getInteractiveQuestions as jest.Mock).mockResolvedValue(FIXTURE_QUESTIONS);

    const { result } = renderHook(() => useInteractiveQuestions(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(FIXTURE_QUESTIONS));
    expect(onboardingService.getInteractiveQuestions).toHaveBeenCalledTimes(1);
  });

  it('does not fetch when disabled', () => {
    (onboardingService.getInteractiveQuestions as jest.Mock).mockResolvedValue(FIXTURE_QUESTIONS);

    const { result } = renderHook(() => useInteractiveQuestions(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(onboardingService.getInteractiveQuestions).not.toHaveBeenCalled();
  });
});

describe('useSubmitInteractiveAnswers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a success toast and invalidates the questions query on success', async () => {
    (onboardingService.submitInteractiveAnswers as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSubmitInteractiveAnswers(), {
      wrapper: createWrapper(),
    });

    result.current.mutate([
      {
        questionnaire_id: 1,
        user_answers: ['Farhan'],
      },
    ]);

    await waitFor(() => {
      expect(onboardingService.submitInteractiveAnswers).toHaveBeenCalledWith(
        [
          {
            questionnaire_id: 1,
            user_answers: ['Farhan'],
          },
        ],
        expect.anything(),
      );

      expect(toast.success).toHaveBeenCalledWith(expect.any(String));
    });
  });

  it('shows an error toast when the submission fails', async () => {
    (onboardingService.submitInteractiveAnswers as jest.Mock).mockRejectedValue(
      new Error('network down'),
    );

    const { result } = renderHook(() => useSubmitInteractiveAnswers(), {
      wrapper: createWrapper(),
    });

    result.current.mutate([]);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith(expect.any(String));
  });
});

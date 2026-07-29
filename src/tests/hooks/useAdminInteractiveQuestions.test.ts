import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import {
  useAdminInteractiveQuestions,
  useCreateInteractiveQuestion,
  useDeleteInteractiveQuestion,
} from '@features/admin/hooks';
import { onboardingService } from '@services/onboarding';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/onboarding', () => ({
  onboardingService: {
    listAllInteractiveQuestions: jest.fn(),
    createInteractiveQuestion: jest.fn(),
    deleteInteractiveQuestion: jest.fn(),
  },
}));

const mockedOnboardingService = jest.mocked(onboardingService);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAdminInteractiveQuestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches every interactive question via the admin listing', async () => {
    mockedOnboardingService.listAllInteractiveQuestions.mockResolvedValue([
      {
        id: 1,
        question: 'Q1',
        answer_type: 'textarea',
        optional: false,
        answers: [],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);

    const { result } = renderHook(() => useAdminInteractiveQuestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(mockedOnboardingService.listAllInteractiveQuestions).toHaveBeenCalled();
  });
});

describe('useCreateInteractiveQuestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a question and toasts on success', async () => {
    mockedOnboardingService.createInteractiveQuestion.mockResolvedValue({
      id: 7,
      question: 'New question',
      answer_type: 'textarea',
      optional: false,
      answers: [],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useCreateInteractiveQuestion(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      question: 'New question',
      answer_type: 'textarea',
      optional: false,
      answers: [],
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedToastSuccess).toHaveBeenCalledWith('Question added.');
  });

  it('toasts an error when creation fails', async () => {
    mockedOnboardingService.createInteractiveQuestion.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreateInteractiveQuestion(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      question: 'New question',
      answer_type: 'textarea',
      optional: false,
      answers: [],
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith('Unable to add the question. Please try again.');
  });
});

describe('useDeleteInteractiveQuestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a question and toasts on success', async () => {
    mockedOnboardingService.deleteInteractiveQuestion.mockResolvedValue({
      message: 'Question deleted.',
    });
    const { result } = renderHook(() => useDeleteInteractiveQuestion(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedOnboardingService.deleteInteractiveQuestion).toHaveBeenCalledWith(7);
    expect(mockedToastSuccess).toHaveBeenCalledWith('Question deleted.');
  });

  it('toasts an error when deletion fails', async () => {
    mockedOnboardingService.deleteInteractiveQuestion.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDeleteInteractiveQuestion(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      'Unable to delete the question. Please try again.',
    );
  });
});

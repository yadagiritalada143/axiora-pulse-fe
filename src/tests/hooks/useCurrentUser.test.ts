import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type { User } from '@/types/api.types';
import { useCurrentUser } from '@features/auth/hooks/useCurrentUser';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

jest.mock('@services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('@store/auth.store');

const mockedAuthService = jest.mocked(authService);
const mockedUseAuthStore = jest.mocked(useAuthStore);

const setHasActivePlan = jest.fn();
const setHasCompletedQuestionnaire = jest.fn();
const setShowQuestionnaireIntro = jest.fn();

const baseUser: User = {
  id: 'usr_123',
  email: 'user@example.com',
  name: 'John Doe',
  avatarUrl: null,
  role: 'member',
  createdAt: '2026-07-30T10:09:31.072Z',
  updatedAt: '2026-07-30T10:09:31.072Z',
};

/** Points the mocked store at a session and wires up the setters the query writes back to. */
function mockStore({ isAuthenticated = true } = {}) {
  const updateUser = jest.fn();
  const state = {
    user: null,
    isAuthenticated,
    updateUser,
    setHasActivePlan,
    setHasCompletedQuestionnaire,
    setShowQuestionnaireIntro,
  } as unknown as ReturnType<typeof useAuthStore.getState>;

  mockedUseAuthStore.mockImplementation((selector) => selector(state));
  mockedUseAuthStore.getState = jest.fn().mockReturnValue(state);

  return { updateUser };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches current user profile from authService when authenticated', async () => {
    const mockUser: User = {
      id: 'usr_123',
      email: 'user@example.com',
      name: 'John Doe',
      avatarUrl: null,
      role: 'member',
      createdAt: '2026-07-30T10:09:31.072Z',
      updatedAt: '2026-07-30T10:09:31.072Z',
    };

    const mockUpdateUser = jest.fn();

    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: true,
        updateUser: mockUpdateUser,
      } as unknown as ReturnType<typeof useAuthStore.getState>),
    );

    mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateUser).toHaveBeenCalledWith(mockUser);
    expect(result.current.data).toEqual(mockUser);
  });

  it('does not fetch when the session is unauthenticated', () => {
    mockStore({ isAuthenticated: false });

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAuthService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('mirrors backend auth_actions into the plan and questionnaire flags', async () => {
    mockStore();
    mockedAuthService.getCurrentUser.mockResolvedValue({
      ...baseUser,
      auth_actions: { payment: true, interactive_questions: false },
    } as User);

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(setHasCompletedQuestionnaire).toHaveBeenCalledWith(false);
    expect(setShowQuestionnaireIntro).toHaveBeenCalledWith(true);
  });

  it('falls back to the flat hasActivePlan flag when auth_actions is absent', async () => {
    mockStore();
    mockedAuthService.getCurrentUser.mockResolvedValue({
      ...baseUser,
      hasActivePlan: false,
    } as User);

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setHasActivePlan).toHaveBeenCalledWith(false);
    expect(setHasCompletedQuestionnaire).not.toHaveBeenCalled();
  });

  it('leaves the plan flags untouched when the profile carries neither signal', async () => {
    mockStore();
    mockedAuthService.getCurrentUser.mockResolvedValue(baseUser);

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setHasActivePlan).not.toHaveBeenCalled();
    expect(setShowQuestionnaireIntro).not.toHaveBeenCalled();
  });
});

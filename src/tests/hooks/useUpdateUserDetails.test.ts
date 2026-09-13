import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import type { User, UserDetails } from '@/types/api.types';
import { queryKeys } from '@constants/queryKeys';
import { userService } from '@features/settings/api/user.service';
import { useUpdateUserDetails } from '@features/settings/hooks/useUpdateUserDetails';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/settings/api/user.service', () => ({
  userService: {
    updateUserDetails: jest.fn(),
  },
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

const existingUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'Old Name',
  avatarUrl: null,
  role: 'member',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const updatedDetails: UserDetails = {
  profile_id: 'AXR-1',
  user_id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'user@example.com',
  mobile_number: '1234567890',
  avatar_url: null,
  profile_status: 'Active',
  communication_preferences: ['Email'],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const updateUser = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return { queryClient, Wrapper };
}

describe('useUpdateUserDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockImplementation(
      (selector: (s: { updateUser: typeof updateUser }) => unknown) => selector({ updateUser }),
    );
  });

  it('updates store and caches on successful user details update', async () => {
    mockedUserService.updateUserDetails.mockResolvedValue(updatedDetails);

    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(queryKeys.user.profile(), existingUser);

    const { result } = renderHook(() => useUpdateUserDetails(), { wrapper: Wrapper });

    result.current.mutate({
      first_name: 'John',
      last_name: 'Doe',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUserService.updateUserDetails).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
    });

    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
      }),
    );

    const cachedProfile = queryClient.getQueryData<User>(queryKeys.user.profile());
    expect(cachedProfile?.name).toBe('John Doe');
    expect(cachedProfile?.firstName).toBe('John');
    expect(cachedProfile?.lastName).toBe('Doe');

    const cachedDetails = queryClient.getQueryData<UserDetails>(queryKeys.user.details());
    expect(cachedDetails?.first_name).toBe('John');
    expect(cachedDetails?.last_name).toBe('Doe');

    expect(mockedToast.success).toHaveBeenCalledWith('Profile details updated successfully.');
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { userService } from '@features/settings/api/user.service';
import { useChangePassword } from '@features/settings/hooks/useChangePassword';
import { useUpdateUserDetails } from '@features/settings/hooks/useUpdateUserDetails';
import { useUploadAvatar } from '@features/settings/hooks/useUploadAvatar';
import { useUserDetails } from '@features/settings/hooks/useUserDetails';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/settings/api/user.service', () => ({
  userService: {
    changePassword: jest.fn(),
    updateUserDetails: jest.fn(),
    uploadAvatar: jest.fn(),
    getUserDetails: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedUserService = jest.mocked(userService);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const ORIGINAL_STATE = useAuthStore.getState();

afterEach(() => {
  useAuthStore.setState(ORIGINAL_STATE);
  jest.clearAllMocks();
});

describe('useChangePassword', () => {
  it('shows success toast on success', async () => {
    mockedUserService.changePassword.mockResolvedValue({
      status: 'success',
      message: 'Password updated!',
    });

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });

    result.current.mutate({
      current_password: 'old',
      new_password: 'newpass1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Password updated!');
  });

  it('shows default success toast when no message present', async () => {
    mockedUserService.changePassword.mockResolvedValue({ status: 'success', message: '' });

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });

    result.current.mutate({
      current_password: 'old',
      new_password: 'newpass1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Password changed successfully.');
  });

  it('shows api error message on error', async () => {
    const apiError = Object.assign(new Error('Wrong current password'), {
      status: 400,
      code: 'validation_error',
    });
    mockedUserService.changePassword.mockRejectedValue(apiError);

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });

    result.current.mutate({
      current_password: 'wrong',
      new_password: 'newpass1',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Wrong current password');
  });

  it('shows fallback error when error is not api error', async () => {
    mockedUserService.changePassword.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });

    result.current.mutate({
      current_password: 'old',
      new_password: 'newpass1',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to change password. Please check your current password.',
    );
  });
});

describe('useUserDetails', () => {
  it('fetches user details when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    const mockDetails = {
      profile_id: 'p-1',
      user_id: 1,
      email: 'a@b.com',
      first_name: 'John',
      last_name: 'Doe',
      mobile_number: '',
      date_of_birth: null,
      gender: null,
      nationality: null,
      profile_status: 'active',
      communication_preferences: [],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    mockedUserService.getUserDetails.mockResolvedValue(mockDetails);

    const { result } = renderHook(() => useUserDetails(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUserService.getUserDetails).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockDetails);
  });

  it('does not fetch when not authenticated', () => {
    useAuthStore.setState({ isAuthenticated: false });

    const { result } = renderHook(() => useUserDetails(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedUserService.getUserDetails).not.toHaveBeenCalled();
  });
});

describe('useUpdateUserDetails', () => {
  it('updates auth store and invalidates queries on success', async () => {
    const updatedDetails = {
      profile_id: 'p-1',
      user_id: 1,
      email: 'a@b.com',
      first_name: 'John',
      last_name: 'Doe',
      mobile_number: '123',
      date_of_birth: '2000-01-01',
      gender: 'male',
      nationality: 'US',
      profile_status: 'active',
      communication_preferences: ['Email'],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    mockedUserService.updateUserDetails.mockResolvedValue(updatedDetails);

    const updateUserSpy = jest.spyOn(useAuthStore.getState(), 'updateUser');

    const { result } = renderHook(() => useUpdateUserDetails(), { wrapper: createWrapper() });

    result.current.mutate({
      first_name: 'John',
      last_name: 'Doe',
      mobile_number: '123',
      date_of_birth: '2000-01-01',
      gender: 'male',
      nationality: 'US',
      communication_preferences: ['Email'],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        mobileNumber: '123',
      }),
    );
    expect(toast.success).toHaveBeenCalledWith('Profile details updated successfully.');
    updateUserSpy.mockRestore();
  });

  it('shows error toast on failure', async () => {
    mockedUserService.updateUserDetails.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useUpdateUserDetails(), { wrapper: createWrapper() });

    result.current.mutate({
      first_name: 'John',
      last_name: 'Doe',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to update profile details.');
  });
});

describe('useUploadAvatar', () => {
  it('updates user and shows success toast on success', async () => {
    const avatarUrl = 'https://example.com/old-avatar.png';
    const updatedUser = {
      id: '1',
      email: 'a@b.com',
      name: 'John',
      firstName: 'John',
      lastName: 'Doe',
      mobileNumber: null,
      avatarUrl,
      avatar_url: avatarUrl,
      role: 'user' as const,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    mockedUserService.uploadAvatar.mockResolvedValue(updatedUser);

    const updateUserSpy = jest.spyOn(useAuthStore.getState(), 'updateUser');

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUserService.uploadAvatar).toHaveBeenCalledWith(file);
    expect(updateUserSpy).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Profile photo updated successfully!');
    updateUserSpy.mockRestore();
  });

  it('shows error toast on failure with api detail', async () => {
    const apiError = {
      response: { data: { detail: 'File too large' } },
    };
    mockedUserService.uploadAvatar.mockRejectedValue(apiError);

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('File too large');
  });

  it('shows fallback error toast on failure', async () => {
    mockedUserService.uploadAvatar.mockRejectedValue(new Error('network down'));

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('network down');
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import type { User, UserDetails } from '@/types/api.types';
import { useCurrentUser } from '@features/auth/hooks';
import { ProfileTab } from '@features/settings/components/ProfileTab';
import { useUpdateProfile } from '@features/settings/hooks/useUpdateProfile';
import { useUploadAvatar } from '@features/settings/hooks/useUploadAvatar';
import { useUserDetails } from '@features/settings/hooks/useUserDetails';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/auth/hooks', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('@features/settings/hooks/useUpdateProfile', () => ({
  useUpdateProfile: jest.fn(),
}));

jest.mock('@features/settings/hooks/useUploadAvatar', () => ({
  useUploadAvatar: jest.fn(),
}));

jest.mock('@features/settings/hooks/useUserDetails', () => ({
  useUserDetails: jest.fn(),
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: Object.assign(jest.fn(), {
    getState: jest.fn(),
    setState: jest.fn(),
    subscribe: jest.fn(),
  }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@components/common/AvatarPreviewDialog', () => ({
  AvatarPreviewDialog: () => null,
}));

jest.mock('@components/ui/avatar', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const R = require('react');
  return {
    Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      R.createElement('span', { className, 'data-slot': 'avatar' }, children),
    AvatarImage: ({ src, alt }: { src?: string; alt?: string }) =>
      src ? R.createElement('img', { src, alt, 'data-testid': 'avatar-image' }) : null,
    AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      R.createElement('span', { className, 'data-slot': 'avatar-fallback' }, children),
  };
});

const mockedUseCurrentUser = useCurrentUser as jest.Mock;
const mockedUseUpdateProfile = useUpdateProfile as jest.Mock;
const mockedUseUploadAvatar = useUploadAvatar as jest.Mock;
const mockedUseUserDetails = useUserDetails as jest.Mock;
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

const mockUser: User = {
  id: '1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatarUrl: null,
  role: 'member',
  createdAt: '2026-01-15T10:30:00.000Z',
  updatedAt: '2026-06-20T14:00:00.000Z',
};

const mockUserDetails: UserDetails = {
  profile_id: 'PRF-5001',
  user_id: 1,
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  mobile_number: '9876543210',
  date_of_birth: '1995-03-15',
  gender: 'Female',
  profile_status: 'Active',
  nationality: 'Indian',
  communication_preferences: ['Email', 'Push'],
  created_at: '2026-01-15T10:30:00.000Z',
  updated_at: '2026-06-20T14:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  mockedUseAuthStore.mockImplementation(
    (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
      selector({ user: mockUser, isAuthenticated: true }),
  );
  mockedUseCurrentUser.mockReturnValue({ data: mockUser });
  mockedUseUserDetails.mockReturnValue({ data: mockUserDetails });
  mockedUseUpdateProfile.mockReturnValue({ mutate: jest.fn(), isPending: false });
  mockedUseUploadAvatar.mockReturnValue({ mutate: jest.fn(), isPending: false });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ProfileTab', () => {
  it('renders profile information heading', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
  });

  it('displays fullName from userDetails first_name + last_name', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('displays email from userDetails', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThanOrEqual(1);
  });

  it('displays mobile number from userDetails', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getAllByText('9876543210').length).toBeGreaterThanOrEqual(1);
  });

  it('displays profile ID from userDetails', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('PRF-5001')).toBeInTheDocument();
  });

  it('displays formatted date of birth', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('15/03/1995')).toBeInTheDocument();
  });

  it('displays gender from userDetails', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getAllByText('Female').length).toBeGreaterThan(0);
  });

  it('displays profile status', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
  });

  it('displays nationality', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Indian')).toBeInTheDocument();
  });

  it('displays communication preferences joined by comma', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Email, Push')).toBeInTheDocument();
  });

  it('displays formatted created date', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
  });

  it('displays formatted updated date', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText(/Jun 20, 2026/)).toBeInTheDocument();
  });

  it('falls back to store user name when userDetails has no name', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows N/A for fields missing from both userDetails and user', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: {
            ...mockUser,
            mobile_number: null,
            mobileNumber: null,
            dateOfBirth: null,
            gender: null,
            nationality: null,
          },
          isAuthenticated: true,
        }),
    );
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(3);
  });

  it('falls back to store user when currentUser is null', () => {
    mockedUseCurrentUser.mockReturnValue({ data: null });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows avatar fallback letter when no avatar', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('shows avatar image when avatarUrl is present in userDetails', () => {
    mockedUseUserDetails.mockReturnValue({
      data: { ...mockUserDetails, avatar_url: 'https://example.com/avatar.png' },
    });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    const avatarImg = screen.getByTestId('avatar-image');
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(avatarImg).toHaveAttribute('alt', 'Jane Doe');
  });

  it('calls uploadAvatar.mutate when a valid image file is selected', () => {
    const mutate = jest.fn();
    mockedUseUploadAvatar.mockReturnValue({ mutate, isPending: false });

    render(createElement(ProfileTab), { wrapper: createWrapper() });

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput?.dispatchEvent(new Event('change', { bubbles: true }));

    expect(mutate).toHaveBeenCalledWith(file);
  });

  it('shows toast error for invalid file type', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput?.dispatchEvent(new Event('change', { bubbles: true }));

    expect(toast.error).toHaveBeenCalledWith('Only JPG, JPEG, and PNG image files are allowed.');
  });

  it('shows toast error for oversized file', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });

    const fileInput = document.querySelector('input[type="file"]');
    const bigContent = new Uint8Array(6 * 1024 * 1024);
    const file = new File([bigContent], 'big.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput?.dispatchEvent(new Event('change', { bubbles: true }));

    expect(toast.error).toHaveBeenCalledWith('Image size must be less than 5MB.');
  });

  it('shows uploading text when upload is pending', () => {
    mockedUseUploadAvatar.mockReturnValue({ mutate: jest.fn(), isPending: true });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('disables Remove button while upload is pending', () => {
    mockedUseUploadAvatar.mockReturnValue({ mutate: jest.fn(), isPending: true });
    mockedUseUpdateProfile.mockReturnValue({ mutate: jest.fn(), isPending: false });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
  });

  it('disables Remove button while profile update is pending', () => {
    mockedUseUpdateProfile.mockReturnValue({ mutate: jest.fn(), isPending: true });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
  });

  it('calls updateProfile.mutate when Remove button is clicked', async () => {
    const testUser = userEvent.setup();
    const mutate = jest.fn();
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false });

    render(createElement(ProfileTab), { wrapper: createWrapper() });

    await testUser.click(screen.getByRole('button', { name: 'Remove' }));

    expect(mutate).toHaveBeenCalledWith(
      { name: 'Jane Doe', email: 'jane@example.com', avatarUrl: '' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('opens EditProfileDialog when Edit Profile button is clicked', async () => {
    const testUser = userEvent.setup();

    render(createElement(ProfileTab), { wrapper: createWrapper() });

    const editButtons = screen.getAllByRole('button', { name: 'Edit Profile' });
    await testUser.click(editButtons[0] as HTMLButtonElement);

    expect(screen.getByText('Edit Profile Information')).toBeInTheDocument();
  });

  it('renders EditProfileDialog with open=false by default', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.queryByText('Edit Profile Information')).not.toBeInTheDocument();
  });

  it('handles userDetails with empty communication_preferences array', () => {
    mockedUseUserDetails.mockReturnValue({
      data: { ...mockUserDetails, communication_preferences: [] },
    });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles user with communicationPreferences (camelCase) from store', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: {
            ...mockUser,
            communicationPreferences: ['Email', 'SMS'],
            communication_preferences: null,
          },
          isAuthenticated: true,
        }),
    );
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Email, SMS')).toBeInTheDocument();
  });

  it('prefers userDetails fields over store user fields', () => {
    mockedUseUserDetails.mockReturnValue({
      data: { ...mockUserDetails, email: 'different@example.com' },
    });
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getAllByText('different@example.com').length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to user.avatarUrl when userDetails has no avatar', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: { ...mockUser, avatarUrl: 'https://example.com/store-avatar.png' },
          isAuthenticated: true,
        }),
    );
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    const avatarImg = screen.getByTestId('avatar-image');
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/store-avatar.png');
  });

  it('uses email initial as fallback when name is empty', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: { ...mockUser, name: '' },
          isAuthenticated: true,
        }),
    );
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders upload photo button', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Upload Photo')).toBeInTheDocument();
  });

  it('shows JPG/JPEG/PNG hint text', () => {
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('JPG, JPEG or PNG. Max size 5MB.')).toBeInTheDocument();
  });

  it('prefers user.first_name / user.last_name when userDetails is null', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: { ...mockUser, first_name: 'Alice', last_name: 'Smith' },
          isAuthenticated: true,
        }),
    );
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('shows AXR- prefix profile ID when no profile_id available', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: { ...mockUser, profile_id: null, profileId: null },
          isAuthenticated: true,
        }),
    );
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    expect(screen.getByText('AXR-1')).toBeInTheDocument();
  });

  it('shows avatar_url from store user when userDetails avatarUrl is empty', () => {
    mockedUseUserDetails.mockReturnValue({
      data: { ...mockUserDetails, avatar_url: null, avatarUrl: null },
    });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: { ...mockUser, avatar_url: 'https://example.com/store.png', avatarUrl: null },
          isAuthenticated: true,
        }),
    );
    render(createElement(ProfileTab), { wrapper: createWrapper() });
    const avatarImg = screen.getByTestId('avatar-image');
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/store.png');
  });
});

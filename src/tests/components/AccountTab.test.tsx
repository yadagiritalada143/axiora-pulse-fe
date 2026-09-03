import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import type { User } from '@/types/api.types';
import { useCurrentUser } from '@features/auth/hooks';
import { AccountTab } from '@features/settings/components/AccountTab';
import { useUserDetails } from '@features/settings/hooks/useUserDetails';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/auth/hooks', () => ({
  useCurrentUser: jest.fn(),
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

const mockedUseCurrentUser = useCurrentUser as jest.Mock;
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
  mockedUseUserDetails.mockReturnValue({
    data: {
      profile_id: 'PRF-5001',
      user_id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      mobile_number: '9876543210',
      profile_status: 'Active',
      communication_preferences: ['Email'],
      created_at: '2026-01-15T10:30:00.000Z',
      updated_at: '2026-06-20T14:00:00.000Z',
    },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:test-url');
  URL.revokeObjectURL = jest.fn();
});

afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

describe('AccountTab', () => {
  it('renders account information heading', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('Account Information')).toBeInTheDocument();
  });

  it('displays email from userDetails', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('displays mobile number from userDetails', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });

  it('displays masked password', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('••••••••••••••')).toBeInTheDocument();
  });

  it('displays "Verified Account" badge', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('Verified Account')).toBeInTheDocument();
  });

  it('renders Terms & Conditions section', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
  });

  it('displays terms acceptance info', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(
      screen.getByText(/Terms & Conditions accepted upon account creation/),
    ).toBeInTheDocument();
  });

  it('opens ChangePasswordDialog when Change password button is clicked', async () => {
    const testUser = userEvent.setup();
    render(createElement(AccountTab), { wrapper: createWrapper() });
    const changeButtons = screen.getAllByRole('button', { name: 'Change' });
    await testUser.click(changeButtons[1] as HTMLButtonElement);
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('opens EditProfileDialog when Change mobile button is clicked', async () => {
    const testUser = userEvent.setup();
    render(createElement(AccountTab), { wrapper: createWrapper() });
    const changeButtons = screen.getAllByRole('button', { name: 'Change' });
    await testUser.click(changeButtons[0] as HTMLButtonElement);
    expect(screen.getByText('Edit Profile Information')).toBeInTheDocument();
  });

  it('does not show ChangePasswordDialog by default', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
  });

  it('does not show EditProfileDialog by default', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.queryByText('Edit Profile Information')).not.toBeInTheDocument();
  });

  it('calls toast.success when Download Terms is clicked', async () => {
    const testUser = userEvent.setup();
    render(createElement(AccountTab), { wrapper: createWrapper() });
    await testUser.click(screen.getByRole('button', { name: /Download Terms/i }));
    expect(toast.success).toHaveBeenCalledWith('Terms & Conditions downloaded.');
  });

  it('falls back to store user when currentUser is null', () => {
    mockedUseCurrentUser.mockReturnValue({ data: null });
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('falls back to store user email when userDetails has no email', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows N/A when no email is available', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: { ...mockUser, email: '' },
          isAuthenticated: true,
        }),
    );
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to store user mobile when userDetails has no mobile', () => {
    mockedUseUserDetails.mockReturnValue({ data: null });
    mockedUseCurrentUser.mockReturnValue({ data: null });
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { user: User | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          user: { ...mockUser, mobileNumber: '1234567890', mobile_number: null },
          isAuthenticated: true,
        }),
    );
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('renders Download Terms button', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /Download Terms/i })).toBeInTheDocument();
  });

  it('displays terms content sections', () => {
    render(createElement(AccountTab), { wrapper: createWrapper() });
    expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument();
    expect(screen.getByText('2. Use of the Platform')).toBeInTheDocument();
    expect(screen.getByText('3. Data & Privacy')).toBeInTheDocument();
    expect(screen.getByText('4. Account Responsibility')).toBeInTheDocument();
  });
});

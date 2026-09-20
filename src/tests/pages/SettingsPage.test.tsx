import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import SettingsPage from '@pages/SettingsPage';

jest.mock('@features/auth/hooks', () => ({
  useCurrentUser: () => ({
    data: {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@mail.com',
      avatarUrl: null,
      role: 'user',
      createdAt: '2025-05-18T10:24:00Z',
      updatedAt: '2025-05-18T10:24:00Z',
      profileId: 'PRF-1001',
      firstName: 'John',
      lastName: 'Doe',
      mobileNumber: '+91 987 654 3210',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      profileStatus: 'Active',
      nationality: 'United States',
      communicationPreferences: ['Email', 'SMS', 'Push'],
      lastLoginDate: '2025-05-18T09:42:00Z',
    },
    isLoading: false,
  }),
  useLogout: () => jest.fn(),
}));

let mockAuthRole = 'user';

jest.mock('@store/auth.store', () => ({
  useAuthStore: (
    selector: (state: {
      user: unknown;
      role: string;
      isAuthenticated: boolean;
      logout: () => void;
    }) => unknown,
  ) =>
    selector({
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@mail.com',
        role: mockAuthRole,
      },
      role: mockAuthRole,
      isAuthenticated: true,
      logout: jest.fn(),
    }),
}));

jest.mock('@features/settings/hooks/useUserDetails', () => ({
  useUserDetails: () => ({
    data: {
      profile_id: 'PRF-1001',
      user_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@mail.com',
      mobile_number: '+91 987 654 3210',
      date_of_birth: '1990-06-15',
      gender: 'Male',
      profile_status: 'Active',
      nationality: 'United States',
      communication_preferences: ['Email', 'SMS', 'Push'],
      last_login_date: '2025-05-18T09:42:00Z',
      created_at: '2025-05-18T10:24:00Z',
      updated_at: '2025-05-18T10:24:00Z',
    },
    isLoading: false,
  }),
}));

jest.mock('@features/settings/hooks/useUpdateUserDetails', () => ({
  useUpdateUserDetails: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@features/settings/hooks/useUploadAvatar', () => ({
  useUploadAvatar: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@features/settings/hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@features/settings/hooks/useChangePassword', () => ({
  useChangePassword: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@features/pricing/hooks/useAccountStatus', () => ({
  useAccountStatus: () => ({
    data: {
      plan: 'builder',
      planName: 'Builder',
      status: 'active',
      priceMonthly: 499,
      billingPeriod: 'monthly',
      allowedWorkspaces: 3,
      usedWorkspaces: 2,
      allowedResponses: 500,
      usedResponses: 120,
      storageLimitMB: 500,
      storageUsedMB: 320,
    },
    isLoading: false,
    isError: false,
  }),
}));

jest.mock('@features/pricing/hooks/usePricingPlans', () => ({
  usePricingPlans: () => ({
    data: [],
    isLoading: false,
  }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mockAuthRole = 'user';
  });

  it('renders Settings header and Profile tab fields', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences, account and security.')).toBeInTheDocument();
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('PRF-1001')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getAllByText('john.doe@mail.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+91 987 654 3210').length).toBeGreaterThan(0);
  });

  it('switches between Profile and Account tabs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    await user.click(accountTab);

    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    expect(screen.getByText('Verified Account')).toBeInTheDocument();
  });

  it('opens Change Password modal on Account tab', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/settings?tab=account']}>
        <SettingsPage defaultTab="account" />
      </MemoryRouter>,
    );

    const changeButtons = screen.getAllByRole('button', { name: 'Change' });
    const targetBtn = changeButtons[1] ?? changeButtons[0];
    if (targetBtn) {
      await user.click(targetBtn);
    }

    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('opens Edit Profile modal from Profile tab', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const editButtons = screen.getAllByRole('button', { name: /edit profile/i });
    const editBtn = editButtons[0];
    if (editBtn) {
      fireEvent.click(editBtn);
    }

    expect(screen.getByRole('heading', { name: 'Edit Profile Information' })).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('switches to Plan Details tab and renders plan and usage information', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const planTab = screen.getByRole('tab', { name: /plan details/i });
    await user.click(planTab);

    expect(screen.getByText('Current Plan')).toBeInTheDocument();
    expect(screen.getByText('Usage Overview')).toBeInTheDocument();
    expect(screen.getByText('Plan Features')).toBeInTheDocument();
    expect(screen.getByText('Billing Details')).toBeInTheDocument();
  });

  it('hides Plan Details tab for admin users and redirects to profile', () => {
    mockAuthRole = 'admin';
    render(
      <MemoryRouter initialEntries={['/settings?tab=plan']}>
        <SettingsPage defaultTab="plan" />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('tab', { name: /plan details/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Current Plan')).not.toBeInTheDocument();
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
  });
});

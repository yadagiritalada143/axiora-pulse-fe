import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';

import type { User, UserDetails } from '@/types/api.types';
import { EditProfileDialog } from '@features/settings/components/EditProfileDialog';
import { useUpdateUserDetails } from '@features/settings/hooks/useUpdateUserDetails';

jest.mock('@features/settings/hooks/useUpdateUserDetails', () => ({
  useUpdateUserDetails: jest.fn(),
}));

const mockedUseUpdateUserDetails = useUpdateUserDetails as jest.Mock;

const mockUser: User = {
  id: '1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatarUrl: null,
  role: 'member',
  firstName: 'Jane',
  lastName: 'Doe',
  mobileNumber: '9876543210',
  dateOfBirth: '1995-03-15',
  gender: 'Female',
  nationality: 'Indian',
  communicationPreferences: ['Email', 'Push'],
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

const mutate = jest.fn();

beforeEach(() => {
  mockedUseUpdateUserDetails.mockReturnValue({
    mutate,
    isPending: false,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('EditProfileDialog', () => {
  it('renders when open is true', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Edit Profile Information')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      createElement(EditProfileDialog, {
        open: false,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.queryByText('Edit Profile Information')).not.toBeInTheDocument();
  });

  it('prefills firstName from userDetails', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('First Name')).toHaveValue('Jane');
  });

  it('prefills lastName from userDetails', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
  });

  it('prefills mobileNumber from userDetails', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('Mobile Number')).toHaveValue('9876543210');
  });

  it('prefills gender select from userDetails', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('Gender')).toHaveValue('Female');
  });

  it('prefills nationality from userDetails', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('Nationality')).toHaveValue('Indian');
  });

  it('prefills email notification checkbox', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('Email Notifications')).toBeChecked();
  });

  it('prefills push notification checkbox', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('Push Alerts')).toBeChecked();
  });

  it('unchecks SMS when not in preferences', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('SMS Updates')).not.toBeChecked();
  });

  it('falls back to user props when userDetails is null', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: null,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('First Name')).toHaveValue('Jane');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
    expect(screen.getByLabelText('Mobile Number')).toHaveValue('9876543210');
  });

  it('shows validation error when first name is cleared and form submitted', async () => {
    const testUser = userEvent.setup();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    const firstNameInput = screen.getByLabelText('First Name');
    await testUser.clear(firstNameInput);
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when last name is cleared and form submitted', async () => {
    const testUser = userEvent.setup();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    const lastNameInput = screen.getByLabelText('Last Name');
    await testUser.clear(lastNameInput);
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('Last name is required')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when mobile number is invalid', async () => {
    const testUser = userEvent.setup();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    const mobileInput = screen.getByLabelText('Mobile Number');
    await testUser.clear(mobileInput);
    await testUser.type(mobileInput, '12345');
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(
      await screen.findByText('Enter a valid 10-digit Indian mobile number'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('calls mutate with correct payload on valid submission', async () => {
    const testUser = userEvent.setup();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Jane',
        last_name: 'Doe',
        mobile_number: '9876543210',
        gender: 'Female',
        nationality: 'Indian',
        communication_preferences: expect.arrayContaining(['Email', 'Push']),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('calls onOpenChange(false) on successful mutation', async () => {
    const testUser = userEvent.setup();
    const onOpenChange = jest.fn();

    mockedUseUpdateUserDetails.mockReturnValue({
      mutate: jest.fn((_payload: unknown, options: { onSuccess: () => void }) => {
        options.onSuccess();
      }),
      isPending: false,
    });

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange,
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const testUser = userEvent.setup();
    const onOpenChange = jest.fn();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange,
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    await testUser.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables submit button while mutation is pending', () => {
    mockedUseUpdateUserDetails.mockReturnValue({
      mutate,
      isPending: true,
    });

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('disables Cancel button while mutation is pending', () => {
    mockedUseUpdateUserDetails.mockReturnValue({
      mutate,
      isPending: true,
    });

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('shows communication preferences checkboxes', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('SMS Updates')).toBeInTheDocument();
    expect(screen.getByLabelText('Push Alerts')).toBeInTheDocument();
  });

  it('splits user.name as fallback for first and last name when userDetails is null', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: { ...mockUser, firstName: null, lastName: null },
        userDetails: null,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByLabelText('First Name')).toHaveValue('Jane');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
  });

  it('allows gender selection', async () => {
    const testUser = userEvent.setup();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    await testUser.selectOptions(screen.getByLabelText('Gender'), 'Male');
    expect(screen.getByLabelText('Gender')).toHaveValue('Male');
  });

  it('can toggle email checkbox off', async () => {
    const testUser = userEvent.setup();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    await testUser.click(screen.getByLabelText('Email Notifications'));
    expect(screen.getByLabelText('Email Notifications')).not.toBeChecked();
  });

  it('includes empty array for communication_preferences when all unchecked', async () => {
    const testUser = userEvent.setup();

    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    await testUser.click(screen.getByLabelText('Email Notifications'));
    await testUser.click(screen.getByLabelText('Push Alerts'));
    await testUser.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ communication_preferences: [] }),
      expect.anything(),
    );
  });

  it('renders gender select with all options', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );

    expect(screen.getByRole('option', { name: 'Select gender' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Non-Binary' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Prefer not to say' })).toBeInTheDocument();
  });

  it('renders update user details description', () => {
    render(
      createElement(EditProfileDialog, {
        open: true,
        onOpenChange: jest.fn(),
        user: mockUser,
        userDetails: mockUserDetails,
      }),
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Update your personal and contact details')).toBeInTheDocument();
  });
});

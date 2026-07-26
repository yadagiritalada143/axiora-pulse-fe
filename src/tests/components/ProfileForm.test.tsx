import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { User } from '@/types/api.types';
import { ProfileForm } from '@features/settings/components/ProfileForm';
import { useUpdateProfile } from '@features/settings/hooks/useUpdateProfile';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/settings/hooks/useUpdateProfile', () => ({
  useUpdateProfile: jest.fn(),
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockedUseUpdateProfile = useUpdateProfile as jest.Mock;
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

const user: User = {
  id: '1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatarUrl: null,
  role: 'member',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ProfileForm', () => {
  const mutate = jest.fn();

  beforeEach(() => {
    mockedUseAuthStore.mockImplementation((selector: (state: { user: User }) => unknown) =>
      selector({ user }),
    );
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prefills the form with the current user', () => {
    render(<ProfileForm />);

    expect(screen.getByLabelText('Full name')).toHaveValue('Jane Doe');
    expect(screen.getByLabelText('Email address')).toHaveValue('jane@example.com');
  });

  it('submits the updated values', async () => {
    const testUser = userEvent.setup();
    render(<ProfileForm />);

    const nameInput = screen.getByLabelText('Full name');
    await testUser.clear(nameInput);
    await testUser.type(nameInput, 'Jane Smith');

    await testUser.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mutate).toHaveBeenCalledWith({ name: 'Jane Smith', email: 'jane@example.com' });
  });

  it('shows a validation error and does not submit when the name is too short', async () => {
    const testUser = userEvent.setup();
    render(<ProfileForm />);

    const nameInput = screen.getByLabelText('Full name');
    await testUser.clear(nameInput);
    await testUser.type(nameInput, 'J');

    await testUser.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Name is too short')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid email', async () => {
    const testUser = userEvent.setup();
    render(<ProfileForm />);

    const emailInput = screen.getByLabelText('Email address');
    await testUser.clear(emailInput);
    await testUser.type(emailInput, 'not-an-email');

    await testUser.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('defaults to empty fields when there is no current user', () => {
    mockedUseAuthStore.mockImplementation((selector: (state: { user: User | null }) => unknown) =>
      selector({ user: null }),
    );

    render(<ProfileForm />);

    expect(screen.getByLabelText('Full name')).toHaveValue('');
    expect(screen.getByLabelText('Email address')).toHaveValue('');
  });

  it('disables the submit button while pending', () => {
    mockedUseUpdateProfile.mockReturnValue({ mutate, isPending: true });

    render(<ProfileForm />);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });
});

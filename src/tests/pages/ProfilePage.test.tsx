import { render, screen } from '@testing-library/react';

import { ProfileForm } from '@features/settings/components/ProfileForm';
import ProfilePage from '@pages/ProfilePage';

jest.mock('@features/settings/components/ProfileForm', () => ({
  ProfileForm: jest.fn(() => <div>Profile Form Stub</div>),
}));

const mockedProfileForm = ProfileForm as jest.Mock;

describe('ProfilePage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page header and the profile form', () => {
    render(<ProfilePage />);

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('Manage your personal information.')).toBeInTheDocument();
    expect(screen.getByText('Profile Form Stub')).toBeInTheDocument();
    expect(mockedProfileForm).toHaveBeenCalledTimes(1);
  });
});

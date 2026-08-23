import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ProfilePage from '@pages/ProfilePage';

jest.mock('@pages/SettingsPage', () => ({
  __esModule: true,
  default: jest.fn(({ defaultTab }) => <div>SettingsPage Stub: {defaultTab}</div>),
}));

describe('ProfilePage', () => {
  it('renders SettingsPage with defaultTab set to profile', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('SettingsPage Stub: profile')).toBeInTheDocument();
  });
});

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import type { User } from '@/types/api.types';
import { Navbar } from '@components/layout/Navbar';
import { useAuthStore } from '@store/auth.store';
import { useUIStore } from '@store/ui.store';

jest.mock('@services/api/tokenManager', () => ({
  tokenManager: { setTokens: jest.fn(), clearTokens: jest.fn() },
}));

const mockLogout = jest.fn();

jest.mock('@features/auth/hooks', () => ({
  useLogout: () => mockLogout,
  useCurrentUser: jest.fn(() => ({ data: null, isLoading: false })),
}));

const mockUser: User = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatarUrl: null,
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function renderNavbar(props: Parameters<typeof Navbar>[0] = {}) {
  return render(
    <MemoryRouter>
      <Navbar {...props} />
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  const initialAuthState = useAuthStore.getState();
  const initialUIState = useUIStore.getState();

  afterEach(() => {
    act(() => {
      useAuthStore.setState(initialAuthState, true);
      useUIStore.setState(initialUIState, true);
    });
  });

  it('renders an "Account" fallback and "U" avatar initial when no user is authenticated', () => {
    renderNavbar();

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it("renders the authenticated user's name and avatar initial", () => {
    act(() => {
      useAuthStore.getState().updateUser(mockUser);
    });

    renderNavbar();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders a search input and calls onSearch when provided', () => {
    const onSearch = jest.fn();
    renderNavbar({ onSearch });

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('does not render a search input when onSearch is not provided', () => {
    renderNavbar();

    expect(screen.queryByLabelText('Search')).not.toBeInTheDocument();
  });

  it('renders custom actions content', () => {
    renderNavbar({ actions: <button type="button">Upgrade</button> });

    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
  });

  it('toggles the sidebar when the menu button is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    expect(useUIStore.getState().isSidebarOpen).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });

  it('opens the account menu and logs out when "Log out" is selected', async () => {
    const user = userEvent.setup();
    act(() => {
      useAuthStore.getState().updateUser(mockUser);
      useAuthStore.getState().setAuthenticated('token');
    });

    renderNavbar();

    await user.click(screen.getByRole('button', { name: /jane doe/i }));

    const logoutItem = await screen.findByText('Log out');
    await user.click(logoutItem);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('opens the account menu showing link to settings', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: /account/i }));

    expect(await screen.findByRole('menuitem', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
    expect(screen.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument();
  });
});

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutGrid, ListChecks } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';

import { useLogout } from '@features/auth/hooks';
import { MentorShell } from '@features/ideaValidation/components/MentorShell';
import { useUserDetails } from '@features/settings/hooks/useUserDetails';
import { useAuthStore } from '@store/auth.store';

jest.mock('@features/auth/hooks', () => ({
  useLogout: jest.fn(),
  useCurrentUser: jest.fn(() => ({ data: null, isLoading: false })),
}));

jest.mock('@features/settings/hooks/useUserDetails', () => ({
  useUserDetails: jest.fn(() => ({ data: null, isLoading: false })),
}));

const mockedUseLogout = jest.mocked(useLogout);
const mockedUseUserDetails = useUserDetails as jest.Mock;

function renderShell() {
  return render(
    <MemoryRouter>
      <MentorShell>
        <p>Dashboard content</p>
      </MentorShell>
    </MemoryRouter>,
  );
}

describe('MentorShell', () => {
  const handleLogout = jest.fn();
  const initialAuthState = useAuthStore.getState();

  beforeEach(() => {
    mockedUseLogout.mockReturnValue(handleLogout);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockedUseUserDetails.mockReturnValue({ data: null, isLoading: false });
    act(() => {
      useAuthStore.setState(initialAuthState, true);
    });
  });

  it('renders its children alongside the Pulse wordmark', () => {
    renderShell();

    expect(screen.getByText('Pulse')).toBeInTheDocument();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('opens and closes the mobile navigation via the menu toggle buttons', async () => {
    const user = userEvent.setup();
    renderShell();

    const nav = screen.getByRole('complementary');
    expect(nav.className).toContain('-translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(nav.className).toContain('translate-x-0');
    expect(nav.className).not.toContain('-translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(nav.className).toContain('-translate-x-full');
  });

  it('closes the mobile navigation when the overlay behind it is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const nav = screen.getByRole('complementary');
    expect(nav.className).toContain('translate-x-0');

    const overlay = container.querySelector('[aria-hidden="true"].fixed.inset-0');
    if (!(overlay instanceof HTMLElement)) {
      throw new Error('Expected the mobile nav overlay to be in the document');
    }
    await user.click(overlay);

    expect(nav.className).toContain('-translate-x-full');
  });

  it('renders custom nav items and section label when provided', () => {
    render(
      <MemoryRouter>
        <MentorShell
          overviewItem={{
            label: 'Overview',
            icon: LayoutGrid,
            href: '/admin/dashboard',
            end: true,
          }}
          navItems={[
            {
              label: 'Interactive Questions',
              icon: ListChecks,
              href: '/admin/interactive-questions',
            },
          ]}
          navSectionLabel="Admin"
        >
          <p>Admin content</p>
        </MentorShell>
      </MemoryRouter>,
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Interactive Questions' })).toHaveAttribute(
      'href',
      '/admin/interactive-questions',
    );
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
  });

  it('logs out from the mobile nav footer', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('logs out from the desktop account dropdown', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('button', { name: /account menu/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('collapses and expands the sidebar on desktop via the toggle buttons', async () => {
    const user = userEvent.setup();
    renderShell();

    const nav = screen.getByRole('complementary');
    expect(nav.className).not.toContain('lg:w-0');
    expect(screen.queryByRole('button', { name: 'Expand sidebar' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(nav.className).toContain('lg:w-0');
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(nav.className).not.toContain('lg:w-0');
    expect(screen.queryByRole('button', { name: 'Expand sidebar' })).not.toBeInTheDocument();
  });

  it('renders user first and last name in the account menu', () => {
    act(() => {
      useAuthStore.getState().updateUser({
        id: '1',
        email: 'user@example.com',
        name: 'old_username',
        firstName: 'Sarah',
        lastName: 'Connor',
        avatarUrl: null,
        role: 'member',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    renderShell();

    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('prioritizes userDetails first_name and last_name in the account menu', () => {
    act(() => {
      useAuthStore.getState().updateUser({
        id: '1',
        email: 'user@example.com',
        name: 'Default User',
        avatarUrl: null,
        role: 'member',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    mockedUseUserDetails.mockReturnValueOnce({
      data: {
        first_name: 'John',
        last_name: 'Wick',
      },
      isLoading: false,
    });

    renderShell();

    expect(screen.getByText('John Wick')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});

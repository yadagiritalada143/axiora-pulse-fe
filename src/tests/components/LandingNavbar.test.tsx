import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { AccountRole } from '@/types/common.types';
import { LandingNavbar } from '@features/landing/components/LandingNavbar';
import { useAuthStore } from '@store/auth.store';

function setAuth(isAuthenticated: boolean, role: AccountRole | null) {
  act(() => {
    useAuthStore.setState({ isAuthenticated, role });
  });
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <LandingNavbar />
    </MemoryRouter>,
  );
}

describe('LandingNavbar', () => {
  const initialAuthState = useAuthStore.getState();

  afterEach(() => {
    act(() => {
      useAuthStore.setState(initialAuthState, true);
    });
    document.body.style.overflow = '';
  });

  it('renders nav links, brand and desktop actions for guests', () => {
    setAuth(false, null);

    renderNavbar();

    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders Dashboard and My Workspace for authenticated users', () => {
    setAuth(true, 'user');

    renderNavbar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('opens the mobile drawer when the hamburger is clicked and locks body scroll', () => {
    setAuth(false, null);

    renderNavbar();

    const hamburger = screen.getByRole('button', { name: 'Toggle navigation menu' });
    fireEvent.click(hamburger);

    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getAllByText('Get Started').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Close menu backdrop' })).toBeInTheDocument();
  });

  it('closes the mobile drawer when clicking the backdrop', () => {
    setAuth(false, null);

    renderNavbar();

    const hamburger = screen.getByRole('button', { name: 'Toggle navigation menu' });
    fireEvent.click(hamburger);
    expect(document.body.style.overflow).toBe('hidden');

    const backdrop = screen.getByRole('button', { name: 'Close menu backdrop' });
    fireEvent.click(backdrop);

    expect(document.body.style.overflow).toBe('');
    expect(screen.queryByRole('button', { name: 'Close menu backdrop' })).not.toBeInTheDocument();
  });

  it('prevents default and scrolls to a section from nav link', () => {
    setAuth(false, null);

    renderNavbar();

    const faqLink = screen.getByText('FAQ');
    fireEvent.click(faqLink);
    expect(faqLink.getAttribute('href')).toBe('#faq');
  });
});

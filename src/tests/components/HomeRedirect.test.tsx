import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { HomeRedirect } from '@app/router/HomeRedirect';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

function renderWithAuthState(state: {
  isAuthenticated: boolean;
  hasActivePlan: boolean;
  onboardingPending: boolean;
  role?: 'user' | 'admin' | null;
}) {
  mockUseAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ role: null, ...state }),
  );

  return render(
    <MemoryRouter initialEntries={[ROUTES.HOME]}>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomeRedirect />} />
        <Route path={ROUTES.LOGIN} element={<div>Login page</div>} />
        <Route path={ROUTES.DASHBOARD} element={<div>Dashboard page</div>} />
        <Route path={ROUTES.PRICING} element={<div>Pricing page</div>} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<div>Admin dashboard page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HomeRedirect', () => {
  it('redirects to login when unauthenticated', () => {
    renderWithAuthState({ isAuthenticated: false, hasActivePlan: false, onboardingPending: false });

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects to pricing when onboarding is pending without an active plan', () => {
    renderWithAuthState({ isAuthenticated: true, hasActivePlan: false, onboardingPending: true });

    expect(screen.getByText('Pricing page')).toBeInTheDocument();
  });

  it('redirects to the dashboard when authenticated with an active plan', () => {
    renderWithAuthState({ isAuthenticated: true, hasActivePlan: true, onboardingPending: false });

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('redirects to pricing when authenticated without an active plan and onboarding is done', () => {
    renderWithAuthState({ isAuthenticated: true, hasActivePlan: false, onboardingPending: false });

    expect(screen.getByText('Pricing page')).toBeInTheDocument();
  });

  it('redirects an admin straight to the admin dashboard', () => {
    renderWithAuthState({
      isAuthenticated: true,
      hasActivePlan: false,
      onboardingPending: false,
      role: 'admin',
    });

    expect(screen.getByText('Admin dashboard page')).toBeInTheDocument();
  });
});

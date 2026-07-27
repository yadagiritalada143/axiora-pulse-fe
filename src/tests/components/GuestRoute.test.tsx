import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { GuestRoute } from '@app/router/GuestRoute';
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
    <MemoryRouter initialEntries={[ROUTES.LOGIN]}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.LOGIN} element={<div>Login page</div>} />
        </Route>
        <Route path={ROUTES.DASHBOARD} element={<div>Dashboard page</div>} />
        <Route path={ROUTES.PRICING} element={<div>Pricing page</div>} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<div>Admin dashboard page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GuestRoute', () => {
  it('renders the guest route content when unauthenticated', () => {
    renderWithAuthState({ isAuthenticated: false, hasActivePlan: false, onboardingPending: false });

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects an authenticated user with pending onboarding to the dashboard', () => {
    renderWithAuthState({ isAuthenticated: true, hasActivePlan: false, onboardingPending: true });

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('redirects an authenticated user with an active plan to the dashboard', () => {
    renderWithAuthState({ isAuthenticated: true, hasActivePlan: true, onboardingPending: false });

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('redirects an authenticated user with no active plan to pricing', () => {
    renderWithAuthState({ isAuthenticated: true, hasActivePlan: false, onboardingPending: false });

    expect(screen.getByText('Pricing page')).toBeInTheDocument();
  });

  it('redirects an authenticated admin to the admin dashboard, bypassing plan selection', () => {
    renderWithAuthState({
      isAuthenticated: true,
      hasActivePlan: false,
      onboardingPending: false,
      role: 'admin',
    });

    expect(screen.getByText('Admin dashboard page')).toBeInTheDocument();
  });
});

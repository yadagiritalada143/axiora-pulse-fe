import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AdminRoute } from '@app/router/AdminRoute';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

function renderWithRole(role: 'user' | 'admin' | null) {
  mockUseAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ role, isAuthenticated: true }),
  );

  return render(
    <MemoryRouter initialEntries={[ROUTES.ADMIN_DASHBOARD]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<div>Admin dashboard page</div>} />
        </Route>
        <Route path={ROUTES.DASHBOARD} element={<div>Dashboard page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderUnauthenticated() {
  mockUseAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ role: null, isAuthenticated: false }),
  );

  return render(
    <MemoryRouter initialEntries={[ROUTES.ADMIN_DASHBOARD]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<div>Admin dashboard page</div>} />
        </Route>
        <Route path={ROUTES.ADMIN_LOGIN} element={<div>Admin login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  it('renders the gated content for an admin', () => {
    renderWithRole('admin');

    expect(screen.getByText('Admin dashboard page')).toBeInTheDocument();
  });

  it('redirects an unauthenticated visitor to the admin login page', () => {
    renderUnauthenticated();

    expect(screen.getByText('Admin login page')).toBeInTheDocument();
  });

  it('redirects a regular user to the dashboard', () => {
    renderWithRole('user');

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('redirects to the dashboard when there is no role', () => {
    renderWithRole(null);

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });
});

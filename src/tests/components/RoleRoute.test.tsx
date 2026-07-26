import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { RoleRoute } from '@app/router/RoleRoute';
import { ROLES } from '@constants/roles';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

function renderWithUser(user: { role: string } | null) {
  mockUseAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ user }),
  );

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<RoleRoute minimumRole={ROLES.ADMIN} />}>
          <Route path="/admin" element={<div>Admin page</div>} />
        </Route>
        <Route path={ROUTES.DASHBOARD} element={<div>Dashboard page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleRoute', () => {
  it('renders the gated content when the user meets the minimum role', () => {
    renderWithUser({ role: ROLES.ADMIN });

    expect(screen.getByText('Admin page')).toBeInTheDocument();
  });

  it('renders the gated content when the user exceeds the minimum role', () => {
    renderWithUser({ role: ROLES.OWNER });

    expect(screen.getByText('Admin page')).toBeInTheDocument();
  });

  it('redirects to the dashboard when the user is below the minimum role', () => {
    renderWithUser({ role: ROLES.VIEWER });

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('redirects to the dashboard when there is no user', () => {
    renderWithUser(null);

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });
});

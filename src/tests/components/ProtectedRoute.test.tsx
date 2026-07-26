import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@app/router/ProtectedRoute';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

function renderWithAuthState(isAuthenticated: boolean, initialEntry = ROUTES.DASHBOARD) {
  mockUseAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({ isAuthenticated }),
  );

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD} element={<div>Dashboard page</div>} />
        </Route>
        <Route path={ROUTES.LOGIN} element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('renders the protected content when authenticated', () => {
    renderWithAuthState(true);

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    renderWithAuthState(false);

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});

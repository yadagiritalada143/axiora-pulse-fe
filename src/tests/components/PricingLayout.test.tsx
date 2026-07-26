import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouterDom from 'react-router-dom';

import { PricingLayout } from '@app/layouts/PricingLayout';
import { ROUTES } from '@constants/routes';
import { authService } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

jest.mock('@config/env', () => ({
  env: { appName: 'Axiora Pulse', apiUrl: '', aiStreaming: false, isDev: false, isProd: true },
}));

jest.mock('@services/auth', () => ({
  authService: { logout: jest.fn() },
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof ReactRouterDom>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockLogout = authService.logout as jest.Mock;

function renderPricingLayout() {
  render(
    <MemoryRouter>
      <PricingLayout />
    </MemoryRouter>,
  );
}

describe('PricingLayout', () => {
  const clearSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ clearSession }),
    );
    mockLogout.mockResolvedValue(undefined);
  });

  it('renders the app name', () => {
    renderPricingLayout();

    expect(screen.getByText('Axiora Pulse')).toBeInTheDocument();
  });

  it('logs out, clears the session and redirects to login when "Log out" is clicked', async () => {
    const user = userEvent.setup();
    renderPricingLayout();

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true });
  });

  it('still clears the session and redirects when the logout API call rejects', async () => {
    mockLogout.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    renderPricingLayout();

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true });
  });
});

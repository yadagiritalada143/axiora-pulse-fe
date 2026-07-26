import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { PricingPlans } from '@features/pricing/components/PricingPlans';
import { useAuthStore } from '@store/auth.store';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

// embla-carousel-react relies on layout APIs (ResizeObserver, matchMedia) that
// jsdom doesn't implement; stub it so the mobile carousel branch doesn't crash.
// The carousel's own scroll/drag behavior is therefore not covered here.
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), undefined],
}));

const mockedUseNavigate = useNavigate as jest.Mock;
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

describe('PricingPlans', () => {
  const navigate = jest.fn();
  const setHasActivePlan = jest.fn();

  beforeEach(() => {
    mockedUseNavigate.mockReturnValue(navigate);
    mockedUseAuthStore.mockImplementation(
      (selector: (state: { setHasActivePlan: typeof setHasActivePlan }) => unknown) =>
        selector({ setHasActivePlan }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the desktop grid with all plans', () => {
    render(<PricingPlans />);

    expect(screen.getByText('Pricing Plans')).toBeInTheDocument();
    expect(screen.getAllByText('Starter Plan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Professional').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enterprise').length).toBeGreaterThan(0);
  });

  it('toggles between monthly and yearly pricing', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    expect(screen.getAllByText(/₹799/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Annually' }));

    expect(screen.getAllByText(/₹7,990/).length).toBeGreaterThan(0);
  });

  it('marks the user as having an active plan and navigates to the dashboard on select', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const [firstStarterHeading] = screen.getAllByText('Starter Plan');
    if (!firstStarterHeading) throw new Error('Starter Plan heading not found');

    const desktopGrid = firstStarterHeading.closest('.sm\\:grid');
    expect(desktopGrid).not.toBeNull();

    if (!desktopGrid) throw new Error('desktop grid not found');

    const starterCard = within(desktopGrid as HTMLElement)
      .getByText('Starter Plan')
      .closest('.rounded-2xl');
    expect(starterCard).not.toBeNull();

    const chooseButton = within(starterCard as HTMLElement).getByRole('button', {
      name: 'Choose plan',
    });
    await user.click(chooseButton);

    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });
});

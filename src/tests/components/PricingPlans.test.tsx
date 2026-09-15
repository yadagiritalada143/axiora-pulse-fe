import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { PricingPlan } from '@/types/api.types';
import { ROUTES } from '@constants/routes';
import { PricingPlans } from '@features/pricing/components/PricingPlans';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { useSubscribe } from '@features/pricing/hooks/useSubscribe';
import { useAuthStore } from '@store/auth.store';

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@features/pricing/hooks/usePricingPlans', () => ({
  usePricingPlans: jest.fn(),
}));

jest.mock('@features/pricing/hooks/useSubscribe', () => ({
  useSubscribe: jest.fn(),
}));

// embla-carousel-react relies on layout APIs (ResizeObserver, matchMedia) that
// jsdom doesn't implement; stub it so the mobile carousel branch doesn't crash.
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), undefined],
}));

const mockedUseNavigate = useNavigate as jest.Mock;
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockedUsePricingPlans = usePricingPlans as jest.Mock;
const mockedUseSubscribe = useSubscribe as jest.Mock;

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    priceMonthly: 0,
    priceYearly: 0,
    features: ['1 workspace/idea for 7 days'],
    description: 'For students exploring and validating their first startup idea.',
    popular: false,
  },
  {
    id: 'builder',
    name: 'Builder',
    priceMonthly: 499,
    priceYearly: 4990,
    features: ['3 workspaces/ideas'],
    description:
      'For students building projects and early-stage startups who need deeper validation and research.',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 999,
    priceYearly: 9990,
    features: ['10 workspaces/ideas'],
    description:
      'For student founders and power users who need advanced validation, insights, and greater workspace capacity.',
    popular: false,
  },
];

describe('PricingPlans', () => {
  const navigate = jest.fn();
  const setHasActivePlan = jest.fn();
  const setShowQuestionnaireIntro = jest.fn();
  const subscribeMutate = jest.fn((_vars: unknown, opts?: { onSuccess?: () => void }) =>
    opts?.onSuccess?.(),
  );

  beforeEach(() => {
    mockedUseNavigate.mockReturnValue(navigate);

    mockedUseAuthStore.mockImplementation(
      (
        selector: (state: {
          setHasActivePlan: typeof setHasActivePlan;
          setShowQuestionnaireIntro: typeof setShowQuestionnaireIntro;
        }) => unknown,
      ) =>
        selector({
          setHasActivePlan,
          setShowQuestionnaireIntro,
        }),
    );

    mockedUsePricingPlans.mockReturnValue({
      data: PLANS,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    mockedUseSubscribe.mockReturnValue({
      mutate: subscribeMutate,
      isPending: false,
      variables: undefined,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the desktop grid with all plans and active styling for Starter', () => {
    render(<PricingPlans />);

    expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    expect(screen.getByText('Pricing Plans')).toBeInTheDocument();
    expect(screen.getAllByText('Starter').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Builder').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pro').length).toBeGreaterThan(0);

    // Starter should be marked as Active Plan
    expect(screen.getAllByText('Active Plan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Current Starter (Free)').length).toBeGreaterThan(0);
  });

  it('renders only monthly pricing and does not render yearly billing toggle', () => {
    render(<PricingPlans />);

    expect(screen.queryByRole('button', { name: 'Annually' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Monthly' })).not.toBeInTheDocument();
    expect(screen.getAllByText(/\/ month/).length).toBeGreaterThan(0);
  });

  it('navigates straight to dashboard when clicking the active free Starter plan', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const [starterButton] = screen.getAllByText('Current Starter (Free)');
    if (!starterButton) throw new Error('starterButton not found');
    await user.click(starterButton);

    expect(subscribeMutate).not.toHaveBeenCalled();
    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('shows unavailable toast when clicking Builder plan', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const [chooseBuilderButton] = screen.getAllByText('Choose Builder');
    if (!chooseBuilderButton) throw new Error('chooseBuilderButton not found');
    await user.click(chooseBuilderButton);

    expect(toast.info).toHaveBeenCalledWith(
      'This plans is not available it will be active on 7 days ',
    );
    expect(subscribeMutate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows unavailable toast when clicking Pro plan', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const [chooseProButton] = screen.getAllByText('Choose Pro');
    if (!chooseProButton) throw new Error('chooseProButton not found');
    await user.click(chooseProButton);

    expect(toast.info).toHaveBeenCalledWith(
      'This plans is not available it will be active on 7 days ',
    );
    expect(subscribeMutate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('renders an error message and retries via the Try again button', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockedUsePricingPlans.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Plans failed to load'),
      refetch,
    });

    render(<PricingPlans />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalled();
  });

  it('renders loading spinner when plans are loading', () => {
    mockedUsePricingPlans.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<PricingPlans />);

    const heading = screen.getByText('Choose your plan');
    expect(heading).toBeInTheDocument();
    expect(screen.queryByText('Current Starter (Free)')).not.toBeInTheDocument();
  });
});

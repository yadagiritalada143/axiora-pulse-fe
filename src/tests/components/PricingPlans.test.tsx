import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

import type { PricingPlan } from '@/types/api.types';
import { ROUTES } from '@constants/routes';
import { PricingPlans } from '@features/pricing/components/PricingPlans';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { useSelectFreePlan } from '@features/pricing/hooks/useSelectFreePlan';
import { useSubscribe } from '@features/pricing/hooks/useSubscribe';
import { useAuthStore } from '@store/auth.store';

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

jest.mock('@features/pricing/hooks/useSelectFreePlan', () => ({
  useSelectFreePlan: jest.fn(),
}));

jest.mock('@features/pricing/hooks/useAccountStatus', () => ({
  useAccountStatus: jest.fn(() => ({ data: { plan: 'starter' } })),
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
const mockedUseSelectFreePlan = useSelectFreePlan as jest.Mock;

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    code: 'starter',
    name: 'Starter',
    priceMonthly: 0,
    priceYearly: 0,
    price_monthly: 0,
    price_yearly: 0,
    old_price: 299,
    currency: 'INR',
    features: [],
    workspace_limit: 1,
    survey_response_cap: 100,
    regeneration_limit: 2,
    export_enabled: false,
    stage_rerun: 1,
    survey_analytics: 'Basic',
    storage_limit: 200,
    popular: false,
    tier: 0,
  },
  {
    id: 'builder',
    code: 'builder',
    name: 'Builder',
    priceMonthly: 499,
    priceYearly: 4990,
    price_monthly: 499,
    price_yearly: 4990,
    old_price: 999,
    currency: 'INR',
    features: [],
    workspace_limit: 3,
    survey_response_cap: 500,
    regeneration_limit: 5,
    export_enabled: true,
    stage_rerun: 3,
    survey_analytics: 'Advanced',
    storage_limit: 500,
    popular: true,
    tier: 1,
  },
  {
    id: 'pro',
    code: 'pro',
    name: 'Pro',
    priceMonthly: 999,
    priceYearly: 9990,
    price_monthly: 999,
    price_yearly: 9990,
    old_price: 1999,
    currency: 'INR',
    features: [],
    workspace_limit: 10,
    survey_response_cap: 2000,
    regeneration_limit: 10,
    export_enabled: true,
    stage_rerun: 5,
    survey_analytics: 'Advanced',
    storage_limit: 2048,
    popular: false,
    tier: 2,
  },
];

describe('PricingPlans', () => {
  const navigate = jest.fn();
  const setHasActivePlan = jest.fn();
  const setShowQuestionnaireIntro = jest.fn();
  const subscribeMutate = jest.fn((_vars: unknown, opts?: { onSuccess?: () => void }) =>
    opts?.onSuccess?.(),
  );
  const selectFreeMutate = jest.fn((_vars: unknown, opts?: { onSuccess?: () => void }) =>
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

    mockedUseSelectFreePlan.mockReturnValue({
      mutate: selectFreeMutate,
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

    expect(screen.getAllByText('Active Plan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Current Plan').length).toBeGreaterThan(0);

    expect(screen.getAllByText('₹499').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹999').length).toBeGreaterThan(0);

    const strikethroughElements = document.querySelectorAll('.line-through');
    expect(strikethroughElements.length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹299 / month').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹999 / month').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹1,999 / month').length).toBeGreaterThan(0);
  });

  it('renders only monthly pricing and does not render yearly billing toggle', () => {
    render(<PricingPlans />);

    expect(screen.queryByRole('button', { name: 'Annually' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Monthly' })).not.toBeInTheDocument();
    expect(screen.getAllByText(/\/ month/).length).toBeGreaterThan(0);
  });

  it('starts the free trial then enters the dashboard when clicking the free Starter plan', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const [starterButton] = screen.getAllByText('Current Plan');
    if (!starterButton) throw new Error('starterButton not found');
    await user.click(starterButton);

    expect(selectFreeMutate).toHaveBeenCalledWith('starter', expect.any(Object));
    expect(subscribeMutate).not.toHaveBeenCalled();
    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('opens Razorpay checkout (monthly) when clicking Builder plan', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const [chooseBuilderButton] = screen.getAllByText('Choose Builder');
    if (!chooseBuilderButton) throw new Error('chooseBuilderButton not found');
    await user.click(chooseBuilderButton);

    expect(subscribeMutate).toHaveBeenCalledWith(
      { planId: 'builder', billingPeriod: 'monthly' },
      expect.any(Object),
    );
    expect(selectFreeMutate).not.toHaveBeenCalled();
    // No "Stay Tuned" placeholder dialog anymore.
    expect(screen.queryByText('Stay Tuned !')).not.toBeInTheDocument();
    // On successful verification we optimistically enter the app.
    expect(navigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('opens Razorpay checkout (monthly) when clicking Pro plan', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const [chooseProButton] = screen.getAllByText('Choose Pro');
    if (!chooseProButton) throw new Error('chooseProButton not found');
    await user.click(chooseProButton);

    expect(subscribeMutate).toHaveBeenCalledWith(
      { planId: 'pro', billingPeriod: 'monthly' },
      expect.any(Object),
    );
    expect(selectFreeMutate).not.toHaveBeenCalled();
    expect(screen.queryByText('Stay Tuned !')).not.toBeInTheDocument();
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
    expect(screen.queryByText('Current Plan')).not.toBeInTheDocument();
  });
});

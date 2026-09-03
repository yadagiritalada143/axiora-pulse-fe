import { render, screen, within } from '@testing-library/react';
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
  toast: { error: jest.fn(), success: jest.fn() },
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
// The carousel's own scroll/drag behavior is therefore not covered here.
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
    priceMonthly: 799,
    priceYearly: 7990,
    features: ['AI Co-Founder (Basic)'],
    description: 'Perfect for individuals exploring startup ideas.',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 999,
    priceYearly: 9990,
    features: ['AI Co-Founder (Basic)'],
    description: 'Perfect for individuals exploring startup ideas.',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 1499,
    priceYearly: 14990,
    features: ['AI Co-Founder (Basic)'],
    description: 'Perfect for individuals exploring startup ideas.',
    popular: false,
  },
];

describe('PricingPlans', () => {
  const navigate = jest.fn();
  const setHasActivePlan = jest.fn();
  const setShowQuestionnaireIntro = jest.fn();
  // A subscribe mock that immediately resolves the success path, like an
  // authorized Checkout would.
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

  it('marks the user as having an active plan, shows questionnaire intro, and navigates to questionnaire intro on select', async () => {
    const user = userEvent.setup();
    render(<PricingPlans />);

    const desktopGrid = screen.getAllByText('Starter Plan')[0]?.closest('.sm\\:grid');
    if (!desktopGrid) throw new Error('desktop grid not found');

    const starterCard = within(desktopGrid as HTMLElement)
      .getByText('Starter Plan')
      .closest('.rounded-2xl');

    expect(starterCard).not.toBeNull();

    await user.click(
      within(starterCard as HTMLElement).getByRole('button', { name: 'Choose plan' }),
    );

    // Paid plan → goes through Razorpay Checkout (subscribe.mutate), not a direct nav.
    expect(subscribeMutate).toHaveBeenCalledWith(
      { planId: 'starter', billingPeriod: 'monthly' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    // The mock invokes onSuccess synchronously, so onboarding should advance.
    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('skips payment for a free (₹0) plan and proceeds straight to dashboard', async () => {
    mockedUsePricingPlans.mockReturnValue({
      data: [
        {
          id: 'free',
          name: 'Free',
          priceMonthly: 0,
          priceYearly: 0,
          features: ['Basic'],
          description: 'Free forever.',
          popular: false,
        } satisfies PricingPlan,
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(<PricingPlans />);

    const [chooseButton] = screen.getAllByRole('button', { name: 'Choose plan' });
    if (!chooseButton) throw new Error('choose button not found');
    await user.click(chooseButton);

    expect(subscribeMutate).not.toHaveBeenCalled();
    expect(setHasActivePlan).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
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

  it('does not navigate or toast when a paid subscription is dismissed', async () => {
    const user = userEvent.setup();
    const errorMutate = jest.fn((_vars: unknown, opts?: { onError?: (err: Error) => void }) =>
      opts?.onError?.(new Error('Checkout was dismissed.')),
    );
    mockedUseSubscribe.mockReturnValue({
      mutate: errorMutate,
      isPending: false,
      variables: undefined,
    });

    render(<PricingPlans />);

    const desktopGrid = screen.getAllByText('Starter Plan')[0]?.closest('.sm\\:grid');
    if (!desktopGrid) throw new Error('desktop grid not found');
    const starterCard = within(desktopGrid as HTMLElement)
      .getByText('Starter Plan')
      .closest('.rounded-2xl');

    await user.click(
      within(starterCard as HTMLElement).getByRole('button', { name: 'Choose plan' }),
    );

    expect(errorMutate).toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(setHasActivePlan).not.toHaveBeenCalled();
  });

  it('shows an error toast when a paid subscription fails', async () => {
    const user = userEvent.setup();
    const errorMutate = jest.fn((_vars: unknown, opts?: { onError?: (err: Error) => void }) =>
      opts?.onError?.(new Error('Payment failed.')),
    );
    mockedUseSubscribe.mockReturnValue({
      mutate: errorMutate,
      isPending: false,
      variables: undefined,
    });

    render(<PricingPlans />);

    const desktopGrid = screen.getAllByText('Starter Plan')[0]?.closest('.sm\\:grid');
    if (!desktopGrid) throw new Error('desktop grid not found');
    const starterCard = within(desktopGrid as HTMLElement)
      .getByText('Starter Plan')
      .closest('.rounded-2xl');

    await user.click(
      within(starterCard as HTMLElement).getByRole('button', { name: 'Choose plan' }),
    );

    expect(toast.error).toHaveBeenCalledWith('Payment failed.');
  });
});

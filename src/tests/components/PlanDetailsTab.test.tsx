import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { PricingPlan } from '@/types/api.types';
import type { AccountStatus } from '@/types/billing.types';
import { useAccountStatus } from '@features/pricing/hooks/useAccountStatus';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { PlanDetailsTab } from '@features/settings/components/PlanDetailsTab';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@features/pricing/hooks/useAccountStatus', () => ({
  useAccountStatus: jest.fn(),
}));

jest.mock('@features/pricing/hooks/usePricingPlans', () => ({
  usePricingPlans: jest.fn(),
}));

const mockedUseAccountStatus = useAccountStatus as jest.Mock;
const mockedUsePricingPlans = usePricingPlans as jest.Mock;

const mockCatalogPlans: PricingPlan[] = [
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
    description: 'For students building projects',
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

const mockActiveStatus: AccountStatus = {
  plan: 'builder',
  planName: 'Builder',
  status: 'active',
  billingPeriod: 'monthly',
  priceMonthly: 499,
  priceYearly: 4990,
  currency: 'INR',
  currentEnd: '2026-08-15T00:00:00Z',
  cancelAtPeriodEnd: false,
  allowedWorkspaces: 3,
  usedWorkspaces: 2,
  allowedResponses: 500,
  usedResponses: 120,
  storageLimitMB: 500,
  storageUsedMB: 320,
  regenerationLimit: 5,
  stageRerun: 3,
  exportEnabled: true,
  surveyAnalytics: 'Advanced',
};

describe('PlanDetailsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePricingPlans.mockReturnValue({
      data: mockCatalogPlans,
      isLoading: false,
    });
  });

  it('renders loading spinner when fetching plan status', () => {
    mockedUseAccountStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<PlanDetailsTab />);

    expect(screen.getByText(/loading your plan and billing details/i)).toBeInTheDocument();
  });

  it('renders error card with retry button when query fails', async () => {
    const mockRefetch = jest.fn();
    mockedUseAccountStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    const user = userEvent.setup();

    render(<PlanDetailsTab />);

    expect(screen.getByText(/failed to load plan and billing details/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await user.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders active plan, billing details, usage overview and plan features from BE', () => {
    mockedUseAccountStatus.mockReturnValue({
      data: mockActiveStatus,
      isLoading: false,
      isError: false,
    });

    render(<PlanDetailsTab />);

    // Plan info
    expect(screen.getByText(/you are currently on the builder plan/i)).toBeInTheDocument();
    expect(screen.getAllByText('Builder').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/active/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/₹499/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/next billing date:/i)).toBeInTheDocument();
    expect(screen.getByText(/for students building projects/i)).toBeInTheDocument();

    // Usage Overview
    expect(screen.getAllByText('Workspaces / Ideas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    expect(screen.getAllByText('Survey Responses').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('120 / 500')).toBeInTheDocument();

    expect(screen.getAllByText('Storage').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('320 MB / 500 MB')).toBeInTheDocument();

    expect(screen.getAllByText('Survey Regenerations').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5 / workspace').length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('Stage Reruns').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('3 / workspace').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Analytics & Export')).toBeInTheDocument();
    expect(screen.getAllByText(/advanced analytics/i).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Plan Features')).toBeInTheDocument();
    expect(screen.getByText('3 workspaces/ideas')).toBeInTheDocument();
    expect(screen.getByText('Export validation reports')).toBeInTheDocument();
    expect(screen.getByText('500 MB storage')).toBeInTheDocument();

    const strikethroughEl = document.querySelector('.line-through');
    expect(strikethroughEl).toBeInTheDocument();
    expect(strikethroughEl).toHaveTextContent('₹999');

    expect(screen.getByText(/ai mentor plan comparison/i)).toBeInTheDocument();
    expect(screen.getByText('Your Plan')).toBeInTheDocument();
  });

  it('renders trial badge and expiration when user is on a free trial', () => {
    mockedUseAccountStatus.mockReturnValue({
      data: {
        ...mockActiveStatus,
        plan: 'starter',
        planName: 'Starter',
        status: 'trial',
        currentEnd: null,
        trialEndsAt: '2026-09-30T00:00:00Z',
      },
      isLoading: false,
      isError: false,
    });

    render(<PlanDetailsTab />);

    expect(screen.getAllByText(/free trial/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/trial ends on:/i)).toBeInTheDocument();
  });

  it('navigates to pricing page when "Change Plan" or "Manage Subscription" is clicked', async () => {
    mockedUseAccountStatus.mockReturnValue({
      data: mockActiveStatus,
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();

    render(<PlanDetailsTab />);

    const changePlanBtn = screen.getByRole('button', { name: /change plan/i });
    await user.click(changePlanBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/pricing');

    const manageSubscriptionBtn = screen.getByRole('button', { name: /manage subscription/i });
    await user.click(manageSubscriptionBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('renders full comparison matrix with all tiers and rows', () => {
    mockedUseAccountStatus.mockReturnValue({
      data: mockActiveStatus,
      isLoading: false,
      isError: false,
    });

    render(<PlanDetailsTab />);

    expect(screen.getAllByText('Rerun the stage').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Survey Regenerations').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Survey Analytics').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Export Validation Reports').length).toBeGreaterThanOrEqual(1);
  });

  it('omits "Export validation reports" and shows Report Export disabled for starter plan', () => {
    mockedUseAccountStatus.mockReturnValue({
      data: {
        ...mockActiveStatus,
        plan: 'starter',
        planName: 'Starter',
        status: 'active',
        priceMonthly: 0,
        exportEnabled: true,
      },
      isLoading: false,
      isError: false,
    });

    render(<PlanDetailsTab />);

    expect(screen.queryByText('Export validation reports')).not.toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });
});

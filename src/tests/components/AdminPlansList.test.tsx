import { fireEvent, render, screen } from '@testing-library/react';

import type { AdminPlan } from '@/types/admin.types';
import { AdminPlansList } from '@features/admin/components/AdminPlansList';

const mockPlans: AdminPlan[] = [
  {
    id: 1,
    code: 'starter',
    name: 'Starter',
    description: 'Free tier for exploring startup ideas.',
    razorpay_plan_id_monthly: null,
    razorpay_plan_id_yearly: null,
    price_monthly: 0,
    price_yearly: 0,
    currency: 'INR',
    features: ['1 workspace for 7 days', '2 survey regenerations'],
    tier: 0,
    workspace_limit: 1,
    survey_response_cap: 100,
    regeneration_limit: 2,
    export_enabled: false,
    stage_rerun: 1,
    survey_analytics: 'Basic',
    storage_limit: 200,
    popular: false,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'builder',
    name: 'Builder',
    description: 'For students building projects.',
    razorpay_plan_id_monthly: 'plan_b_m',
    razorpay_plan_id_yearly: 'plan_b_y',
    price_monthly: 299,
    price_yearly: 2990,
    currency: 'INR',
    features: ['3 workspaces', '5 survey regenerations'],
    tier: 1,
    workspace_limit: 3,
    survey_response_cap: 500,
    regeneration_limit: 5,
    export_enabled: true,
    stage_rerun: 3,
    survey_analytics: 'Advanced',
    storage_limit: 500,
    popular: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    code: 'custom_draft',
    name: 'Enterprise Draft',
    description: 'Custom plan draft.',
    razorpay_plan_id_monthly: null,
    razorpay_plan_id_yearly: null,
    price_monthly: 999,
    price_yearly: 9999,
    currency: 'INR',
    features: ['Custom integration'],
    tier: 3,
    workspace_limit: null,
    survey_response_cap: null,
    regeneration_limit: null,
    export_enabled: true,
    stage_rerun: null,
    survey_analytics: 'Advanced',
    storage_limit: null,
    popular: false,
    is_active: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockToggleMutate = jest.fn();

jest.mock('@features/admin/hooks', () => ({
  useAdminPlans: () => ({
    data: { plans: mockPlans },
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isRefetching: false,
  }),
  useAdminCreatePlan: () => ({
    mutate: mockCreateMutate,
    isPending: false,
  }),
  useAdminUpdatePlan: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
  useAdminTogglePlanStatus: () => ({
    mutate: mockToggleMutate,
    isPending: false,
  }),
}));

describe('AdminPlansList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page header and metric summaries', () => {
    render(<AdminPlansList />);

    expect(
      screen.getByRole('heading', { level: 1, name: /subscription plans/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Total Plans')).toBeInTheDocument();
    expect(screen.getByText('Active (Public)')).toBeInTheDocument();
    expect(screen.getByText('Inactive / Drafts')).toBeInTheDocument();
  });

  it('renders all plans in grid view', () => {
    render(<AdminPlansList />);

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getAllByText('Builder')[0]).toBeInTheDocument();
    expect(screen.getByText('Enterprise Draft')).toBeInTheDocument();

    expect(screen.getByText('₹0')).toBeInTheDocument();
    expect(screen.getByText('₹299')).toBeInTheDocument();
    expect(screen.getByText('₹999')).toBeInTheDocument();
  });

  it('filters plans by search input', () => {
    render(<AdminPlansList />);

    const searchInput = screen.getByPlaceholderText(/search plans by name, code/i);
    fireEvent.change(searchInput, { target: { value: 'builder' } });

    expect(screen.getAllByText('Builder')[0]).toBeInTheDocument();
    expect(screen.queryByText('Enterprise Draft')).not.toBeInTheDocument();
  });

  it('switches to table view', () => {
    render(<AdminPlansList />);

    const tableToggleBtn = screen.getByTitle('Table view');
    fireEvent.click(tableToggleBtn);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Tier / Code')).toBeInTheDocument();
    expect(screen.getByText('Monthly Price')).toBeInTheDocument();
    expect(screen.queryByText('Yearly Price')).not.toBeInTheDocument();
  });

  it('opens Create Plan modal when clicking "+ Create Plan"', () => {
    render(<AdminPlansList />);

    const createBtn = screen.getByRole('button', { name: /create plan/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: /create subscription plan/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/plan code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('opens Edit Plan modal when clicking "Edit Plan"', () => {
    render(<AdminPlansList />);

    const [firstEditBtn] = screen.getAllByRole('button', { name: /edit plan/i });
    expect(firstEditBtn).toBeDefined();
    if (firstEditBtn) {
      fireEvent.click(firstEditBtn);
    }

    expect(screen.getByRole('heading', { name: /edit plan: starter/i })).toBeInTheDocument();
  });

  it('opens Deactivate confirmation dialog when clicking "Deactivate"', () => {
    render(<AdminPlansList />);

    const [firstDeactivateBtn] = screen.getAllByRole('button', { name: /deactivate/i });
    expect(firstDeactivateBtn).toBeDefined();
    if (firstDeactivateBtn) {
      fireEvent.click(firstDeactivateBtn);
    }

    expect(screen.getByText(/deactivate subscription plan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm deactivate/i })).toBeInTheDocument();
  });
});

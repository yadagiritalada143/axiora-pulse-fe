import { fireEvent, render, screen } from '@testing-library/react';

import type { AdminPlan } from '@/types/admin.types';
import { TogglePlanStatusDialog } from '@features/admin/components/TogglePlanStatusDialog';

const activePlan: AdminPlan = {
  id: 1,
  code: 'starter',
  name: 'Starter',
  description: 'Free tier',
  razorpay_plan_id_monthly: null,
  razorpay_plan_id_yearly: null,
  price_monthly: 0,
  price_yearly: 0,
  currency: 'INR',
  features: [],
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
};

const inactivePlan: AdminPlan = {
  ...activePlan,
  id: 2,
  code: 'pro',
  name: 'Pro',
  is_active: false,
};

describe('TogglePlanStatusDialog', () => {
  it('does not render when isOpen is false or plan is null', () => {
    render(
      <TogglePlanStatusDialog
        isOpen={false}
        plan={activePlan}
        isPending={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByText(/subscription plan/i)).not.toBeInTheDocument();
  });

  it('renders deactivate prompt when plan is currently active', () => {
    const handleConfirm = jest.fn();
    render(
      <TogglePlanStatusDialog
        isOpen={true}
        plan={activePlan}
        isPending={false}
        onClose={jest.fn()}
        onConfirm={handleConfirm}
      />,
    );

    expect(screen.getByText('Deactivate Subscription Plan')).toBeInTheDocument();
    expect(screen.getByText(/hide it from the user pricing page/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /confirm deactivate/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalled();
  });

  it('renders activate prompt when plan is currently inactive', () => {
    const handleConfirm = jest.fn();
    render(
      <TogglePlanStatusDialog
        isOpen={true}
        plan={inactivePlan}
        isPending={false}
        onClose={jest.fn()}
        onConfirm={handleConfirm}
      />,
    );

    expect(screen.getByText('Activate Subscription Plan')).toBeInTheDocument();
    expect(
      screen.getByText(/visible to all users on the public pricing page/i),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /confirm activate/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', () => {
    const handleClose = jest.fn();
    render(
      <TogglePlanStatusDialog
        isOpen={true}
        plan={activePlan}
        isPending={false}
        onClose={handleClose}
        onConfirm={jest.fn()}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});

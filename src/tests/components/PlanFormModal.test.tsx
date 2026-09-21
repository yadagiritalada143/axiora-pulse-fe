import { fireEvent, render, screen } from '@testing-library/react';

import type { AdminPlan } from '@/types/admin.types';
import { PlanFormModal } from '@features/admin/components/PlanFormModal';

const mockPlan: AdminPlan = {
  id: 1,
  code: 'starter',
  name: 'Starter',
  description: 'Free starter tier',
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
};

describe('PlanFormModal', () => {
  it('does not render dialog content when isOpen is false', () => {
    render(
      <PlanFormModal
        isOpen={false}
        mode="create"
        isPending={false}
        onClose={jest.fn()}
        onCreate={jest.fn()}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.queryByText('Create Subscription Plan')).not.toBeInTheDocument();
  });

  it('renders create mode with default fields and allows adding features', () => {
    const handleCreate = jest.fn();
    render(
      <PlanFormModal
        isOpen={true}
        mode="create"
        isPending={false}
        onClose={jest.fn()}
        onCreate={handleCreate}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /create subscription plan/i })).toBeInTheDocument();

    const codeInput = screen.getByLabelText(/plan code/i);
    const nameInput = screen.getByLabelText(/display name/i);
    const featureInput = screen.getByPlaceholderText(/type a new benefit/i);
    const addFeatureBtn = screen.getByRole('button', { name: /^add$/i });

    fireEvent.change(codeInput, { target: { value: 'enterprise' } });
    fireEvent.change(nameInput, { target: { value: 'Enterprise' } });
    fireEvent.change(featureInput, { target: { value: '24/7 dedicated support' } });
    fireEvent.click(addFeatureBtn);

    expect(screen.getByText('24/7 dedicated support')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /create plan/i });
    fireEvent.click(submitBtn);

    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'enterprise',
        name: 'Enterprise',
        features: expect.arrayContaining(['24/7 dedicated support']),
      }),
    );
  });

  it('populates existing fields in edit mode and calls onUpdate on submit', () => {
    const handleUpdate = jest.fn();
    render(
      <PlanFormModal
        isOpen={true}
        mode="edit"
        plan={mockPlan}
        isPending={false}
        onClose={jest.fn()}
        onCreate={jest.fn()}
        onUpdate={handleUpdate}
      />,
    );

    expect(screen.getByRole('heading', { name: /edit plan: starter/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: 'Starter Plus' } });

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        code: 'starter',
        name: 'Starter Plus',
      }),
    );
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <PlanFormModal
        isOpen={true}
        mode="create"
        isPending={false}
        onClose={handleClose}
        onCreate={jest.fn()}
        onUpdate={jest.fn()}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { PricingPlan } from '@/types/api.types';
import { PricingPlanCard } from '@features/pricing/components/PricingPlanCard';

const plan: PricingPlan = {
  id: 'pro',
  name: 'Professional',
  priceMonthly: 999,
  priceYearly: 9990,
  features: ['AI Co-Founder', '10 conversations / month'],
};

describe('PricingPlanCard', () => {
  it('renders the plan name, monthly price, and features', () => {
    render(<PricingPlanCard plan={plan} billingPeriod="monthly" onSelect={jest.fn()} />);

    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('$999')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
    expect(screen.getByText('AI Co-Founder')).toBeInTheDocument();
    expect(screen.getByText('10 conversations / month')).toBeInTheDocument();
  });

  it('renders the yearly price when billingPeriod is yearly', () => {
    render(<PricingPlanCard plan={plan} billingPeriod="yearly" onSelect={jest.fn()} />);

    expect(screen.getByText('$9990')).toBeInTheDocument();
    expect(screen.getByText('/year')).toBeInTheDocument();
  });

  it('applies highlighted styling to the card, title and CTA', () => {
    render(
      <PricingPlanCard plan={plan} billingPeriod="monthly" onSelect={jest.fn()} highlighted />,
    );

    expect(screen.getByText('Professional')).toHaveClass('text-primary');
    expect(screen.getByRole('button', { name: 'Choose plan' })).toHaveAttribute(
      'data-variant',
      'default',
    );
  });

  it('calls onSelect with the plan id when the CTA is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<PricingPlanCard plan={plan} billingPeriod="monthly" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Choose plan' }));

    expect(onSelect).toHaveBeenCalledWith('pro');
  });
});

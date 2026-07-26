import { render, screen } from '@testing-library/react';

import { PricingPlans } from '@features/pricing/components/PricingPlans';
import PricingPage from '@pages/PricingPage';

jest.mock('@features/pricing/components/PricingPlans', () => ({
  PricingPlans: jest.fn(() => <div>Pricing Plans Stub</div>),
}));

const mockedPricingPlans = PricingPlans as jest.Mock;

describe('PricingPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the PricingPlans feature component', () => {
    render(<PricingPage />);

    expect(screen.getByText('Pricing Plans Stub')).toBeInTheDocument();
    expect(mockedPricingPlans).toHaveBeenCalledTimes(1);
  });
});

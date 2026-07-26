import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import type { PricingPlan } from '@/types/api.types';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { billingService } from '@services/billing';

jest.mock('@services/billing', () => ({
  billingService: {
    listPlans: jest.fn(),
  },
}));

const mockedBillingService = billingService as jest.Mocked<typeof billingService>;

const plans: PricingPlan[] = [
  { id: 'starter', name: 'Starter', priceMonthly: 799, priceYearly: 7990, features: ['Feature A'] },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return Wrapper;
}

describe('usePricingPlans', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the pricing plans and exposes them as data', async () => {
    mockedBillingService.listPlans.mockResolvedValueOnce(plans);

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePricingPlans(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedBillingService.listPlans).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(plans);
  });

  it('surfaces an error when the request fails', async () => {
    mockedBillingService.listPlans.mockRejectedValueOnce(new Error('network error'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePricingPlans(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

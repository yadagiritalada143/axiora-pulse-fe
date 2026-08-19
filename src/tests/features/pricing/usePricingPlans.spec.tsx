import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { billingService } from '@services/billing';

jest.mock('@services/billing', () => ({
  billingService: {
    listPlans: jest.fn(),
  },
}));

const { listPlans } = billingService as unknown as { listPlans: jest.Mock };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('usePricingPlans', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches the pricing plans', async () => {
    listPlans.mockResolvedValue([{ id: 'pro' }]);

    const { result } = renderHook(() => usePricingPlans(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'pro' }]);
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { useSubscribe } from '@features/pricing/hooks/useSubscribe';
import { useSubscription } from '@features/pricing/hooks/useSubscription';
import { billingService } from '@services/billing';
import { loadRazorpayCheckout } from '@utils/razorpay';

jest.mock('@services/billing', () => ({
  billingService: {
    subscribe: jest.fn(),
    verify: jest.fn(),
    getSubscription: jest.fn(),
    listPlans: jest.fn(),
    cancel: jest.fn(),
  },
}));

jest.mock('@utils/razorpay', () => ({
  loadRazorpayCheckout: jest.fn(),
}));

const mockedBillingService = jest.mocked(billingService);
const mockedLoadRazorpay = jest.mocked(loadRazorpayCheckout);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useSubscription', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches the current subscription', async () => {
    const mockSub = {
      status: 'active' as const,
      planCode: 'pro',
      planName: 'Pro',
      billingPeriod: 'monthly' as const,
      currentEnd: null,
      cancelAtPeriodEnd: false,
    };
    mockedBillingService.getSubscription.mockResolvedValue(mockSub);

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedBillingService.getSubscription).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockSub);
  });
});

describe('useSubscribe', () => {
  beforeEach(() => jest.clearAllMocks());

  it('runs the full checkout flow and returns the verified subscription', async () => {
    mockedBillingService.subscribe.mockResolvedValue({
      subscriptionId: 'sub_123',
      keyId: 'rzp_test',
      shortUrl: null,
    });

    let checkoutHandler:
      | ((response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => void)
      | undefined;
    let dismissHandler: (() => void) | undefined;
    let failedHandler: ((r: unknown) => void) | undefined;
    let openCalled = false;

    const fakeInstance = {
      open: () => {
        openCalled = true;
        checkoutHandler?.({
          razorpay_payment_id: 'pay_1',
          razorpay_subscription_id: 'sub_123',
          razorpay_signature: 'sig',
        });
      },
      on: (event: string, handler: (r: unknown) => void) => {
        if (event === 'payment.failed') failedHandler = handler;
      },
    };

    const FakeRazorpay = jest
      .fn()
      .mockImplementation(
        (options: {
          handler?: (r: {
            razorpay_payment_id: string;
            razorpay_subscription_id: string;
            razorpay_signature: string;
          }) => void;
          modal?: { ondismiss?: () => void };
        }) => {
          checkoutHandler = options.handler;
          dismissHandler = options.modal?.ondismiss;
          return fakeInstance;
        },
      );

    mockedLoadRazorpay.mockResolvedValue(FakeRazorpay as never);

    const verified = {
      status: 'active' as const,
      planCode: 'pro',
      planName: 'Pro',
      billingPeriod: 'monthly' as const,
      currentEnd: null,
      cancelAtPeriodEnd: false,
    };
    mockedBillingService.verify.mockResolvedValue(verified);

    const { result } = renderHook(() => useSubscribe(), { wrapper: createWrapper() });

    result.current.mutate({ planId: 'pro', billingPeriod: 'monthly' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedBillingService.subscribe).toHaveBeenCalledWith('pro', 'monthly');
    expect(openCalled).toBe(true);
    expect(mockedBillingService.verify).toHaveBeenCalledWith({
      razorpay_payment_id: 'pay_1',
      razorpay_subscription_id: 'sub_123',
      razorpay_signature: 'sig',
    });
    expect(result.current.data).toEqual(verified);
    void dismissHandler;
    void failedHandler;
  });

  it('rejects when the user dismisses the Razorpay modal', async () => {
    mockedBillingService.subscribe.mockResolvedValue({
      subscriptionId: 'sub_123',
      keyId: 'rzp_test',
      shortUrl: null,
    });

    let checkoutHandler:
      | ((r: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => void)
      | undefined;
    let dismissHandler: (() => void) | undefined;

    const fakeInstance = {
      open: () => {
        dismissHandler?.();
      },
      on: () => undefined,
    };

    const FakeRazorpay = jest
      .fn()
      .mockImplementation(
        (options: {
          handler?: (r: {
            razorpay_payment_id: string;
            razorpay_subscription_id: string;
            razorpay_signature: string;
          }) => void;
          modal?: { ondismiss?: () => void };
        }) => {
          checkoutHandler = options.handler;
          dismissHandler = options.modal?.ondismiss;
          return fakeInstance;
        },
      );

    mockedLoadRazorpay.mockResolvedValue(FakeRazorpay as never);

    const onError = jest.fn();
    const { result } = renderHook(() => useSubscribe(), { wrapper: createWrapper() });

    result.current.mutate({ planId: 'pro', billingPeriod: 'monthly' }, { onError });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Checkout was dismissed.'));
    expect(onError).toHaveBeenCalledTimes(1);
    void checkoutHandler;
  });
});

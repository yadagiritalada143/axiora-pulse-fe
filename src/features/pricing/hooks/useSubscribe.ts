import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { BillingPeriod, UserSubscription } from '@/types/billing.types';
import { queryKeys } from '@constants/queryKeys';
import { billingService } from '@services/billing';
import { loadRazorpayCheckout, type RazorpayHandlerResponse } from '@utils/razorpay';

export interface SubscribeInput {
  planId: string;
  billingPeriod: BillingPeriod;
}

/**
 * Drives the full subscribe flow:
 *   1. create the Razorpay subscription on our backend,
 *   2. load + open Razorpay Checkout with the returned subscription id,
 *   3. on authorization, verify the signature server-side,
 *   4. refresh the cached subscription status.
 *
 * The returned promise resolves once the payment is authorized and verified, and
 * rejects if the user dismisses the modal or verification fails. Razorpay's
 * webhook remains the source of truth — this only reflects the result optimistically.
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation<UserSubscription, Error, SubscribeInput>({
    mutationFn: async ({ planId, billingPeriod }) => {
      const { subscriptionId, keyId } = await billingService.subscribe(planId, billingPeriod);
      const Razorpay = await loadRazorpayCheckout();

      return await new Promise<UserSubscription>((resolve, reject) => {
        const checkout = new Razorpay({
          key: keyId,
          subscription_id: subscriptionId,
          name: 'Axiora Pulse',
          description: 'Subscription',
          handler: (response: RazorpayHandlerResponse) => {
            billingService
              .verify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              })
              .then(resolve)
              .catch(reject);
          },
          modal: {
            ondismiss: () => reject(new Error('Checkout was dismissed.')),
          },
        });

        checkout.on('payment.failed', () => reject(new Error('Payment failed.')));
        checkout.open();
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
    },
  });
}

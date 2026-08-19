/**
 * Billing / Razorpay Subscriptions domain types.
 *
 * `PricingPlan` (the catalog shape) lives in `api.types.ts` alongside the other
 * REST entities; this file adds the subscription-flow types.
 */

export type BillingPeriod = 'monthly' | 'yearly';

/**
 * Razorpay subscription lifecycle, mirrored from the backend. `none` means the
 * user has never subscribed.
 */
export type SubscriptionStatus =
  | 'none'
  | 'created'
  | 'authenticated'
  | 'active'
  | 'pending'
  | 'halted'
  | 'cancelled'
  | 'completed'
  | 'expired';

/** Returned by POST /billing/subscribe — the handle used to open Razorpay Checkout. */
export interface SubscribeResponse {
  subscriptionId: string;
  keyId: string;
  shortUrl: string | null;
}

/** Returned by GET /billing/subscription, POST /billing/verify, POST /billing/cancel. */
export interface UserSubscription {
  status: SubscriptionStatus;
  planCode: string | null;
  planName: string | null;
  billingPeriod: BillingPeriod | null;
  currentEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/** Fields Razorpay Checkout hands back to the success handler for a subscription. */
export interface RazorpaySubscriptionHandlerResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

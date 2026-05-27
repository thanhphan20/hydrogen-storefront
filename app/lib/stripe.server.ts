import Stripe from 'stripe';

export function createStripeClient(secretKey: string | undefined) {
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
  });
}

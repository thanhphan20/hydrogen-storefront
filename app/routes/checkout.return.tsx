import {redirect} from 'react-router';
import type {Route} from './+types/checkout.return';
import {retrieveCheckoutSession} from '~/lib/checkout.server';

export async function loader({request, context}: Route.LoaderArgs) {
  const sessionId = new URL(request.url).searchParams.get('session_id');

  if (!sessionId) {
    throw redirect('/checkout');
  }

  const session = await retrieveCheckoutSession({
    sessionId,
    stripeSecretKey: context.env.STRIPE_SECRET_KEY,
  });

  if (session.status === 'complete') {
    throw redirect(`/checkout/success?session_id=${sessionId}`);
  }

  // Payment is still open (e.g. the user navigated back) — send them
  // back to start a fresh embedded checkout session.
  throw redirect('/checkout');
}

export default function CheckoutReturn() {
  return null;
}

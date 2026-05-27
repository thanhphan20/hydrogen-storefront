import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/checkout.payment';
import {createStripeCheckoutSession} from '~/lib/checkout.server';

type CheckoutActionData = {
  error?: string;
};

export async function action({request, context}: Route.ActionArgs) {
  try {
    // Get cart data
    const cart = await context.cart.get();

    // Validate cart exists and has items
    if (!cart || !cart.lines?.nodes || cart.lines.nodes.length === 0) {
      return Response.json(
        {error: 'Your cart is empty. Please add items before checkout.'},
        {status: 400},
      );
    }

    const origin = new URL(request.url).origin;
    const session = await createStripeCheckoutSession({
      cart,
      origin,
      stripeSecretKey: context.env.STRIPE_SECRET_KEY,
    });

    if (!session.url) {
      return Response.json(
        {error: 'Unable to start Stripe checkout. Please try again.'},
        {status: 500},
      );
    }

    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error('Unable to create Stripe checkout session', error);

    return Response.json(
      {error: 'Payment failed to start. Please try again.'},
      {status: 500},
    );
  }
}

export default function CheckoutPayment() {
  const actionData = useActionData() as CheckoutActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div>
      <h2>Payment</h2>
      <p>Use Stripe Checkout to complete payment securely.</p>
      <Form method="post">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Redirecting…' : 'Pay with Stripe'}
        </button>
      </Form>
      {actionData?.error ? <p role="alert">{actionData.error}</p> : null}
    </div>
  );
}

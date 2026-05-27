import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/checkout.payment';
import {createStripeClient} from '~/lib/stripe.server';

type CheckoutActionData = {
  error?: string;
};

export async function action({request, context}: Route.ActionArgs) {
  try {
    const stripe = createStripeClient(context.env.STRIPE_SECRET_KEY);

    // Get cart data
    const cart = await context.cart.get();

    // Validate cart exists and has items
    if (!cart || !cart.lines?.nodes || cart.lines.nodes.length === 0) {
      return Response.json(
        {error: 'Your cart is empty. Please add items before checkout.'},
        {status: 400},
      );
    }

    const lineItems = cart.lines.nodes.map((line) => {
      const quantity = line.quantity;
      const price = line.merchandise.price;
      const productTitle = line.merchandise.product.title;
      const variantTitle = line.merchandise.title;

        if (quantity <= 0 || !price.amount) {
        throw new Error('Invalid cart item quantity or price');
      }

      const unitAmountInCents = Math.round(parseFloat(price.amount) * 100);

      const productName =
        variantTitle && variantTitle !== 'Default Title'
          ? `${productTitle} - ${variantTitle}`
          : productTitle;

      return {
        quantity,
        price_data: {
          currency: price.currencyCode.toLowerCase(),
          unit_amount: unitAmountInCents,
          product_data: {
            name: productName,
          },
        },
      };
    });

    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/checkout/success`;
    const cancelUrl = `${origin}/checkout/payment`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return Response.json(
        {error: 'Unable to start Stripe checkout. Please try again.'},
        {status: 500},
      );
    }

    return Response.redirect(session.url, 303);
  } catch {
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

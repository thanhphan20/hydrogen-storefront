import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/checkout.payment';
import {stripe} from '~/lib/stripe.server';

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

    // Map cart items to Stripe line_items format
    const line_items = cart.lines.nodes.map((line) => {
      const quantity = line.quantity;
      const price = line.merchandise.price;
      const productTitle = line.merchandise.product.title;
      const variantTitle = line.merchandise.title;

      // Validate quantity and price
      if (quantity <= 0 || !price.amount) {
        throw new Error('Invalid cart item quantity or price');
      }

      // Convert price amount (string) to cents (integer)
      // Shopify returns amount as string (e.g., "19.99")
      const unitAmountInCents = Math.round(parseFloat(price.amount) * 100);

      // Construct product name (include variant if not "Default Title")
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

    // Construct dynamic URLs from request
    const origin = new URL(request.url).origin;
    const success_url = `${origin}/checkout/success`;
    const cancel_url = `${origin}/checkout/payment`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url,
      cancel_url,
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

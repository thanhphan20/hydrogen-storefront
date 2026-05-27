import {Form, useActionData, useNavigation} from 'react-router';
import {stripe} from '~/lib/stripe.server';

type CheckoutActionData = {
  error?: string;
};

export async function action() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: 1999,
            product_data: {
              name: 'Demo Checkout Item',
            },
          },
        },
      ],
      success_url: 'http://localhost:3000/checkout/success',
      cancel_url: 'http://localhost:3000/checkout/payment',
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

import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/checkout._index';
import {createEmbeddedCheckoutSession} from '~/lib/checkout.server';
import {StripeEmbeddedCheckout} from '~/components/StripeEmbeddedCheckout';
import {HEADER_QUERY} from '~/lib/fragments';

export async function loader({request, context}: Route.LoaderArgs) {
  const cart = await context.cart.get();

  if (!cart || !cart.lines?.nodes || cart.lines.nodes.length === 0) {
    throw redirect('/cart');
  }

  if (!context.env.STRIPE_PUBLIC_KEY) {
    return {
      clientSecret: null,
      publishableKey: null,
      error: 'Stripe is not configured. Set STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY to enable checkout.',
    };
  }

  const origin = new URL(request.url).origin;
  const header = await context.storefront.query(HEADER_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: {
      headerMenuHandle: 'main-menu',
    },
  });
  const shopName = header?.shop?.name ?? 'Store';

  try {
    const session = await createEmbeddedCheckoutSession({
      cart,
      origin,
      shopName,
      stripeSecretKey: context.env.STRIPE_SECRET_KEY,
    });

    if (!session.client_secret) {
      throw new Error('Stripe did not return a client secret');
    }

    return {
      clientSecret: session.client_secret,
      publishableKey: context.env.STRIPE_PUBLIC_KEY,
      error: null,
    };
  } catch (error) {
    console.error('Unable to create Stripe checkout session', error);
    const message = error instanceof Error ? error.message : 'Unable to start checkout.';

    return {
      clientSecret: null,
      publishableKey: null,
      error: `We couldn't start checkout: ${message}`,
    };
  }
}

export default function CheckoutIndex() {
  const {clientSecret, publishableKey, error} = useLoaderData<typeof loader>();

  if (error || !clientSecret || !publishableKey) {
    return (
      <div className="checkout-embed checkout-embed__error">
        {error ?? 'Unable to start checkout. Please try again.'}
      </div>
    );
  }

  return (
    <StripeEmbeddedCheckout clientSecret={clientSecret} publishableKey={publishableKey} />
  );
}

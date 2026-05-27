import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {createStripeClient} from '~/lib/stripe.server';

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

function toStripeUnitAmount(amount: string, currencyCode: string) {
  const numericAmount = Number(amount);
  const currency = currencyCode.toLowerCase();

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid cart item price');
  }

  return Math.round(
    numericAmount * (ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100),
  );
}

export async function createStripeCheckoutSession({
  cart,
  origin,
  stripeSecretKey,
}: {
  cart: CartApiQueryFragment;
  origin: string;
  stripeSecretKey: string | undefined;
}) {
  const stripe = createStripeClient(stripeSecretKey);

  if (!cart || !cart.lines?.nodes || cart.lines.nodes.length === 0) {
    throw new Error('Cart is empty');
  }

  const lineItems = cart.lines.nodes.map((line) => {
    const quantity = line.quantity;
    const price = line.merchandise.price;
    const productTitle = line.merchandise.product.title;
    const variantTitle = line.merchandise.title;

    if (quantity <= 0 || !price.amount) {
      throw new Error('Invalid cart item quantity or price');
    }

    const unitAmount = toStripeUnitAmount(price.amount, price.currencyCode);
    const productName =
      variantTitle && variantTitle !== 'Default Title'
        ? `${productTitle} - ${variantTitle}`
        : productTitle;

    return {
      quantity,
      price_data: {
        currency: price.currencyCode.toLowerCase(),
        unit_amount: unitAmount,
        product_data: {
          name: productName,
        },
      },
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/payment`,
  });

  return session;
}

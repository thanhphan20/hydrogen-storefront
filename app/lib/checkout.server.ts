import type {Stripe} from 'stripe';
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

// Flat-rate shipping options presented inside Stripe's embedded checkout UI.
// Replace with real-time carrier rates when available.
const SHIPPING_RATES = [
  {name: 'Standard Shipping', amount: 5, minDays: 3, maxDays: 5},
  {name: 'Express Shipping', amount: 15, minDays: 1, maxDays: 2},
  {name: 'Overnight Shipping', amount: 30, minDays: 1, maxDays: 1},
] as const;

// Countries Stripe will collect a shipping address for. Adjust to match
// the merchant's actual shipping zones.
const SHIPPING_ALLOWED_COUNTRIES: Array<
  Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry
> = ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'SG', 'JP'];

export async function createEmbeddedCheckoutSession({
  cart,
  origin,
  shopName,
  stripeSecretKey,
}: {
  cart: CartApiQueryFragment;
  origin: string;
  shopName: string;
  stripeSecretKey: string | undefined;
}) {
  const stripe = createStripeClient(stripeSecretKey);

  if (!cart || !cart.lines?.nodes || cart.lines.nodes.length === 0) {
    throw new Error('Cart is empty');
  }

  const currency = (cart.cost?.totalAmount?.currencyCode ?? 'USD').toLowerCase();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.lines.nodes.map(
    (line) => {
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
      const imageUrl = line.merchandise.image?.url;

      return {
        quantity,
        price_data: {
          currency: price.currencyCode.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: productName,
            images: imageUrl ? [imageUrl] : undefined,
          },
        },
      };
    },
  );

  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
    SHIPPING_RATES.map((rate) => ({
      shipping_rate_data: {
        type: 'fixed_amount',
        display_name: rate.name,
        fixed_amount: {
          amount: toStripeUnitAmount(rate.amount.toString(), currency),
          currency,
        },
        delivery_estimate: {
          minimum: {unit: 'business_day', value: rate.minDays},
          maximum: {unit: 'business_day', value: rate.maxDays},
        },
      },
    }));

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    ui_mode: 'embedded_page',
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    phone_number_collection: {enabled: true},
    shipping_address_collection: {allowed_countries: SHIPPING_ALLOWED_COUNTRIES},
    shipping_options: shippingOptions,
    return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    branding_settings: {
      background_color: '#0a0a0a',
      button_color: '#ffffff',
      border_style: 'rounded',
      font_family: 'inter',
      display_name: shopName,
    },
  };

  try {
    return await stripe.checkout.sessions.create(sessionParams);
  } catch (error) {
    if (!isBrandingSettingsError(error)) {
      throw error;
    }

    console.warn(
      'Stripe rejected checkout branding_settings; retrying without branding.',
      error,
    );
    const retryParams = {...sessionParams};
    delete retryParams.branding_settings;
    return await stripe.checkout.sessions.create(retryParams);
  }
}

function isBrandingSettingsError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const stripeError = error as {param?: string; message?: string};
  return (
    stripeError.param === 'branding_settings' ||
    Boolean(stripeError.message?.includes('branding_settings'))
  );
}

export async function retrieveCheckoutSession({
  sessionId,
  stripeSecretKey,
}: {
  sessionId: string;
  stripeSecretKey: string | undefined;
}) {
  const stripe = createStripeClient(stripeSecretKey);
  return stripe.checkout.sessions.retrieve(sessionId);
}

import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/checkout.success';
import {CheckCircle2, ShoppingBag, ArrowRight, Mail, Truck} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardFooter} from '~/components/ui/card';
import {Badge} from '~/components/ui/badge';
import {retrieveCheckoutSession} from '~/lib/checkout.server';

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf',
  'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

function formatStripeAmount(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return null;
  const value = ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase())
    ? amount
    : amount / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

export async function loader({request, context}: Route.LoaderArgs) {
  const sessionId = new URL(request.url).searchParams.get('session_id');

  if (!sessionId) {
    return {order: null};
  }

  try {
    const session = await retrieveCheckoutSession({
      sessionId,
      stripeSecretKey: context.env.STRIPE_SECRET_KEY,
    });

    if (session.status !== 'complete') {
      return {order: null};
    }

    return {
      order: {
        sessionId,
        email: session.customer_details?.email ?? null,
        total: formatStripeAmount(session.amount_total, session.currency),
      },
    };
  } catch (error) {
    console.error('Unable to retrieve checkout session', error);
    return {order: null};
  }
}

export default function CheckoutSuccess() {
  const {order} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
            <CheckCircle2 className="relative h-20 w-20 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Thank you for your purchase!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your order is being processed and will be with you soon.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          <CardHeader className="border-b bg-muted/30 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                Order Information
              </CardTitle>
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                Confirmed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-8 space-y-8">
            {order && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border border-muted/30">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Order Reference</p>
                  <p className="font-mono text-lg font-semibold tracking-wider">
                    {order.sessionId}
                  </p>
                  {order.total && (
                    <p className="text-sm text-muted-foreground">
                      Total charged: <span className="font-semibold text-foreground">{order.total}</span>
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="w-fit">
                  Stripe Payment Verified
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">Email Confirmation</h3>
                  <p className="text-sm text-muted-foreground">
                    {order?.email
                      ? `A detailed confirmation has been sent to ${order.email}.`
                      : 'A detailed confirmation email has been sent to your inbox with all your order details.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">Next Steps</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive another email with a tracking number as soon as your items are shipped.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t py-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto px-8 group">
              <Link to="/">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8">
              <Link to="/account" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                View Order History
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Support Section */}
        <p className="text-center text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
          Need help with your order?{' '}
          <Link to="/contact" className="text-primary font-medium hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}

import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/checkout.payment';
import {createStripeCheckoutSession} from '~/lib/checkout.server';
import {Button} from '~/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {Alert, AlertDescription} from '~/components/ui/alert';

type CheckoutActionData = {
  error?: string;
};

export async function action({request, context}: Route.ActionArgs) {
  try {
    const cart = await context.cart.get();

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
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You will be redirected to Stripe Checkout to complete your payment securely.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="8" y2="8" />
                  <line x1="16" x2="16" y1="12" y2="12" />
                  <line x1="16" x2="16" y1="16" y2="16" />
                  <line x1="8" x2="8" y1="8" y2="8" />
                  <line x1="8" x2="8" y1="12" y2="12" />
                  <line x1="8" x2="8" y1="16" y2="16" />
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <span>Stripe Powered</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>$0.00</span>
                </div>
              </div>
              <Form method="post">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      {actionData?.error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{actionData.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

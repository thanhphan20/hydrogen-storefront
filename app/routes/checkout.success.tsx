import {Link, useSearchParams} from 'react-router';
import {CheckCircle2, ShoppingBag} from 'lucide-react';
import {Button} from '~/components/ui/button';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const session_id = searchParams.get('session_id');

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Order Success!
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Your order has been placed successfully. Thank you for shopping with us!
        </p>
        
        {session_id && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">
              Reference ID: <span className="font-mono font-medium">{session_id}</span>
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button asChild className="h-12 px-8">
            <Link to="/">
              Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-8">
            <Link to="/account" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

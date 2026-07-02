import {Link, Outlet, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import {ArrowLeft, LockKeyhole} from 'lucide-react';

export default function CheckoutLayout() {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const shopName = rootData?.header?.shop?.name ?? 'Store';

  return (
    <div className="checkout-shell">
      <div className="checkout-shell__container">
        <header className="checkout-shell__header">
          <Link to="/" className="checkout-shell__brand">
            {shopName}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              className="checkout-shell__back"
              to="/cart"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to cart
            </Link>
            <p className="checkout-shell__eyebrow">
              <LockKeyhole className="h-4 w-4" />
              Secure checkout
            </p>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

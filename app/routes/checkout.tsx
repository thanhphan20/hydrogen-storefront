import {Link, Outlet, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

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
          <p className="checkout-shell__eyebrow">Secure checkout</p>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

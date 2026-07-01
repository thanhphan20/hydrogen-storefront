import {Outlet} from 'react-router';

export default function CheckoutLayout() {
  return (
    <div className="checkout-shell">
      <div className="checkout-shell__container">
        <header className="checkout-shell__header">
          <p className="checkout-shell__eyebrow">Secure checkout</p>
          <h1 className="checkout-shell__title">Complete your order</h1>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

import {NavLink, Outlet} from 'react-router';

export default function CheckoutLayout() {
  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <nav role="navigation">
        <NavLink to="/checkout">Start</NavLink>
        {' | '}
        <NavLink to="/checkout/information">Information</NavLink>
        {' | '}
        <NavLink to="/checkout/shipping">Shipping</NavLink>
        {' | '}
        <NavLink to="/checkout/payment">Payment</NavLink>
        {' | '}
        <NavLink to="/checkout/success">Success</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

import {NavLink, Outlet, useLocation} from 'react-router';
import {Check} from 'lucide-react';

const CHECKOUT_STEPS = [
  {
    label: 'Information',
    to: '/checkout/information',
    match: ['/checkout', '/checkout/information'],
  },
  {
    label: 'Shipping',
    to: '/checkout/shipping',
    match: ['/checkout/shipping'],
  },
  {
    label: 'Payment',
    to: '/checkout/payment',
    match: ['/checkout/payment'],
  },
  {
    label: 'Success',
    to: '/checkout/success',
    match: ['/checkout/success'],
  },
] as const;

function getActiveStepIndex(pathname: string) {
  return CHECKOUT_STEPS.findIndex((step) =>
    step.match.some((route) => pathname === route || pathname.startsWith(`${route}/`)),
  );
}

export default function CheckoutLayout() {
  const {pathname} = useLocation();
  const activeStepIndex = getActiveStepIndex(pathname);

  return (
    <div className="checkout-shell">
      <div className="checkout-shell__container">
        <header className="checkout-shell__header" aria-label="Checkout progress">
          <p className="checkout-shell__eyebrow">Secure checkout</p>
          <h1 className="checkout-shell__title">Complete your order</h1>
          <ol className="checkout-stepper" role="list">
            {CHECKOUT_STEPS.map((step, index) => {
              const isCompleted = activeStepIndex > index;
              const isActive = activeStepIndex === index;
              const isDisabled = activeStepIndex !== -1 && index > activeStepIndex + 1;

              return (
                <li key={step.label} className="checkout-stepper__item">
                  <NavLink
                    to={step.to}
                    aria-current={isActive ? 'step' : undefined}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : undefined}
                    className={`checkout-stepper__link ${
                      isCompleted
                        ? 'checkout-stepper__link--completed'
                        : isActive
                          ? 'checkout-stepper__link--active'
                          : isDisabled
                            ? 'checkout-stepper__link--disabled'
                            : 'checkout-stepper__link--upcoming'
                    }`}
                    onClick={(event) => {
                      if (isDisabled) event.preventDefault();
                    }}
                  >
                    <span className="checkout-stepper__indicator" aria-hidden>
                      {isCompleted ? <Check size={14} /> : index + 1}
                    </span>
                    <span className="checkout-stepper__label">{step.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ol>
        </header>

        <div className="checkout-shell__grid">
          <main className="checkout-shell__main" id="checkout-main-content">
            <section className="checkout-card" aria-label="Checkout details">
              <Outlet />
            </section>
          </main>

          <aside className="checkout-shell__summary" aria-label="Order summary">
            <div className="checkout-card checkout-card--summary">
              <h2 className="checkout-card__title">Order summary</h2>
              <p className="checkout-card__text">Review your items, delivery details, and payment confirmation before placing your order.</p>
              <ul className="checkout-card__list">
                <li>Secure payment via Stripe Checkout</li>
                <li>Fast shipping updates after confirmation</li>
                <li>Order receipt sent to your email</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

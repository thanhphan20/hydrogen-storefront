## ADDED Requirements

### Requirement: Dark checkout shell with continuity
The existing checkout layout SHALL be restyled in place (keeping its `.checkout-shell*` structure, with app.css values swapped to tokens): dark page background, the storefront's brand header, a "Secure checkout" label with lock icon in muted small text, and a back-to-cart link so the cart-to-checkout transition feels continuous. The Stripe Embedded Checkout iframe SHALL sit inside a `rounded-xl border border-border bg-card overflow-hidden` frame. Checkout error states SHALL render as a destructive-tinted bordered panel.

#### Scenario: Checkout page renders dark
- **WHEN** the user navigates from cart to `/checkout`
- **THEN** the shell is dark-themed matching the storefront chrome, shows a secure-checkout signal and a way back to the cart, and the Stripe embed appears as a seated card

#### Scenario: Session creation failure
- **WHEN** the embedded checkout session cannot be created
- **THEN** a destructive-tinted error panel renders inside the dark shell (no unstyled or light-themed error)

### Requirement: Server-side Stripe branding
`createEmbeddedCheckoutSession` in `app/lib/checkout.server.ts` SHALL pass `branding_settings` to `checkout.sessions.create` with `background_color: '#0a0a0a'`, `button_color: '#ffffff'`, `border_style: 'rounded'`, `font_family: 'inter'`, and `display_name` set to the shop name threaded in from the checkout loader.

#### Scenario: Themed embed
- **WHEN** a checkout session is created and Stripe accepts `branding_settings`
- **THEN** the embedded checkout renders with a `#0a0a0a` background, white CTA button, and rounded borders matching the storefront

### Requirement: Theming must never break checkout
Session creation SHALL be wrapped so that if Stripe rejects `branding_settings` (account or API-version gating), the error is logged and session creation is retried once without `branding_settings`.

#### Scenario: Branding rejected
- **WHEN** Stripe returns an error attributable to `branding_settings`
- **THEN** the session is created without branding, checkout proceeds normally, and the rejection is logged

### Requirement: Themed checkout outcome pages
The checkout success and return pages SHALL be restyled with tokens within their current layouts: the success page keeps its semantic green check icon with the halo as `bg-success/20`, and gray utility text converts to foreground/muted tokens.

#### Scenario: Success page
- **WHEN** the user completes payment and lands on `/checkout/success`
- **THEN** the page renders dark with a green semantic check, token-styled order details, and themed header/footer

## Why

The storefront is a demo/portfolio project whose current UI is a light, black-on-white, sharp-corner, uppercase-heavy design that undersells the modern stack beneath it (Hydrogen 2026, Tailwind v4, shadcn/Radix). Revamping the existing components to a cohesive Vercel/Geist-style dark theme — and filling in the UX patterns real e-commerce sites have (breadcrumbs, empty/loading states, clear add-to-cart feedback) — makes it look and shop like a complete, professional store.

## What Changes

- **BREAKING (visual)**: Existing components and styles are updated **in place** to a dark-only Vercel/Geist aesthetic — pure black background, 3-level gray surface elevation, low-alpha white borders, monochrome palette (color reserved for product photos and semantic error/success states), 8px base radius, sentence-case Geist typography.
- Design tokens in `app/styles/tailwind.css` `:root` are rewritten to dark values; components' hardcoded light-color utilities (~106 across 17 files) are converted to tokens. `app/styles/app.css` is kept and its rules restyled with token values.
- E-commerce UX patterns are added within existing layouts: breadcrumbs and back-to-collection navigation, active nav states, designed empty states (cart, search, collection), skeleton loading states.
- Shopping-flow weak points are polished with existing mechanisms: add-to-cart feedback (cart aside confirmation moment), product discovery presentation (collection toolbar, filter/sort, result grids), and cart-to-checkout continuity (consistent dark shell, secure-checkout signal).
- Checkout: shell restyled in place; Stripe Embedded Checkout themed server-side via `branding_settings` on `checkout.sessions.create` with a guarded retry so checkout never fails on theming.
- CSS-only micro-interactions: hover states, scroll-reveal on home sections, skeleton shimmer — all gated by `prefers-reduced-motion`.

**Explicit boundaries (user-set):**
- **No file deletions** — components and `app.css` stay; only modifications (new small files allowed only if truly needed).
- **No page redesigns** — every page keeps its current layout and section structure; improvements happen within them.
- **Polish only** — no new data logic; routing, loaders, and actions untouched (single exception: threading `shopName` into `createEmbeddedCheckoutSession`).
- No new dependencies.

## Capabilities

### New Capabilities
- `dark-theme-design-system`: Dark-only design token system (colors, surfaces, borders, radius, typography, motion primitives) and in-place restyling of the shadcn/ui primitives on it.
- `storefront-ux-polish`: In-place dark restyling of chrome and all pages, plus added e-commerce UX patterns — navigation aids, empty/loading states, add-to-cart feedback, discovery presentation.
- `checkout-theming`: Dark checkout shell (restyled in place) and server-side Stripe Embedded Checkout branding with graceful fallback and cart-to-checkout continuity.

### Modified Capabilities

<!-- none — existing specs (docs-maintenance) have no requirement changes -->

## Impact

- **Styles**: `app/styles/tailwind.css` (`:root` token rewrite; `.dark` block and `dark:` variants left inert — nothing applies the class), `app/styles/app.css` (rules restyled with tokens, file retained), `app/root.tsx` (theme-color meta only).
- **Components**: all 14 `app/components/ui/*` primitives and ~20 business components updated in place (Header, Footer, Aside, PageLayout, ProductItem, ProductForm/Image/Price, AddToCartButton, CartMain/LineItem/Summary, SearchForm*/SearchResults*, Filter, PaginatedResourceSection, StripeEmbeddedCheckout).
- **Routes**: visual polish + UX-pattern additions within existing layouts across all page routes.
- **Server**: `app/lib/checkout.server.ts` gains `branding_settings` with guarded retry (verified supported by installed `stripe@22.3.0`).
- **Dependencies**: none added; uses existing tw-animate-css, Geist font, lucide-react, Embla.

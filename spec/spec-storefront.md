---
title: Hydrogen Headless Storefront Specification
version: 1.0
date_created: 2026-06-27
tags: architecture, storefront, shopify, hydrogen, react-router
---

# Hydrogen Headless Storefront

## 1. Purpose & Scope

This specification defines the architecture, components, data contracts, and operational requirements for a production-ready headless Shopify storefront built with React Router 7 and Hydrogen 2026.4.2.

**Audience:** Developers, AI coding agents, DevOps engineers.

**Scope:** Covers all frontend components, GraphQL data layer, cart/checkout system, customer account management, B2B features, caching, and deployment.

---

## 2. Definitions

| Term | Definition |
|------|------------|
| Hydrogen | Shopify's React-based framework for building custom storefronts |
| Storefront API | Shopify's GraphQL API for frontend data |
| Customer Account API | Shopify's OAuth-based API for customer authentication |
| React Router 7 | Successor to Remix, providing SSR, streaming, file-based routing |
| SSR | Server-Side Rendering |
| CSP | Content Security Policy |
| SWR | Stale-While-Revalidate caching strategy |
| B2B | Business-to-business (company accounts, bulk ordering) |
| shadcn/ui | Accessible React component primitives built on Radix UI |

---

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

- **REQ-001**: Product catalog browsing with collection filtering, sorting, and pagination
- **REQ-002**: Product detail pages with variant selection (size, color)
- **REQ-003**: Cart management (add, update, remove lines, discount codes, gift cards)
- **REQ-004**: Full checkout flow: Information → Shipping → Payment → Success
- **REQ-005**: Stripe Checkout payment processing
- **REQ-006**: Customer account registration, login (OAuth), order history, profile, addresses
- **REQ-007**: Search with predictive (typeahead) results across products, pages, articles, collections
- **REQ-008**: Blog and article browsing
- **REQ-009**: Store policies (privacy, shipping, terms, refund, subscription)
- **REQ-010**: SEO support (robots.txt, sitemap.xml, canonical URLs, meta tags)
- **REQ-011**: B2B company registration and management (admin GraphQL mutations)
- **REQ-012**: Region/locale detection and prefix-based routing

### Technical Constraints

- **CON-001**: Must use React Router 7 (NOT Remix) — no `@remix-run/*` imports
- **CON-002**: Must use Shopify Hydrogen 2026.4.2 for Storefront API integration
- **CON-003**: Must use Tailwind CSS v4 (CSS-first engine, NOT v3 JIT)
- **CON-004**: Must use Vite 8 as the build tool
- **CON-005**: Must use TypeScript with strict mode
- **CON-006**: Node.js ^22 or ^24, pnpm package manager

### Performance Guidelines

- **PERF-001**: Deferred data should use React Suspense for streaming SSR
- **PERF-002**: Critical data must be awaited in loaders; non-critical data streamed
- **PERF-003**: Upstash Redis cache with SWR strategy for Storefront API responses

### Security Guidelines

- **SEC-001**: SESSION_SECRET environment variable required for session encryption
- **SEC-002**: CSP headers via Hydrogen's `createContentSecurityPolicy`
- **SEC-003**: Customer Account API OAuth flow for authentication
- **SEC-004**: No secrets in client-side code; use `PRIVATE_STOREFRONT_API_TOKEN` server-side only

---

## 4. Architecture

### High-Level Data Flow

```
Request
  ↓
server.ts (fetch handler)
  ├── createHydrogenRouterContext(request, env, executionContext)
  │     ├── cache (Upstash Redis or caches.open)
  │     ├── AppSession (cookie-based)
  │     └── createHydrogenContext({ env, request, cache, session, i18n, cart })
  │           ↓
  └── createRequestHandler({ build: serverBuild, getLoadContext })
        ↓
  React Router (file-based routing via routes.ts)
        ↓
  Route module loaders → Shopify Storefront API (GraphQL)
        ├── Critical data (awaited)
        └── Deferred data (streamed via Suspense)
              ↓
  Route components → React SSR (renderToReadableStream)
        ↓
  Response
```

### Key Context Objects (available in loaders/actions)

| Property | Type | Purpose |
|----------|------|---------|
| `context.storefront` | StorefrontClient | Shopify Storefront API queries |
| `context.customerAccount` | CustomerAccountClient | Customer Account API |
| `context.cart` | Cart | Cart operations (create, addLines, etc.) |
| `context.session` | Session | Cookie-based session read/write |
| `context.env` | Env | Environment variables |
| `context.waitUntil` | Function | Background task scheduling |

### Directory Structure

```
app/
├── components/       # Reusable UI components
│   └── ui/           # shadcn/ui primitives (Radix-based)
├── constants/        # B2B defaults, region definitions, URL constants
├── graphql/          # GraphQL queries, mutations, fragments
│   ├── admin/        # B2B admin mutations
│   ├── customer-account/  # Customer Account API
│   └── fragment-query/    # Storefront API fragments
├── helpers/          # URL filter link helpers
├── layouts/          # Page layout components
├── lib/              # Core logic (cache, session, checkout, stripe, utils)
├── routes/           # 35+ route files (file-based routing)
├── styles/           # Global CSS (Tailwind v4, reset)
├── type/             # TypeScript type definitions
├── ultils/           # Utility hooks (locale, parse, region)
├── root.tsx          # Root layout, loader, error boundary
├── entry.client.tsx  # Client hydration
├── entry.server.tsx  # Server render (with CSP)
└── routes.ts         # Route config (flatRoutes + hydrogenRoutes)
```

### Route Map

| Route File | URL | Purpose |
|------------|-----|---------|
| `_index.tsx` | `/` | Homepage (hero carousel, new arrivals, recommended) |
| `products.$handle.tsx` | `/products/:handle` | Product detail with variant selection |
| `collections._index.tsx` | `/collections` | All collections listing |
| `collections.$handle.tsx` | `/collections/:handle` | Collection with filters, sort, pagination |
| `collections.all.tsx` | `/collections/all` | All products catalog |
| `cart.tsx` | `/cart` | Cart with line items, summary, discounts, gift cards |
| `cart.$lines.tsx` | `/cart/:lines` | Direct cart creation from URL params |
| `checkout.tsx` | `/checkout` | Checkout layout (stepper shell) |
| `checkout._index.tsx` | `/checkout` | Checkout start |
| `checkout.information.tsx` | `/checkout/information` | Contact + shipping form |
| `checkout.shipping.tsx` | `/checkout/shipping` | Shipping method selection |
| `checkout.payment.tsx` | `/checkout/payment` | Stripe Checkout redirect |
| `checkout.success.tsx` | `/checkout/success` | Order confirmation |
| `search.tsx` | `/search` | Full search (regular + predictive) |
| `blogs._index.tsx` | `/blogs` | Blog listing |
| `blogs.$blogHandle._index.tsx` | `/blogs/:blogHandle` | Single blog entries |
| `blogs.$blogHandle.$articleHandle.tsx` | `/blogs/:blogHandle/:articleHandle` | Single article |
| `pages.$handle.tsx` | `/pages/:handle` | Custom pages |
| `policies._index.tsx` | `/policies` | Store policies list |
| `policies.$handle.tsx` | `/policies/:handle` | Individual policy |
| `account.tsx` | `/account` | Account layout (nav) |
| `account._index.tsx` | `/account` | Redirects to orders |
| `account.orders._index.tsx` | `/account/orders` | Order history with search/filter |
| `account.orders.$id.tsx` | `/account/orders/:id` | Order detail |
| `account.profile.tsx` | `/account/profile` | Edit profile |
| `account.addresses.tsx` | `/account/addresses` | Address CRUD |
| `account.$.tsx` | `/account/*` | Unauthenticated catch-all |
| `account_.login.tsx` | `/account/login` | Customer Account API login |
| `account_.authorize.tsx` | `/account/authorize` | OAuth authorize callback |
| `account_.logout.tsx` | `/account/logout` | Logout (POST) |
| `discount.$code.tsx` | `/discount/:code` | Apply discount from URL |
| `$.tsx` | `/*` | 404 catch-all |
| `[robots.txt].tsx` | `/robots.txt` | SEO robots.txt |
| `[sitemap.xml].tsx` | `/sitemap.xml` | SEO sitemap |
| `sitemap.$type.$page[.xml].tsx` | `/sitemap/:type/:page.xml` | Paginated sitemap |

---

## 5. Interfaces & Data Contracts

### Cart API (Form Actions)

Actions dispatched via form submissions (`action` param):

| Action | Description |
|--------|-------------|
| `LinesAdd` | Add variant lines to cart |
| `LinesUpdate` | Update line item quantities |
| `LinesRemove` | Remove line items |
| `DiscountCodesUpdate` | Apply/remove discount codes |
| `GiftCardCodesAdd` | Apply gift card |
| `GiftCardCodesRemove` | Remove gift card |
| `BuyerIdentityUpdate` | Update buyer identity |

### Checkout Flow

```
/cart → /checkout → /checkout/information → /checkout/shipping → /checkout/payment → /checkout/success
                             ↓ validates                    ↓                     ↓
                        Contact + shipping            Shipping method       Stripe Checkout
                        address form                  selection (Standard,  session creation
                         (validated)                   Express, Overnight)   + redirect
```

### Stripe Integration

```typescript
// lib/stripe.server.ts
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// lib/checkout.server.ts
async function createStripeCheckoutSession(cart, customer, shippingMethod, env) {
  // Converts cart line items → Stripe line items
  // Creates Stripe Checkout Session
  // Returns session URL for redirect
}
```

### Caching Strategy

```typescript
// lib/redis-cache.ts
class UpstashCache implements Cache {
  // Implements Web Cache interface
  // Uses Upstash Redis REST API
  // Supports stale-while-revalidate (SWR)
  // Falls back to NoOpCache if Redis unavailable
}

// Usage: Fallback when caches.open() unavailable (Vercel)
const cache = typeof caches !== 'undefined'
  ? await caches.open('hydrogen')
  : createUpstashCache();
```

### Session

```typescript
// lib/session.ts
class AppSession {
  // Cookie-based session
  // Encrypted with SESSION_SECRET
  // Stores: customer access token, cart ID, country, path prefix
  static async init(request: Request, secrets: string[]): Promise<AppSession>
  async get(): Promise<SessionData>
  async set(data: SessionData): Promise<void>
  async commit(): Promise<string>  // Returns Set-Cookie header value
  async destroy(): Promise<void>
}
```

---

## 6. Component Architecture

### shadcn/ui Components (in `app/components/ui/`)

| Component | Description |
|-----------|-------------|
| `accordion` | Collapsible sections (filters) |
| `alert` | Notification banners |
| `badge` | Status/label indicators |
| `button` | Interactive buttons |
| `card` | Content containers |
| `carousel` | Image/slider carousels |
| `dialog` | Modal dialogs |
| `dropdown-menu` | Context menus |
| `input` | Form input fields |
| `label` | Form labels |
| `popover` | Floating content panels |
| `radio-group` | Radio button groups |
| `sheet` | Slide-out panels (cart drawer) |
| `skeleton` | Loading placeholders |

### Custom Components (in `app/components/`)

| Component | Purpose |
|-----------|---------|
| `AddToCartButton` | Cart addition with variant context |
| `Aside` | Slide-out panel provider (cart, search, menu) |
| `Carousel` | Product image carousel |
| `CartLineItem` | Single cart line display |
| `CartMain` | Cart page main content |
| `CartSummary` | Cart totals + discount section |
| `Filter` | Collection filter panel |
| `Footer` | Site footer |
| `Header` | Site header with navigation |
| `Hotspot` | Product image hotspot overlay |
| `Link` | Client-side navigation link |
| `MockShopNotice` | Dev mode notice |
| `Modal` | Modal dialog |
| `PageLayout` | Main page layout wrapper |
| `PaginatedResourceSection` | Cursor-based pagination |
| `ProductForm` | Variant selector + add to cart |
| `ProductImage` | Optimized product image |
| `ProductItem` | Product card in grids |
| `ProductPrice` | Price display with compare-at |
| `RegionSelector` | Country/region switcher |
| `SearchForm` | Search input |
| `SearchFormPredictive` | Predictive search input |
| `SearchResults` | Search results display |
| `SearchResultsPredictive` | Predictive search results |

---

## 7. Acceptance Criteria

- **AC-001**: Storefront renders all product data from Shopify Storefront API without errors
- **AC-002**: Cart operations (add, update, remove) reflect immediately with optimistic UI
- **AC-003**: Checkout flow completes end-to-end: cart → info → shipping → Stripe → success
- **AC-004**: Customer can register, login (OAuth), view orders, edit profile, manage addresses
- **AC-005**: Search returns relevant results across products, pages, articles, and collections
- **AC-006**: Predictive search shows results within 300ms of user stopping typing
- **AC-007**: All pages pass WCAG AA accessibility standards
- **AC-008**: Homepage loads within 2 seconds on 3G (LCP < 2.5s)
- **AC-009**: TypeScript compiles with strict mode, no `any` types
- **AC-010**: No `@remix-run/*` imports exist in the codebase

---

## 8. Tech Stack

| Layer | Technology | Version Constraints |
|-------|------------|-------------------|
| Framework | React Router 7 | 7.15.1 |
| Storefront SDK | @shopify/hydrogen | 2026.4.2 |
| UI Runtime | React | ^18.3.1 |
| Styling | Tailwind CSS | ^4.3.1 |
| UI Components | shadcn/ui + Radix UI | latest |
| Build | Vite | ^8.1.0 |
| Language | TypeScript | ^5.9.3 |
| Package Manager | pnpm | ^9 |
| Payment | Stripe | ^22.3.0 |
| Cache | Upstash Redis | ^1.38.0 |
| Icons | lucide-react | ^1.21.0 |
| Carousel | embla-carousel-react | ^8.6.0 |
| Font | Geist (Variable) | latest |
| Codegen | @shopify/hydrogen-codegen | 0.3.3 |
| Deployment | Vercel / Shopify Oxygen | — |

---

## 9. Test Automation Strategy

- **Test Levels**: Unit (Vitest), Integration (React Testing Library), E2E (Playwright)
- **Frameworks**: Vitest (recommended), ESLint for static analysis
- **CI/CD**: GitHub Actions (`.github/` workflows), pre-deployment verification scripts
- **Commands**:
  - `pnpm typecheck` — TypeScript validation
  - `pnpm lint` — ESLint analysis
  - `pnpm build` — Production build verification

---

## 10. Dependencies & External Integrations

### External Systems
- **EXT-001**: Shopify Storefront API (GraphQL) — Primary product, collection, cart, blog data
- **EXT-002**: Shopify Customer Account API (OAuth) — Customer authentication and management
- **EXT-003**: Shopify Admin API (GraphQL) — B2B company management mutations
- **EXT-004**: Stripe Checkout — Payment processing

### Third-Party Services
- **SVC-001**: Upstash Redis — Caching layer for Vercel deployment
- **SVC-002**: Vercel — Hosting and edge runtime
- **SVC-003**: Shopify Oxygen — Alternative hosting platform

### Infrastructure Dependencies
- **INF-001**: Edge runtime — Server-side rendering at edge locations
- **INF-002**: Cookie-based sessions — Encrypted with SESSION_SECRET

### Data Dependencies
- **DAT-001**: Shopify product catalog — GraphQL Storefront API (version 2024-10+)
- **DAT-002**: Customer data — Customer Account API (OAuth 2.0)

---

## 11. Examples & Edge Cases

### Route Data Loading Pattern

```typescript
// Loader with critical (awaited) + deferred (streamed) data
export async function loader({params, context}: LoaderFunctionArgs) {
  const {handle} = params;

  // Critical - blocks render
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle},
  });

  // Deferred - streamed via Suspense
  const recommendations = context.storefront.query(RECOMMENDATIONS_QUERY, {
    variables: {productId: product.id},
  });

  return defer({
    product,
    recommendations, // Promise — rendered inside <Suspense>
  });
}
```

### Cart Optimistic Update Pattern

```typescript
// Cart actions use form submissions with action param
export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const cartAction = formData.get('action');

  switch (cartAction) {
    case 'LinesAdd': {
      const lines = JSON.parse(String(formData.get('lines')));
      const cart = await context.cart.addLines(lines);
      return json({cart});
    }
    // ...
  }
}
```

### Edge Case: Missing Environment Variables

```typescript
// context.ts — fails fast if SESSION_SECRET missing
if (!env?.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is not set');
}
```

---

## 12. Related Specifications / Further Reading

- [Hydrogen Documentation](https://shopify.dev/custom-storefronts/hydrogen)
- [React Router 7 Documentation](https://reactrouter.com/)
- [Shopify Storefront API Reference](https://shopify.dev/docs/api/storefront)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

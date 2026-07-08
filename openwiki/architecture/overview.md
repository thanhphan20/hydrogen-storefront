# Architecture Overview

## High-Level System Design

This storefront is a modern headless commerce frontend built on **React Router 7** and **Hydrogen**, deployed on edge networks (Vercel or Shopify Oxygen). The architecture emphasizes:

1. **Server-side rendering (SSR)** with streaming for optimal performance
2. **Data-driven routing** where loaders fetch critical data before render
3. **Deferred data** for non-critical content loaded after initial paint
4. **Edge deployment** with caching for global performance
5. **Multi-API integration** (Storefront, Customer Account, Admin, Stripe)

## Request Flow

```
┌─ Edge / Vercel / Oxygen
│
├─ server.ts (entry)
│  └─ Maps environment variables
│  └─ Creates Hydrogen context (session, cache, storefront client)
│
├─ entry.server.tsx
│  └─ Renders React Router tree to readable stream
│  └─ Applies CSP headers for security
│  └─ Wraps with Stripe + Shopify shop domains
│
├─ React Router Routing
│  ├─ Match incoming URL to route file (/app/routes/*.tsx)
│  ├─ Call loader() to fetch data
│  │  ├─ Critical data: await before render (e.g., product details)
│  │  └─ Deferred data: defer() and fetch after initial HTML (e.g., recommendations)
│  ├─ Render component with data
│  └─ Stream HTML to client
│
└─ entry.client.tsx
   └─ Hydrate React on browser
   └─ Enable client-side interactivity
```

## Hydrogen Context

The context object (created in `/app/lib/context.ts`) provides access to:

```typescript
interface HydrogenRouterContextProvider {
  env: Env                              // Environment variables
  request: Request                      // Current HTTP request
  cache: Cache                          // Web Cache API (in-memory or Redis)
  waitUntil: (p: Promise) => void       // Background task executor
  session: AppSession                   // User session (encrypted cookie)
  i18n: {language, country}             // Localization context
  cart: {queryFragment}                 // Cart query fragment
  storefront: StorefrontClient          // GraphQL client for Storefront API
  // Additional context (extensible)
}
```

The context is:
- **Created per request** in `server.ts` → `createHydrogenRouterContext()`
- **Passed to React Router loaders** via `args.context`
- **Cached in loaders** via `args.context.cache` (Upstash Redis on Vercel, in-memory on Oxygen)
- **Extended** with custom properties in `context.ts` for future integrations (CMS, reviews, etc.)

## React Router 7 Integration

### File-Based Routing

Routes are automatically discovered from `/app/routes/*.tsx`. Naming conventions:

| File | Route |
|------|-------|
| `_index.tsx` | `/` (home) |
| `products.$handle.tsx` | `/products/:handle` |
| `account.tsx` | `/account` (layout) |
| `account._index.tsx` | `/account` (leaf) |
| `account.orders._index.tsx` | `/account/orders` |
| `$.tsx` | `/*` (catch-all 404) |

### Loader Data Flow

1. **Loader executes** before component render
2. **Critical data** is awaited:
   ```typescript
   // Product page: wait for product details
   const [{product}] = await Promise.all([
     context.storefront.query(PRODUCT_QUERY, {variables: {handle}})
   ]);
   ```
3. **Deferred data** is not awaited (returns immediately):
   ```typescript
   // Recommendations load after initial page
   const recommendedProducts = defer(
     context.storefront.query(RECOMMENDED_PRODUCTS_QUERY)
   );
   ```
4. **Component receives data** via `useLoaderData()` hook
5. **Deferred components** use `<Suspense>` + `<Await>` to render async data

### Root Loader Performance

The root loader (`/app/root.tsx`) fetches global data (header, footer) used on every page:

```typescript
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod, currentUrl, nextUrl
}) => {
  // Only revalidate on mutations (POST, PUT, DELETE)
  if (formMethod && formMethod !== 'GET') return true;
  
  // Otherwise: return false (default, skip revalidation)
  return false;
};
```

**Important:** Root loader revalidation is **disabled by default** to avoid redundant Storefront API calls. This trades immediate data freshness for performance. If data should update immediately, use `useRevalidator()` hook manually or enable revalidation selectively.

## Styling Architecture

### Tailwind CSS v4

- **Configuration:** `/app/styles/tailwind.css` (modern CSS-first syntax, no JS config)
- **Global styles:** `/app/styles/app.css` and `/app/styles/reset.css`
- **Component utilities:** Use Tailwind classes directly in JSX
- **Design tokens:** Define in `tailwind.css` via CSS custom properties

### Shadcn UI

- **Location:** `/app/components/ui/*.tsx`
- **Based on:** Radix UI primitives (unstyled, accessible components)
- **Styling:** Shadcn uses Tailwind utilities; customize by editing component files
- **Pattern:** Copy component from shadcn registry, modify for brand, commit to repo

## Data Integration

### Storefront API

- **Client:** Created by Hydrogen in `context.storefront`
- **Queries:** Defined as GraphQL strings in route files or `/app/lib/fragments.ts`
- **Type generation:** Run `pnpm codegen` to auto-generate TypeScript types
- **Caching:** Responses cached via `cache` object (respects `cache-control` headers)

Example query:
```typescript
const PRODUCT_QUERY = `#graphql
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      selectedOrFirstAvailableVariant(...) { ... }
    }
  }
` as const;

const {product} = await context.storefront.query(PRODUCT_QUERY, {
  variables: {handle}
});
```

### Upstash Redis (Vercel Only)

- **Location:** `/app/lib/redis-cache.ts`
- **Purpose:** Implements Web Cache API for Vercel deployments (Oxygen uses in-memory cache)
- **Setup:** Environment variable `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- **Auto-selection:** `context.ts` detects platform and picks in-memory (Oxygen) or Redis (Vercel)

### Stripe Integration

- **Session creation:** `/app/lib/checkout.server.ts`
- **Client config:** `/app/lib/stripe.server.ts`
- **UI component:** `/app/components/StripeEmbeddedCheckout.tsx`
- **Flow:** Cart → Checkout route → Stripe iframe → Success page

### Customer Account API

- **Purpose:** Login, profile, orders, addresses
- **Routes:** `/app/routes/account*.tsx`
- **Type definitions:** Generated from `customer-accountapi.generated.d.ts`
- **Queries:** Defined inline or in `/app/graphql/customer-account/`

### Admin API

- **Purpose:** Order lookups, inventory management (server-side only)
- **Setup:** Requires `PRIVATE_ADMIN_ACCESS_TOKEN`, `PRIVATE_ADMIN_API_KEY`, `PRIVATE_ADMIN_API_SECRET_KEY`
- **Usage:** Direct HTTP calls from server routes (not via Hydrogen helper)
- **Example:** `/app/routes/checkout.success.tsx` calls Admin API to get order details

## Performance Optimizations

### Critical vs. Deferred Data

- **Critical:** Product details, collection items, cart state (await before render)
- **Deferred:** Recommendations, reviews, related products (fetch after initial HTML)

### Streaming

- Server sends partial HTML as it streams, enabling:
  - Faster Time to First Byte (TTFB)
  - Progressive rendering while deferred data loads
  - Suspense boundaries for Awaitable components

### Caching Strategy

1. **HTTP cache:** Storefront API responses include `cache-control` headers
2. **Hydrogen cache layer:** Respects cache headers, stores in memory (Oxygen) or Redis (Vercel)
3. **Root loader:** Disabled revalidation prevents redundant API calls on navigation
4. **Session cache:** Encrypted session stored in cookie, reduces database queries

### Image Optimization

- Uses Shopify CDN via `<Image>` component from Hydrogen
- Automatic responsive image generation
- Avoids unnecessary network requests for variants

## Deployment Targets

### Vercel

- **Runtime:** Node.js edge functions
- **Entry:** `server.ts` exports default fetch handler
- **Cache:** Upstash Redis (configured via env vars)
- **Analytics:** `@vercel/analytics` auto-injected
- **Cost:** Pay per request + Redis storage

### Shopify Oxygen

- **Runtime:** Cloudflare Workers (edge compute)
- **Entry:** `server.ts` same as Vercel
- **Cache:** In-memory cache (no external storage needed)
- **Preview:** `pnpm dev` uses MiniOxygen for local Oxygen simulation
- **Cost:** Included with Shopify Plus subscription

## Security

### Content Security Policy (CSP)

- **Setup:** `/app/entry.server.tsx` defines CSP headers
- **Includes:** Shopify CDN, Stripe domains, shop checkout domain
- **Nonce:** Generated per request to allow inline scripts safely
- **Enforcement:** Prevents XSS and inline script injection

### Session Management

- **Encryption:** Sessions encrypted with `SESSION_SECRET` environment variable
- **Storage:** Encrypted cookie sent to client, passed back in requests
- **Expiry:** Configurable in `/app/lib/session.ts`
- **Implementation:** `/app/lib/session.ts` uses `AppSession` class

### Environment Variables

- **Public vars:** Prefixed `PUBLIC_*` (safe to expose to browser)
- **Private vars:** Other vars (keep secret, server-side only)
- **Example:** `STRIPE_SECRET_KEY` never sent to client; only `STRIPE_PUBLIC_KEY` used in browser

## Development Workflow

1. **Modify route/component** → Files auto-reload (HMR)
2. **Add GraphQL query** → Run `pnpm codegen` to generate types
3. **Change environment** → Restart dev server (`pnpm dev`)
4. **Test build** → Run `pnpm build && pnpm preview`
5. **Type check** → Run `pnpm typecheck` before commit
6. **Lint code** → Run `pnpm lint` for code quality

## Extensibility

### Adding Custom Context

Edit `/app/lib/context.ts` `additionalContext` object:

```typescript
const additionalContext = {
  cms: await createCMSClient(env),
  reviews: await createReviewsClient(env),
} as const;
```

Then access in loaders: `context.cms` or `context.reviews`.

### Custom Loaders

Any route file can export a `loader` function:

```typescript
export async function loader({context, params, request}: Route.LoaderArgs) {
  // Fetch data, validate, transform
  return {/* data */};
}
```

### Error Handling

- Route-level errors: Export `ErrorBoundary` component
- Global 404/50x: Catch-all route `$.tsx`
- Streaming errors: Handled in `entry.server.tsx` onError callback

---

**Key Source Files:**
- `/server.ts` — Request handler entry
- `/app/entry.server.tsx` — React rendering + CSP
- `/app/lib/context.ts` — Hydrogen context creation
- `/app/root.tsx` — Root loader + revalidation logic
- `/app/routes/*.tsx` — Individual page routes

**See Also:**
- [React Router Docs](https://reactrouter.com/)
- [Hydrogen Docs](https://shopify.dev/custom-storefronts/hydrogen)

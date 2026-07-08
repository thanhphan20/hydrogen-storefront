# Configuration & Integrations

This section covers environment setup, external API configuration, and how third-party services are integrated into the storefront.

## Environment Variables

### Core Variables (Required)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `SESSION_SECRET` | String | Secret key for encrypting user sessions | `your-secret-key-min-32-chars` |
| `PUBLIC_STOREFRONT_API_TOKEN` | String | Public access token for Storefront API | Begins with `shpat_` |
| `PRIVATE_STOREFRONT_API_TOKEN` | String | Private token for server-side Storefront API calls | Begins with `shpat_` |
| `PUBLIC_STORE_DOMAIN` | String | Shopify store domain | `mystore.myshopify.com` |
| `PUBLIC_CHECKOUT_DOMAIN` | String | Domain for Shopify checkout redirect (used in CSP) | `mystore.myshopify.com` or custom domain |

### Stripe Integration Variables (Required for Checkout)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `STRIPE_SECRET_KEY` | String | Stripe secret key (server-side) | `sk_test_...` or `sk_live_...` |
| `STRIPE_PUBLIC_KEY` | String | Stripe publishable key (client-side) | `pk_test_...` or `pk_live_...` |

### Customer Account API Variables (Required for Login)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | String | OAuth client ID for Customer Account API | Assigned by Shopify |
| `PUBLIC_CUSTOMER_ACCOUNT_API_URL` | String | Customer Account API endpoint | `https://shopify.com/account/...` |

### Admin API Variables (Optional, for Order Lookups)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `PRIVATE_ADMIN_ACCESS_TOKEN` | String | Admin API access token | `shpat_...` |
| `PRIVATE_ADMIN_API_KEY` | String | Admin API key | Assigned by Shopify |
| `PRIVATE_ADMIN_API_SECRET_KEY` | String | Admin API secret | Assigned by Shopify |
| `PRIVATE_ADMIN_API_VERSION` | String | Admin API version | `2024-01` |
| `SHOP_ID` | String | Shopify shop ID (gid format) | `gid://shopify/Shop/...` |

### Caching Variables (Vercel Deployments)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | String | Upstash Redis REST endpoint | `https://....upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | String | Upstash Redis auth token | `AXX...` |

### Optional Analytics & Utilities

| Variable | Type | Description |
|----------|------|-------------|
| `NODE_ENV` | String | `development` or `production` (auto-detected) |

## How to Get Credentials

### Shopify Storefront API Token

1. Go to Shopify Admin → **Settings** → **Apps and integrations**
2. Click **Develop apps**
3. Create or select your app
4. Go to **Configuration**
5. Under **Admin API access scopes**, enable required scopes (e.g., `read_products`, `read_orders`)
6. Copy **Access token** from **API credentials**

**Public token:** Has only `storefront.read` scope (client-safe)
**Private token:** Has full read/write scopes (server-only)

### Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **API keys**
3. Copy **Secret key** and **Publishable key**
4. Test keys start with `sk_test_` and `pk_test_`; live keys start with `sk_live_` and `pk_live_`

### Customer Account API

1. In Shopify Admin → **Settings** → **Apps and integrations**
2. Find your app, click **Configuration**
3. Under **Customer Account API**, enable it
4. Copy **Client ID** and **API URL**

### Upstash Redis (Vercel)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a Redis database (US or EU region)
3. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**
4. These are safe to share with Vercel environment (not sensitive like API keys)

## Setup Instructions

### Development (Local)

1. **Clone repository** and install dependencies:
   ```bash
   pnpm install
   ```

2. **Create `.env` file** at root (see `.env.example` as template):
   ```
   SESSION_SECRET=your-secret-key-min-32-chars
   PUBLIC_STOREFRONT_API_TOKEN=shpat_...
   PRIVATE_STOREFRONT_API_TOKEN=shpat_...
   PUBLIC_STORE_DOMAIN=mystore.myshopify.com
   PUBLIC_CHECKOUT_DOMAIN=mystore.myshopify.com
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=...
   PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://...
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

   This starts:
   - Vite dev server on `http://localhost:3000`
   - MiniOxygen (local Oxygen simulation) for testing edge functions
   - GraphQL codegen for type generation from queries

### Production (Vercel)

1. **Deploy repository** to Vercel via GitHub or CLI:
   ```bash
   vercel
   ```

2. **Set environment variables** in Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add all required variables
   - Include Upstash Redis credentials for caching

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Production (Shopify Oxygen)

1. **Authenticate with Shopify CLI:**
   ```bash
   shopify auth login
   ```

2. **Deploy:**
   ```bash
   shopify hydrogen deploy
   ```

3. **Set environment variables** in Shopify Admin:
   - Go to **Custom apps** → Your app → **Configuration**
   - Under **Environment variables**, add variables
   - (Oxygen uses in-memory cache, so no Upstash needed)

## API Integration Patterns

### Shopify Storefront API

**Location:** Queries executed via `context.storefront.query()`

**Setup in code:**
- Storefront client created in `/app/lib/context.ts`
- Queries defined as GraphQL strings in route files or `/app/lib/fragments.ts`
- Types generated by running `pnpm codegen`

**Example:**
```typescript
const PRODUCTS_QUERY = `#graphql
  query getProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
      }
    }
  }
` as const;

const {products} = await context.storefront.query(PRODUCTS_QUERY, {
  variables: {first: 10}
});
```

**Caching:**
- Storefront API responses include `cache-control` headers
- Hydrogen cache layer respects these headers
- Cache key: `hydrogen:${request.url}`
- On Vercel: Stored in Upstash Redis
- On Oxygen: Stored in in-memory cache

**Rate limits:**
- Standard: 2 requests/second per IP
- Burst: 4 requests/second
- Queries count toward limits based on query complexity

**Docs:** [Shopify Storefront API](https://shopify.dev/docs/api/storefront)

### Stripe Embedded Checkout

**Location:** `/app/lib/checkout.server.ts` and `/app/components/StripeEmbeddedCheckout.tsx`

**Setup:**

1. Add Stripe keys to environment variables
2. In checkout route loader, call `createEmbeddedCheckoutSession()`:
   ```typescript
   const session = await createEmbeddedCheckoutSession({
     cart: args.context.cart,
     origin: new URL(args.request.url).origin,
     shopName: 'My Store',
     stripeSecretKey: args.context.env.STRIPE_SECRET_KEY,
   });
   ```

3. Return `sessionId` and `clientSecret` to component
4. Component renders Stripe.js iframe:
   ```typescript
   <StripeEmbeddedCheckout
     clientSecret={clientSecret}
     onComplete={() => navigate('/checkout/success')}
   />
   ```

**Important:**

- **Shipping options:** Hardcoded flat rates in `SHIPPING_RATES`. Replace with real carrier API as needed.
- **Allowed countries:** Defined in `SHIPPING_ALLOWED_COUNTRIES`. Update to match your shipping zones.
- **Amount conversion:** Handle zero-decimal currencies (JPY, KRW, etc.) via `toStripeUnitAmount()` helper.
- **Session expiry:** Stripe sessions expire after 24 hours.

**Docs:** [Stripe Embedded Checkout](https://stripe.com/docs/checkout/embedded/quickstart)

### Shopify Customer Account API

**Location:** Routes in `/app/routes/account*.tsx`

**Setup:**

1. Add Customer Account API variables to environment
2. In login route, call Customer Account API:
   ```typescript
   const response = await fetch(`${PUBLIC_CUSTOMER_ACCOUNT_API_URL}/api/auth`, {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({email, password})
   });
   ```

3. Store customer token in session
4. Use token in subsequent requests to authenticate customer-specific queries

**Session storage:**
- Customer token encrypted in session cookie
- Session created in `/app/lib/session.ts`
- Expires based on SESSION_SECRET and cookie config

**Docs:** [Customer Account API](https://shopify.dev/docs/api/customer-account)

### Shopify Admin API (Server-side)

**Location:** Server routes (e.g., `/app/routes/checkout.success.tsx`)

**Setup:**

1. Add Admin API variables to environment
2. Make HTTP requests directly (not via Hydrogen helper):
   ```typescript
   const response = await fetch(
     `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
     {
       method: 'POST',
       headers: {
         'X-Shopify-Access-Token': ADMIN_TOKEN,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({query: ADMIN_QUERY, variables})
     }
   );
   ```

**Use cases:**
- Order fulfillment and tracking
- Inventory checks (server-side only)
- Customer data lookups
- Webhook handling

**Security:**
- Never expose Admin API token to client
- Only use in server routes (loaders, actions)
- Never include in GraphQL fragments that get inlined in HTML

**Docs:** [Admin API](https://shopify.dev/docs/api/admin)

### Upstash Redis (Caching on Vercel)

**Location:** `/app/lib/redis-cache.ts`

**How it works:**

1. **Development (local):** Uses in-memory cache (no external storage)
2. **Oxygen:** Uses in-memory cache (included with Oxygen runtime)
3. **Vercel:** Uses Upstash Redis (requires REST URL + token)

**Setup:**

1. Create Upstash Redis database
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel environment
3. Code automatically detects and uses Redis on Vercel

**Cache behavior:**

- Storefront API responses cached based on `cache-control` headers
- Cache key: `hydrogen:${request.url}`
- TTL: Parsed from `max-age` directive
- Stale-while-revalidate: Returns stale data while refreshing in background

**Cost:** Pay per API call (usually $1-2/month for small storefronts)

**Docs:** [Upstash Redis](https://upstash.com/docs/redis)

## Error Handling

### Missing Environment Variables

If a required variable is missing, the app will fail to start with an error:
```
Error: SESSION_SECRET environment variable is not set
```

**Solution:** Add the missing variable to `.env` (development) or Vercel/Oxygen dashboard (production).

### Storefront API Errors

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid API Token` | Wrong Storefront API token | Verify token in Shopify Admin |
| `Query complexity error` | Query too expensive | Simplify query, use aliases, fetch fewer fields |
| `Rate limited` | Too many requests | Add exponential backoff retry logic |
| `Product not found` | Invalid product handle | Check handle spelling in Shopify Admin |

### Stripe Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid API Key` | Wrong Stripe key | Verify key in Stripe dashboard |
| `Invalid amount` | Amount not in cents (or zero-decimal handling wrong) | Check `toStripeUnitAmount()` conversion |
| `Invalid currency code` | Unsupported currency | Add currency to `ZERO_DECIMAL_CURRENCIES` if needed |
| `Session expired` | Checkout session older than 24 hours | Create new session |

### Cache Issues

**Problem:** Data not updating on Vercel
**Solution:** Check Upstash Redis connection. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct.

**Problem:** Cache getting too large
**Solution:** Upstash charges per requests, not storage. Monitor API calls in Upstash dashboard.

## Security Best Practices

1. **Never commit `.env` to Git.** Use `.env.example` as a template.
2. **Use environment variables for all secrets.** Don't hardcode API keys in source code.
3. **Public vs. Private vars:**
   - `PUBLIC_*` variables are exposed to browser (safe to share)
   - Other variables are server-only (keep secret)
4. **Rotate credentials regularly** — especially `STRIPE_SECRET_KEY` and `PRIVATE_STOREFRONT_API_TOKEN`.
5. **Enable CSP headers** in `/app/entry.server.tsx` to prevent XSS and script injection.
6. **Use HTTPS in production** — Stripe and Shopify require HTTPS for security.
7. **Review Shopify scopes** — Only enable API scopes your app actually needs.

## Testing APIs Locally

### Test Shopify Storefront API

Create a test query file:
```typescript
// /app/routes/test.query.tsx
import type {Route} from './+types/test.query';

export async function loader({context}: Route.LoaderArgs) {
  const {products} = await context.storefront.query(`#graphql
    query {
      products(first: 1) {
        nodes {
          id
          title
        }
      }
    }
  `);
  return {products};
}
```

Navigate to `http://localhost:3000/test-query` to see results.

### Test Stripe Integration

1. Use Stripe test keys (start with `sk_test_` and `pk_test_`)
2. Use test card numbers:
   - `4242 4242 4242 4242` — Successful payment
   - `4000 0000 0000 0002` — Declined payment
   - `4000 0025 0000 3155` — Requires authentication

### Test Admin API

Create a test route and call Admin API with test data.

---

**Key files:**
- `.env.example` — Environment template
- `/app/lib/context.ts` — Context creation and API client setup
- `/app/lib/checkout.server.ts` — Stripe integration
- `/app/lib/session.ts` — Session management
- `/app/lib/redis-cache.ts` — Caching on Vercel
- `/server.ts` — Request handler entry point

**See Also:**
- [Architecture Overview](../architecture/overview.md) — Data flow
- [Workflows](./workflows.md) — Feature implementation details

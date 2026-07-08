# Domain Workflows

This section documents the major features and workflows in the storefront. Each workflow explains the data flow, key files, and extension points.

## Product Catalog

### Displaying a Product

**Routes involved:** `/app/routes/products.$handle.tsx`

1. **URL:** User navigates to `/products/my-product`
2. **Loader execution:**
   - Extract `handle` from URL params
   - Query Storefront API for product details (critical data)
   - Query for recommended products (deferred data)
3. **Critical data fetched:**
   - Product title, description, vendor
   - Variants with images, prices, available inventory
   - Selected options from URL query params
4. **Component renders:**
   - Product image gallery
   - Price and availability badge
   - Product form (options, quantity, add-to-cart button)
   - Deferred recommended products in `<Suspense>` boundary
5. **User interaction:**
   - Select options (size, color, etc.)
   - Click "Add to Cart" → POST to `/cart.tsx`

**Key files:**
- `/app/routes/products.$handle.tsx` — Page component and loader
- `/app/components/ProductImage.tsx` — Image carousel
- `/app/components/ProductForm.tsx` — Option selection + add-to-cart logic
- `/app/components/ProductPrice.tsx` — Price formatting and badge
- `/app/lib/fragments.ts` — Product and variant query fragments

**Extension points:**
- Modify product query fragments to add custom fields (metafields, reviews, etc.)
- Edit `ProductForm.tsx` to change option selection UI or add custom validation
- Update CSS in `/app/styles/app.css` or Tailwind classes for product layout

### Browsing Collections

**Routes involved:** `/app/routes/collections.$handle.tsx`, `/app/routes/collections._index.tsx`, `/app/routes/collections.all.tsx`

1. **Collections index:** `/app/routes/collections._index.tsx`
   - Lists all collections with thumbnails
   - Fetches from Storefront API

2. **Single collection:** `/app/routes/collections.$handle.tsx`
   - Display collection title, description, hero image
   - Filter products by vendor, price, availability (via `Filter.tsx`)
   - Paginated product grid

3. **All products:** `/app/routes/collections.all.tsx`
   - Special route showing all products across store
   - Uses same filtering and pagination as single collection

**Key files:**
- `/app/routes/collections.*.tsx` — Collection pages
- `/app/components/Filter.tsx` — Faceted filtering UI (vendor, price range, etc.)
- `/app/components/PaginatedResourceSection.tsx` — Pagination logic
- `/app/components/ProductItem.tsx` — Product card in grid

**Data flow:**
1. Parse filter + sort params from URL query string
2. Query Storefront API with filters and pagination cursor
3. Render product grid
4. User clicks filter checkbox → URL updates → loader re-runs → grid re-renders

**Extension points:**
- Add custom filter types in `Filter.tsx` (e.g., color swatches, size guides)
- Modify Storefront API query to include additional product fields
- Customize product card appearance in `ProductItem.tsx`

### Product Search

See [Search Workflows](#search-workflows) below.

---

## Shopping Cart

### Cart Management

**Key files:**
- `/app/routes/cart.tsx` — Cart page
- `/app/components/CartMain.tsx` — Cart items list + checkout button
- `/app/components/CartLineItem.tsx` — Individual line item with quantity controls
- `/app/components/CartSummary.tsx` — Subtotal, tax, shipping, discount calculations
- `/app/components/AddToCartButton.tsx` — Button to add items to cart

### Add to Cart Flow

1. **User action:** On product page, user selects options and clicks "Add to Cart"
2. **Form submission:** `ProductForm.tsx` POST request to `/cart.$lines.tsx`
3. **Route handler:** `/app/routes/cart.$lines.tsx`
   - Parses form data (variant ID, quantity)
   - Calls Hydrogen `cart.addLines()` API
   - Redirects back to product page or to cart page
4. **Cart state:** Updated in session (persisted via encrypted cookie)
5. **UI updates:** Cart icon shows updated count

### Modify Cart

**Routes involved:** `/app/routes/cart.tsx`

1. **View cart:** User navigates to `/cart`
2. **Loader:**
   - Fetches current cart from session
   - Queries Storefront API for line item details (prices, images)
3. **Component:**
   - Shows line items with images, prices, quantities
   - Each line has +/- buttons to change quantity
   - Line has "Remove" button
   - Summary shows subtotal, tax estimate, shipping, discount
4. **User interactions:**
   - Update quantity → Form submission to Hydrogen cart API
   - Remove item → Delete from cart
   - Apply discount → Form submission

**Key files:**
- `/app/routes/cart.tsx` — Cart page loader and component
- `/app/routes/cart.$lines.tsx` — Cart line item mutation handler
- `/app/components/CartMain.tsx` — Main cart layout
- `/app/components/CartLineItem.tsx` — Line item UI + quantity controls
- `/app/components/CartSummary.tsx` — Totals and checkout button

**Extension points:**
- Add cross-sell / upsell recommendations in `CartMain.tsx`
- Customize tax/shipping calculations in `CartSummary.tsx`
- Add promotional code / discount application UI

---

## Checkout & Payment

### Stripe Embedded Checkout Integration

**Routes involved:**
- `/app/routes/checkout.tsx` — Checkout page layout
- `/app/routes/checkout._index.tsx` — Embedded Stripe checkout UI
- `/app/routes/checkout.success.tsx` — Post-purchase confirmation
- `/app/routes/checkout.return.tsx` — Canceled checkout

**Data flow:**

1. **User navigates to checkout:** `/cart` "Checkout" button → `/checkout`
2. **Checkout page loader:**
   - Validates cart is not empty
   - Calls `createEmbeddedCheckoutSession()` (server-side)
   - Converts Shopify cart to Stripe line items
   - Calls Stripe API to create checkout session
   - Returns session ID and client secret to browser
3. **Browser-side:**
   - Loads Stripe.js SDK
   - Renders `<StripeEmbeddedCheckout>` component (iframe)
   - Stripe iframe shows payment form (card, Apple Pay, Google Pay, etc.)
4. **User completes payment:**
   - Stripe processes payment
   - Redirects to success URL with `session_id` param
5. **Success route** (`/checkout.success`):
   - Calls Stripe API to retrieve session details
   - Queries Admin API (optional) to get order from Shopify
   - Displays order confirmation

**Key files:**
- `/app/lib/checkout.server.ts` — Session creation, amount conversion, shipping options
- `/app/components/StripeEmbeddedCheckout.tsx` — Iframe wrapper component
- `/app/routes/checkout._index.tsx` — Embedded checkout loader + component
- `/app/routes/checkout.success.tsx` — Confirmation page

**Important notes:**
- **Currency handling:** Stripe requires amounts in cents for most currencies, but some currencies (JPY, KRW, etc.) are zero-decimal. See `ZERO_DECIMAL_CURRENCIES` in checkout files.
- **Shipping options:** Hardcoded flat rates in `SHIPPING_RATES`. Replace with real carrier rates integration as needed.
- **Allowed countries:** Defined in `SHIPPING_ALLOWED_COUNTRIES`. Update to match merchant's actual shipping zones.

**Extension points:**
- Modify `SHIPPING_RATES` or fetch rates from carrier API
- Add custom line item discounts before creating session
- Store additional order metadata in Stripe session
- Add post-purchase analytics or email integration

---

## Customer Accounts

### Login & Authentication

**Routes involved:**
- `/app/routes/account_.login.tsx` — Login form
- `/app/routes/account_.logout.tsx` — Logout handler
- `/app/routes/account_.authorize.tsx` — OAuth callback (Customer Account API)

**Flow:**

1. **User clicks "Login"** → Navigate to `/account/login`
2. **Login form** (`account_.login.tsx`):
   - User enters email and password
   - Form POST to same route
   - Route handler calls Customer Account API `customerUserAccountCreate()` mutation
   - On success: Set session and redirect to `/account`
   - On failure: Show error message
3. **Logout:**
   - User clicks "Logout" → POST to `/account/logout`
   - Route handler clears session and redirects to home

**Key files:**
- `/app/routes/account_.login.tsx` — Login page and form handler
- `/app/routes/account_.logout.tsx` — Logout handler
- `/app/lib/session.ts` — Session management (encryption, parsing, serialization)
- `/app/routes/account.tsx` — Account layout (requires auth, redirects if not logged in)

### Account Dashboard

**Routes involved:**
- `/app/routes/account._index.tsx` — Dashboard (redirect to profile or orders)
- `/app/routes/account.profile.tsx` — User profile and settings
- `/app/routes/account.orders._index.tsx` — Order history list
- `/app/routes/account.orders.$id.tsx` — Single order details

**Flow:**

1. **User navigates to `/account`:**
   - Loader checks session for customer token
   - If not authenticated, redirect to `/account/login`
   - If authenticated, fetch customer data from Customer Account API or Admin API
2. **Profile page** (`account.profile.tsx`):
   - Display customer name, email, phone
   - Form to update profile info
   - POST to same route to save changes
3. **Orders page** (`account.orders._index.tsx`):
   - Query order history from Admin API (if private token available) or Storefront API
   - Show paginated list of orders with status, total, date
   - Each order is a link to `/account/orders/:orderId`
4. **Order detail** (`account.orders.$id.tsx`):
   - Fetch order details from Admin API
   - Show line items, shipping address, tracking info

**Key files:**
- `/app/routes/account.*.tsx` — All account pages
- `/app/lib/session.ts` — Customer session and token storage
- `/app/graphql/customer-account/` — Customer Account API queries

### Address Management

**Routes involved:** `/app/routes/account.addresses.tsx`

**Flow:**

1. **User navigates to `/account/addresses`:**
   - Loader queries Customer Account API for saved addresses
2. **List saved addresses:**
   - Show address cards with edit/delete buttons
   - "Add new address" button
3. **User clicks "Add" or "Edit":**
   - Modal or page shows address form
   - Submit POST to same route
   - Updates Customer Account API
   - List refreshes

**Key files:**
- `/app/routes/account.addresses.tsx` — Address list and form
- `/app/components/Modal.tsx` — Modal overlay for forms

---

## Search Workflows

### Traditional Search

**Routes involved:** `/app/routes/search.tsx`

**Data flow:**

1. **User enters search term** in `SearchForm.tsx`
   - Form submits GET request to `/search?q=keyboards`
2. **Loader:**
   - Parses `q` query param
   - Calls Storefront API `search` query with term
   - Returns products, articles, pages matching query
   - Pagination via cursors
3. **Component:**
   - Renders `SearchResults.tsx` wrapper
   - Tabs or sections for Products, Articles, Pages
   - Paginated results with "Load more" button

**Key files:**
- `/app/routes/search.tsx` — Search loader and component
- `/app/components/SearchForm.tsx` — Search input form
- `/app/components/SearchResults.tsx` — Results layout and compound components

**Extension points:**
- Customize search query fragments to return additional fields
- Add filters (price, date, category) to search query
- Implement faceted search results

### Predictive Search

**Routes involved:** `/app/routes/search.tsx` (same as traditional, but with different fetcher)

**Data flow:**

1. **User types in search input** (`SearchFormPredictive.tsx`)
   - On each keystroke, form sends `GET /search?q=term&limit=5`
   - **No page navigation** — results appear in aside drawer
2. **Loader:**
   - Calls Storefront API `predictiveSearch` query
   - Returns products, articles, pages, collections, AND suggested queries
   - Limited to `limit` results (default 5)
3. **Component:**
   - Renders `SearchResultsPredictive.tsx` in aside drawer
   - Shows first 5 results per type (product, article, etc.)
   - Shows suggested queries at bottom
4. **User interaction:**
   - Click result → Navigate to that page
   - Click suggested query → Search with that term
   - Click "Search all results" → Navigate to full search results

**Key files:**
- `/app/routes/search.tsx` — Same search route (handles both traditional and predictive)
- `/app/components/SearchFormPredictive.tsx` — Predictive search input
- `/app/components/SearchResultsPredictive.tsx` — Results drawer with suggestions

**Configuration:**
- Change `limit` in form submission to adjust result count
- Modify result type fragments to customize what's returned

---

## Content Pages

### Static Pages

**Routes involved:** `/app/routes/pages.$handle.tsx`

1. **User navigates to `/pages/about`**
2. **Loader:**
   - Query Storefront API for page by handle
   - Fetch page title, body (HTML)
3. **Component:**
   - Render page title and HTML content
   - Add to breadcrumb navigation

**Key files:**
- `/app/routes/pages.$handle.tsx` — Single page loader and component

### Blog Articles

**Routes involved:**
- `/app/routes/blogs._index.tsx` — All blogs list
- `/app/routes/blogs.$blogHandle._index.tsx` — Single blog articles list
- `/app/routes/blogs.$blogHandle.$articleHandle.tsx` — Single article

**Flow:**

1. **Blogs index:** Show all blog titles with article count
2. **Blog detail:** Show articles in blog with pagination
3. **Article detail:** Show article title, author, date, body HTML

**Key files:**
- `/app/routes/blogs.*.tsx` — Blog routes
- Fragment queries in Storefront API for blog/article data

---

## Site Infrastructure

### SEO & Metadata

**Key files:**
- `/app/root.tsx` — Root meta function exports default page title
- Individual route files — Each exports `meta` function for page-specific title/description

**Pattern:**
```typescript
export const meta: Route.MetaFunction = ({data}) => [
  {title: `Products | ${data.product.title}`},
  {name: 'description', content: `Buy ${data.product.title} ...`},
];
```

### Robots & Sitemaps

**Routes involved:**
- `/app/routes/[robots.txt].tsx` — Dynamic robots.txt generation
- `/app/routes/[sitemap.xml].tsx` — Sitemap index
- `/app/routes/sitemap.$type.$page[.xml].tsx` — Paginated sitemaps (products, collections, pages)

### Region Selection

**Component:** `/app/components/RegionSelector.tsx`

- Shows country/currency selector dropdown
- User can change storefront locale
- Updates cart and pricing context

---

## Key Integration Patterns

### Fetching Data in Loaders

```typescript
export async function loader({context, params}: Route.LoaderArgs) {
  // Critical data: await before returning
  const {product} = await context.storefront.query(QUERY, {variables});
  
  // Deferred data: use defer() to fetch after initial render
  const recommendations = defer(
    context.storefront.query(RECOMMEND_QUERY, {variables})
  );
  
  return {product, recommendations};
}
```

### Using Data in Components

```typescript
export default function ProductPage() {
  const {product, recommendations} = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{product.title}</h1>
      <Suspense fallback={<Skeleton />}>
        <Await resolve={recommendations}>
          {(data) => <RecommendationGrid products={data.products} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

### Form Submissions & Actions

```typescript
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {status: 405});
  }
  
  const formData = await request.formData();
  // Process form, call APIs
  return redirect('/next-page');
}
```

---

**See Also:**
- [Architecture Overview](../architecture/overview.md) — Data flow and React Router
- [Integrations](./integrations.md) — API credentials and external services
- [Component Reference](../components/overview.md) — UI component patterns

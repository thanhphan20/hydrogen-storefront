# Testing & Quality Assurance

This section covers debugging, testing, performance profiling, and quality checks.

## Development Debugging

### Local Development Server

Start with full debugging:

```bash
pnpm dev
```

This starts:
- **Vite dev server** on `http://localhost:3000`
- **MiniOxygen** for local Oxygen simulation (edge functions)
- **GraphQL codegen** for type generation
- **HMR** (Hot Module Replacement) for instant code updates

### Server-Side Debugging

#### Console Logs

```typescript
// In route loaders or actions
export async function loader({context}: Route.LoaderArgs) {
  console.log('Cart:', context.cart);
  console.log('User agent:', request.headers.get('user-agent'));
  
  const product = await context.storefront.query(...);
  return {product};
}
```

Logs appear in the terminal running `pnpm dev`.

#### Request/Response Inspection

Check network requests in browser DevTools:

1. Open **DevTools** → **Network** tab
2. Filter by **Fetch/XHR** to see Storefront API calls
3. Click request to inspect headers, params, response

#### MiniOxygen Debugging

MiniOxygen simulates Shopify Oxygen locally. To verify it's working:

1. Check logs for `[MiniOxygen] Server listening on ...`
2. Verify `caches` object is available in loaders (if using Oxygen cache)
3. Test edge function behavior (routing, streaming, etc.)

### Client-Side Debugging

#### React DevTools

Install [React DevTools extension](https://react-devtools-tutorial.vercel.app/) for browser:

- Inspect component hierarchy
- Check props and state
- Time component renders
- Understand data flow

#### Browser DevTools

1. **Console:** Check for JavaScript errors
2. **Network:** Inspect XHR/fetch requests to APIs
3. **Performance:** Record page load and interaction performance
4. **Application:** Check cookies, localStorage, cache
5. **Elements:** Inspect HTML structure and Tailwind classes

### Environment Variable Issues

**Problem:** Feature not working, but no error
**Debug:** Check environment variables are loaded

```typescript
// In a route loader
export async function loader({context}: Route.LoaderArgs) {
  console.log('STRIPE_PUBLIC_KEY:', context.env.STRIPE_PUBLIC_KEY);
  console.log('STORE_DOMAIN:', context.env.PUBLIC_STORE_DOMAIN);
  // If undefined, variable not set
}
```

**Solution:** 
- Development: Check `.env` file exists and has correct vars
- Production: Check Vercel/Oxygen dashboard environment variables

## Type Checking

### TypeScript Validation

Run `pnpm typecheck` to catch type errors before build:

```bash
pnpm typecheck
```

Common errors:

| Error | Solution |
|-------|----------|
| `Property 'x' does not exist on type 'y'` | Check type definitions, run `pnpm codegen` if using new GraphQL fields |
| `Type 'X' is not assignable to type 'Y'` | Ensure correct data types, check API response structure |
| `Cannot find module '@/...'` | Check tsconfig.json path aliases are correct |
| `Object is possibly 'null' or 'undefined'` | Add null/undefined checks before accessing properties |

### GraphQL Codegen

Run `pnpm codegen` to generate TypeScript types from GraphQL queries:

```bash
pnpm codegen
```

This:
1. Discovers all `.graphql` files in queries and fragments
2. Generates types in `*.generated.d.ts` files
3. Exports type interfaces for use in components

**Important:** After adding new GraphQL fields, run `pnpm codegen` to update types.

## Linting & Code Quality

### ESLint

Run `pnpm lint` to check code style and catch common errors:

```bash
pnpm lint
```

Common errors and fixes:

| Error | Fix |
|-------|-----|
| `'x' is not used` | Remove unused variable or prefix with `_` |
| `Missing dependency in useEffect` | Add missing dependencies to dependency array |
| `Unexpected any type` | Explicitly type the variable |
| `Unreachable code` | Remove dead code or fix control flow |

### Prettier

Code is automatically formatted via Prettier. Run manually if needed:

```bash
# (No manual command, runs on save in most IDEs)
# Or use IDE extension
```

Configuration in `.prettierrc` (inherited from `@shopify/prettier-config`).

## Performance Testing

### Lighthouse

Test performance in browser:

1. Open DevTools → **Lighthouse** tab
2. Select **Performance** and **Accessibility**
3. Click "Analyze page load"
4. Review scores and recommendations

**Targets for this template:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90

### Performance Profiling

#### Record User Interaction

1. Open DevTools → **Performance** tab
2. Click record button
3. Interact with page (click buttons, scroll, etc.)
4. Stop recording
5. Analyze timeline to find slow operations

#### Identify Slow Loaders

```typescript
// In route loader, measure fetch time
const start = performance.now();
const product = await context.storefront.query(QUERY, {variables});
const duration = performance.now() - start;
console.log(`Query took ${duration}ms`);
```

**Targets:**
- Critical data (product, cart): <500ms
- Deferred data (recommendations): <1000ms
- Total page load: <3s (on fast 3G)

#### Check Cache Hit Rate

In Vercel logs or MiniOxygen output, check Upstash Redis cache hits:

```
[UpstashCache] HIT https://storefront.api/...
[UpstashCache] MISS https://storefront.api/...
```

High hit rate (>80%) indicates good caching strategy.

### Load Testing

For production:

1. Use [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) for automated testing
2. Use [k6](https://k6.io/) for load testing
3. Monitor Vercel or Oxygen metrics dashboard

**Key metrics to watch:**
- Time to First Byte (TTFB)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

## Building & Deployment Testing

### Local Production Build

Test the production build locally:

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

This runs production build output locally. Test:
- Page loads work
- Search and filtering work
- Cart operations work
- Checkout flow works

### Build Errors

**Common issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found: @/...` | Import path incorrect | Check tsconfig.json path aliases |
| `GraphQL codegen failed` | Invalid GraphQL syntax | Check .graphql files for syntax errors |
| `CSS build failed` | Invalid Tailwind syntax | Check tailwind.css for valid CSS |
| `Vite plugin error` | Plugin configuration issue | Check vite.config.ts for errors |

### Deployment Testing

#### Vercel Preview

1. Push code to GitHub
2. Vercel creates automatic preview deployment
3. Click preview link to test
4. Verify all features work before production merge

#### Oxygen Deployment

1. Run `pnpm build` to verify build succeeds
2. Run `shopify hydrogen preview` for local preview
3. Test in MiniOxygen environment
4. Deploy to production with `shopify hydrogen deploy`

## Common Issues & Troubleshooting

### "Shopping cart not updating"

**Symptoms:** Add to cart doesn't work, cart stays empty

**Debug:**
1. Check console for errors
2. Open DevTools → Network → check `/cart.` route request
3. Verify Storefront API token has cart scopes
4. Check session is being saved (inspect cookies)

**Solution:** Ensure `PRIVATE_STOREFRONT_API_TOKEN` has these scopes:
- `write_carts`
- `read_products`

### "Search not working"

**Symptoms:** Search returns no results or error

**Debug:**
1. Check console for GraphQL errors
2. Verify search query is valid GraphQL
3. Check Storefront API token has search scopes

**Solution:**
- Add `read_products`, `read_articles`, `read_pages` scopes to token
- Check search query syntax against Shopify API docs

### "Stripe checkout failing"

**Symptoms:** Checkout page shows error or payment form won't load

**Debug:**
1. Check Stripe SDK loaded in Network tab
2. Check `STRIPE_PUBLIC_KEY` is set in environment
3. Check browser console for Stripe errors
4. Check Stripe dashboard for any API errors

**Solution:**
- Verify Stripe keys are correct (test vs. live)
- Check Stripe account is activated
- Ensure checkout route returns valid session ID

### "Performance is slow"

**Symptoms:** Page loads take >5s, navigation is sluggish

**Debug:**
1. Run Lighthouse to identify bottleneck
2. Check Network tab for slow API calls
3. Check component render performance
4. Verify caching is working (Redis on Vercel)

**Solution:**
- Defer non-critical data (use `defer()` in loaders)
- Optimize images (use Shopify CDN)
- Add caching headers to Storefront API queries
- Use React.memo for expensive components
- Reduce bundle size (remove unused dependencies)

### "TypeScript errors after updating code"

**Symptoms:** Type errors in editor or build fails

**Debug:**
1. Run `pnpm typecheck` to see all errors
2. Run `pnpm codegen` to regenerate types
3. Check tsconfig.json for correct settings

**Solution:**
- Add explicit type annotations
- Run codegen after adding GraphQL queries
- Check that imported types match actual data shape

## Testing Infrastructure (Future)

This template currently lacks automated tests. To add:

### Unit Tests (Vitest)

```bash
# Install
pnpm add -D vitest @testing-library/react @testing-library/user-event

# Add test script to package.json
"test": "vitest"
```

Example test:

```typescript
// /app/components/__tests__/ProductPrice.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProductPrice} from '../ProductPrice';

describe('ProductPrice', () => {
  it('displays price and original price', () => {
    render(
      <ProductPrice
        price={{amount: '50', currencyCode: 'USD'}}
        compareAtPrice={{amount: '75', currencyCode: 'USD'}}
      />
    );
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });
});
```

### Integration Tests (Playwright)

```bash
# Install
pnpm add -D @playwright/test

# Add test script
"test:e2e": "playwright test"
```

Example test:

```typescript
// /tests/checkout.spec.ts
import {test, expect} from '@playwright/test';

test('complete checkout flow', async ({page}) => {
  await page.goto('/products/test-product');
  await page.click('button:has-text("Add to Cart")');
  await page.goto('/cart');
  expect(page.locator('text="1 item"')).toBeVisible();
  await page.click('text=Checkout');
  // Complete payment flow...
});
```

### Continuous Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

## Quality Checklist

Before shipping to production:

- [ ] **TypeScript:** `pnpm typecheck` passes
- [ ] **Linting:** `pnpm lint` passes
- [ ] **Build:** `pnpm build` succeeds
- [ ] **Test build:** `pnpm preview` works locally
- [ ] **Lighthouse:** Score >90 for Performance and Accessibility
- [ ] **Manual QA:**
  - [ ] Home page loads correctly
  - [ ] Product page displays and add-to-cart works
  - [ ] Search and filtering work
  - [ ] Cart operations work (add, remove, update quantity)
  - [ ] Checkout completes (use test Stripe card)
  - [ ] Account login/logout works
  - [ ] Mobile responsive (test on phone/tablet)
- [ ] **Environment:** All required vars set in Vercel/Oxygen
- [ ] **SEO:** Meta tags correct on key pages
- [ ] **Analytics:** Tracking pixels firing (if applicable)
- [ ] **Performance:** Page load <3s on fast 3G

---

**Key files:**
- `pnpm-lock.yaml` — Dependency lock file
- `tsconfig.json` — TypeScript configuration
- `eslint.config.js` — ESLint rules
- `.prettierrc` — Prettier format config
- `vite.config.ts` — Build configuration
- `.github/workflows/` — CI/CD pipeline (if set up)

**See Also:**
- [React Router Testing](https://reactrouter.com/how-to/testing)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

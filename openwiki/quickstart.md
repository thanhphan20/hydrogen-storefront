# OpenWiki Quickstart

Welcome to the Hydrogen Headless Storefront repository. This is a production-ready, modern headless Shopify storefront built with React Router 7, Hydrogen, and Tailwind CSS v4.

**Start here:** Read this page, then follow the links to the sections most relevant to your work.

## What Is This Repository?

This is a high-performance Shopify storefront template designed as the ultimate starting point for bespoke, headless commerce experiences. It combines:

- **React Router 7** (successor to Remix) for server-side rendering, streaming, and unified development
- **Hydrogen 2026.4.3** (Shopify's official toolkit) for Storefront API integration
- **Tailwind CSS v4** with modern container queries and streamlined configuration
- **Shadcn UI** components built on Radix UI primitives for accessible, customizable UI
- **Stripe Embedded Checkout** for custom payment flows replacing Shopify's default checkout
- **Edge deployment** on Vercel or Shopify Oxygen with global delivery

The template prioritizes **sub-second performance**, **developer experience**, and **accessibility** out of the box.

## Repository Overview

### Key Directories

```
/app
  ├── components/          # Reusable UI components (forms, product cards, cart, etc.)
  │   └── ui/              # Shadcn UI primitives (buttons, cards, dialogs, etc.)
  ├── routes/              # File-based React Router 7 pages
  ├── graphql/             # Storefront API queries and fragments
  ├── lib/                 # Core business logic and utilities
  ├── styles/              # Global CSS and Tailwind design tokens
  ├── helpers/             # Helper functions (typo: /ultils also exists)
  ├── layouts/             # Layout wrapper components
  ├── constants/           # Shared constants (currencies, shipping, etc.)
  ├── type/                # TypeScript type definitions
  ├── entry.server.tsx     # Server-side entry point (streaming, CSP)
  ├── entry.client.tsx     # Client-side hydration entry
  └── root.tsx             # Root layout and app entry
├── public/                # Static assets
├── server.ts              # Oxygen/Vercel request handler
├── vite.config.ts         # Build configuration
└── package.json           # Dependencies and scripts
```

## Setup and Development

### Requirements

- Node.js `^22` or `^24`
- pnpm `^9`

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (includes GraphQL codegen)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### Available Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server with auto-codegen |
| `pnpm build` | Compile for production |
| `pnpm preview` | Local production preview |
| `pnpm codegen` | Sync GraphQL types from `.graphql` files |
| `pnpm lint` | ESLint analysis |
| `pnpm typecheck` | TypeScript validation |

## Environment Configuration

See [Configuration & Integrations](./domains/integrations.md) for detailed environment setup.

Required variables include:
- `SESSION_SECRET` — Session encryption key
- `PUBLIC_STOREFRONT_API_TOKEN` — Shopify Storefront API public token
- `PRIVATE_STOREFRONT_API_TOKEN` — Shopify Storefront API private token
- `PUBLIC_STORE_DOMAIN` — Shopify store domain
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLIC_KEY` — Stripe Embedded Checkout credentials
- Customer Account API and Admin API tokens for account/order management

## Key Sections

### [Architecture & Codebase](./architecture/overview.md)

Understand the overall system design, data flow, and React Router 7 integration:
- React Router 7 file-based routing and loaders
- Hydrogen context and Storefront API integration
- Server entry point and edge deployment (Vercel/Oxygen)
- Performance optimizations (critical vs. deferred data loading)

### [Domains & Workflows](./domains/workflows.md)

Learn how major features work and where to make changes:
- **Product catalog** — Product pages, collections, filtering, search
- **Shopping cart** — Cart management via Hydrogen APIs
- **Checkout** — Stripe Embedded Checkout integration with session management
- **Customer accounts** — Login, profile, order history, address management
- **Search** — Traditional and predictive search via Storefront API
- **Blogs** — Blog post and article rendering

### [Data & Integrations](./domains/integrations.md)

Learn about data sources, APIs, and external services:
- Shopify Storefront API queries and caching
- Redis caching (Upstash) for Vercel deployments
- Stripe Embedded Checkout setup
- Customer Account API for account management
- Admin API for order lookups
- Vercel deployment and edge runtime

### [Component Reference](./components/overview.md)

UI component patterns and conventions:
- Shadcn UI components and customization
- Page layout system
- Product display components
- Cart and checkout UI
- Search form variants (traditional and predictive)

### [Testing & Quality](./testing/guide.md)

Debugging, testing, and quality assurance:
- Development debugging workflow
- Linting and TypeScript checking
- Performance profiling tips
- Future testing infrastructure guidance

## Deployment

### Vercel (Recommended)

```bash
pnpm add -g vercel
vercel
```

Vercel provides:
- Automatic edge deployment
- Environment variable management
- Built-in analytics via `@vercel/analytics`
- Support for Upstash Redis for response caching

### Shopify Oxygen

Deploy to Shopify's edge hosting using the Shopify CLI (see [integrations guide](./domains/integrations.md) for details).

## Performance Notes

The template is optimized for sub-second performance:
- **Critical data** is awaited and blocks initial render (e.g., product data, cart state)
- **Deferred data** is fetched after initial page load via React Router's `defer()` (e.g., recommendations)
- **Streaming** is enabled for progressive HTML delivery to clients
- **Caching** uses Hydrogen's cache layer (in-memory on Oxygen, Redis on Vercel)
- **Root loader revalidation** is disabled by default to avoid redundant Storefront API calls

## Key Files to Know

| File | Purpose |
|------|---------|
| `/app/root.tsx` | App entry, root loader (header, footer, global data), shouldRevalidate logic |
| `/server.ts` | Edge request handler for Oxygen/Vercel, creates Hydrogen context |
| `/app/entry.server.tsx` | Server-side React rendering, CSP headers, streaming setup |
| `/app/lib/context.ts` | Creates Hydrogen context with session, cache, Storefront client |
| `/app/lib/checkout.server.ts` | Stripe Embedded Checkout session creation and amount conversion |
| `/app/lib/redis-cache.ts` | Upstash Redis cache adapter for Vercel |
| `/app/routes/*.tsx` | Page components and loaders (product, collection, checkout, etc.) |

## Common Tasks

### Add a New Page

1. Create `/app/routes/mypage.tsx` (React Router 7 file-based routing)
2. Export `loader` function for data fetching and `default` component for UI
3. Use `useLoaderData()` hook to access data in the component
4. Run `pnpm dev` (routing updates automatically)

### Query Shopify Data

1. Write a GraphQL query in `/app/routes/*.tsx` or `/app/lib/*.ts`
2. Use `context.storefront.query()` to execute the query
3. Run `pnpm codegen` to auto-generate TypeScript types
4. Access strongly-typed results in your component

### Modify Checkout Flow

1. Edit `/app/routes/checkout.tsx` or `/app/routes/checkout.*.tsx` route
2. For Stripe Embedded Checkout logic, see `/app/lib/checkout.server.ts`
3. Restart dev server if you modify environment variables

### Update Styling

1. Edit `/app/styles/app.css` for global CSS
2. Edit `/app/styles/tailwind.css` for Tailwind v4 configuration
3. Use Tailwind utility classes in components
4. HMR applies changes instantly during development

## External Documentation

- [React Router Docs](https://reactrouter.com/) — Routing, loaders, actions, data flow
- [Hydrogen Docs](https://shopify.dev/custom-storefronts/hydrogen) — Shopify's toolkit reference
- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront) — GraphQL query reference
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta) — CSS framework
- [Shadcn UI](https://ui.shadcn.com/) — Component library
- [Stripe Embedded Checkout](https://stripe.com/docs/checkout/embedded/quickstart) — Payment setup

## Need Help?

- **Architecture questions?** See [Architecture Overview](./architecture/overview.md)
- **How do I implement X feature?** See [Workflows](./domains/workflows.md)
- **Where is the code for Y?** See [Component Reference](./components/overview.md)
- **How do I deploy?** See [Integrations](./domains/integrations.md)
- **Something broken?** See [Testing & Debugging](./testing/guide.md)

---

**Last updated:** See `.last-update.json` in the openwiki directory.

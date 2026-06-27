# Hydrogen Headless Storefront — Agent Guide

**This project is a Shopify headless storefront built with React Router 7 (NOT Remix).**

## Critical Rules

1. **IMPORT `react-router` NOT `@remix-run`** — This is React Router 7, the successor to Remix. Never use `@remix-run/*` imports (e.g., use `react-router`'s `json`, `redirect`, `useLoaderData`, `Link`).

2. **Hydrogen 2026.4.2 SDK** — Use `@shopify/hydrogen` for Storefront API context, cart, session, and Hydrogen-specific utilities. The context is created via `createHydrogenContext()` in `app/lib/context.ts`.

3. **Tailwind CSS v4** — CSS-first engine, not v3 JIT. Use Tailwind v4 syntax (e.g., `@import "tailwindcss"`, no `@tailwind` directives). Use `tw-animate-css` for animations.

## Project Architecture

```
app/
├── components/       # Reusable components (custom + ui/ for shadcn)
├── graphql/          # GraphQL queries (fragment-query, customer-account, admin/)
├── lib/              # Core logic (context, session, cache, checkout, stripe)
├── routes/           # 35+ file-based route files
├── styles/           # Global CSS (app.css, reset.css, tailwind.css)
├── type/             # TypeScript types
├── ultils/           # Utility hooks (locale, parse, region)
├── root.tsx          # Root layout + error boundary
├── entry.server.tsx  # SSR with CSP headers
└── routes.ts         # flatRoutes() + hydrogenRoutes() config
```

## Key Conventions

| Area | Convention |
|------|-----------|
| Routing | File-based (`@react-router/fs-routes`) via `flatRoutes()` wrapped in `hydrogenRoutes()` |
| Data Loading | Loaders use `context.storefront.query()` for GraphQL |
| Streaming | `defer()` for non-critical data, `<Suspense>` boundary in component |
| Cart | Form actions with `action` param (`LinesAdd`, `LinesUpdate`, etc.) |
| Auth | Shopify Customer Account API OAuth flow |
| Styling | Tailwind v4 utility classes, clsx + tailwind-merge via `cn()` utility |
| State | URL state (searchParams) + local state + React Context (Aside) |
| Icons | lucide-react |
| Caching | Upstash Redis with SWR; falls back to NoOpCache |
| Checkout | Stripe Checkout (redirect), not Storefront API checkout |

## Context Available in Loaders/Actions

```typescript
context.storefront      // Shopify Storefront API client
context.customerAccount // Customer Account API client
context.cart            // Cart operations (create, addLines, etc.)
context.session         // Cookie-based session (get, set, commit, destroy)
context.env             // Environment variables
context.waitUntil       // Background task scheduler
```

## GraphQL Fragments

Reusable fragments in `app/lib/fragments.ts` and `app/graphql/fragment-query/`. Use these instead of inline fragments for consistency. Generate types via `pnpm codegen`.

## Common Pitfalls

- ❌ `@remix-run/react` imports — always use `react-router`
- ❌ Tailwind v3 `@apply` / `@tailwind` directives — use v4 `@import` syntax
- ❌ Direct `caches.open()` on Vercel (Web Cache API unavailable) — use Upstash Redis fallback
- ❌ Storing secrets in client code — use `context.env.PRIVATE_STOREFRONT_API_TOKEN` server-side only

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server with codegen |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript validation |
| `pnpm lint` | ESLint |
| `pnpm codegen` | Sync GraphQL types |
| `pnpm preview` | Local production preview |

---

## OpenWiki

This repository has documentation located in the /openwiki directory.

Start here:
- [OpenWiki quickstart](openwiki/quickstart.md)

OpenWiki includes repository overview, architecture notes, workflows, domain concepts, operations, integrations, testing guidance, and source maps.

When working in this repository, read the OpenWiki quickstart first, then follow its links to the relevant architecture, workflow, domain, operation, and testing notes.

## Context

The storefront (Hydrogen 2026.4.3, React Router 7, Tailwind CSS v4 CSS-first, shadcn/Radix, Geist Variable font, lucide-react, tw-animate-css, Embla) currently renders a light theme. Design tokens live in `app/styles/tailwind.css` (`:root` light values plus an unused `.dark` block — nothing applies the `.dark` class). Alongside tokens there are ~106 hardcoded light-color utilities across 17 component/route files (worst offenders: `SearchResultsPredictive.tsx` ×28, `routes/_index.tsx` ×16) and `app/styles/app.css`, whose live classes include `.checkout-shell*`, `.product*` (PDP), `.products-grid`, `.collections-grid`, `.blog-grid`, `.predictive-search*`, `.search-result*`, `.order-search-*`, `.account-logout`, `.route-error`, `.header-menu-mobile`, and a global `img { border-radius: 4px }`.

**User-set boundaries (revised scope):** this is an in-place enhancement, not a restructure. No file deletions (app.css stays), every page keeps its current layout and section structure, no new data logic, no new dependencies. In addition to the dark restyle, the store must gain the UX patterns of a complete e-commerce site: navigation aids (breadcrumbs, back links, active nav states), designed empty and loading states, and polish on three flow weak points — add-to-cart feedback, product discovery presentation, and cart-to-checkout continuity.

Verified facts that shape this design:

- Stripe theming: the installed client SDK (`@stripe/stripe-js@9.8`) offers **no** appearance option for Embedded Checkout; the server SDK (`stripe@22.3.0`) supports per-session `branding_settings` on `checkout.sessions.create` (`node_modules/stripe/esm/resources/Checkout/Sessions.d.ts:2118`). Server-side branding is the only theming lever.
- `Header.tsx` and `Footer.tsx` use inline-style `activeLinkStyle` callbacks hardcoding `color: 'grey'`/`'white'`; inline styles would override token classes, so they must become className callbacks.
- 11 `dark:` variant usages exist in `app/components/ui/*`. They are inert as long as `@custom-variant dark` remains defined and no `.dark` class is applied — both stay true in this design.

## Goals / Non-Goals

**Goals:**
- Dark-only Vercel/Geist aesthetic across every route, achieved by restyling existing components in place: pure black page, 3 gray surface levels, low-alpha white borders, monochrome palette, 8px base radius, sentence-case typography.
- Tokens as the source of truth: hardcoded light colors converted to token utilities; app.css rules updated to token values (file retained).
- Complete-store UX patterns added within existing layouts: breadcrumbs, back-to-collection links, active nav states, designed empty states (cart/search/collection), skeleton loading states.
- Flow polish using existing mechanisms: clearer add-to-cart confirmation moment in the cart aside, stronger collection toolbar/filter/sort presentation, visually continuous cart → checkout transition with secure-checkout reassurance.
- CSS-only micro-interactions respecting `prefers-reduced-motion`; Stripe Embedded Checkout themed without ever being able to break checkout.

**Non-Goals:**
- No file deletions, no page-layout redesigns, no information-architecture changes.
- No light mode, toggle, or `prefers-color-scheme` handling.
- No new data logic or backend-dependent features (no wishlist, reviews); routing/loaders/actions untouched except threading `shopName` to `createEmbeddedCheckoutSession`.
- No new dependencies; no content/logo changes; no accent color.

## Decisions

1. **Dark-only via `:root` value rewrite; leave `.dark` block and `dark:` variants inert.** The `:root` tokens get the dark values. The `.dark` block and the 11 `dark:` component usages are left untouched — they never activate because `@custom-variant dark` (class-based) stays defined and no `.dark` class is ever applied. Alternative (stripping them) rejected: violates the minimal-modification spirit and adds diff noise for zero behavior change.
2. **Token set (oklch, Geist grays on black):** `--background` 0/0/0; surfaces `--card`/`--popover` 0.145 (~#0a0a0a), `--secondary`/`--muted` 0.205 (~#171717), `--accent` 0.269 (~#262626, hover fills); text `--foreground` 0.985 (~#ededed — never pure white body text), `--muted-foreground` 0.708 (~#a1a1a1, ≈7.9:1 on black); CTA `--primary` white / `--primary-foreground` black; semantic `--destructive` oklch(0.704 0.191 22.216), new `--success` oklch(0.723 0.192 149.579); borders `--border` white/10%, new `--border-strong` white/22%, `--input` white/14%, `--ring` 0.556 gray; `--radius` 0.5rem. `@theme inline` gains `--color-success`, `--color-border-strong`, `--shadow-overlay`. Blue `--sidebar-primary` becomes gray (monochrome mandate).
3. **app.css is restyled, not removed.** Every live rule keeps its selector and layout properties; color/border/radius values are swapped to `var(--*)` tokens (e.g. `.checkout-shell`, `.product-options-item`, `.predictive-search`). Dead rules are simply left alone. Alternative (migrate to Tailwind utilities and delete) rejected by user boundary.
4. **Elevation = surface steps + borders, not shadows.** Box-shadows are nearly invisible on black; the single `--shadow-overlay` utility (hairline white ring + deep umbra) is reserved for floating layers (dialog/sheet/popover/dropdown/predictive search panel).
5. **`color-scheme: dark` on `html`** so native scrollbars, form controls, and autofill render dark; plus `<meta name="theme-color" content="#000000">` in root.
6. **Typography enforced in components:** headings `font-semibold tracking-tight` sentence case; `font-black uppercase italic tracking-[0.x]` patterns replaced where components are touched; UI text `text-sm`; eyebrows/captions muted with no letter-spacing. Header/Footer `activeLinkStyle` inline styles become className callbacks — this doubles as the "active nav state" navigation aid.
7. **UX patterns implemented with existing data only.** Breadcrumbs on PDP/collection derive from data already in loaders (collection handle/title, product title). Empty states are pure JSX branches on already-present empty conditions (empty cart, zero search results, empty collection). Loading states use the existing `ui/skeleton` primitive (gains shimmer) in existing Suspense/pending spots. No loader changes.
8. **Flow polish decisions:**
   - *Add-to-cart feedback*: keep the existing open-cart-aside behavior; make the confirmation moment legible — the newly added line is visually distinct briefly (CSS `animate-in` highlight), the aside header reads as confirmation, CTA hierarchy inside the aside is clear (white "Checkout" primary, ghost "Continue shopping" close).
   - *Discovery*: restyle the collection toolbar (result count, filter/sort controls from `Filter.tsx`) into a bordered, scannable row; consistent product-card meta; "Load more" as a clear outline button — all within the current grid structure.
   - *Cart-to-checkout continuity*: checkout shell shares the storefront's dark tokens and brand header, adds a lock-icon "Secure checkout" signal and a back-to-cart link; Stripe embed background matches `--card` so the handoff doesn't flash a foreign theme.
9. **Stripe theming via server-side `branding_settings` with guarded retry.** `background_color: '#0a0a0a'`, `button_color: '#ffffff'`, `border_style: 'rounded'`, `font_family: 'inter'` (closest to Geist), `display_name: shopName`. On rejection (possible account/API-version gating): log, retry once without branding — checkout must never fail on theming. Dashboard branding is the manual fallback.
10. **Motion: CSS-only.** Transitions `duration-150 ease-out` default; scroll-reveal via `animation-timeline: view()` inside `@supports` (no-op fallback); skeleton shimmer keyframe in `@theme`; keyframed motion behind `prefers-reduced-motion: no-preference`.

## Risks / Trade-offs

- [Missed hardcoded light color = glaring white patch on black] → per-phase file ownership plus final audit `grep -rnE "bg-white|text-black|text-white|bg-gray-|text-gray-|bg-\[#|text-\[#" app/` with only intentional hits (e.g. text over hero imagery) allowed to remain.
- [app.css keeps hardcoded colors that fight the tokens] → owning phases swap values to `var(--*)`; audit app.css for remaining hex/named colors at the end.
- [Leaving `dark:` variants inert relies on `@custom-variant dark` staying class-based] → guard note in tailwind.css comment; if the variant line were ever removed, variants would activate via media query for dark-OS users.
- [Radius flip 0→8px collides with global `img { border-radius: 4px }` and existing sharp-corner compositions] → update the global img rule value to match the token scale; visual check on imagery after the token phase.
- [Stripe rejects `branding_settings`] → guarded retry without branding; trade-off: an unthemed embed if gating occurs, logged for visibility.
- [Light-background product photography (mock.shop) on dark tiles] → accepted: tiles sit on `--card`, so white-background photos read as intentionally framed — the Vercel look.
- [In-place constraint limits how "Vercel" some pages can look] → accepted trade-off; consistency of tokens, typography, and states carries the aesthetic without layout changes.

## Migration Plan

Implement on the existing feature branch in phase order (tasks.md); each phase leaves the site consistent and shippable. Rollback = revert the branch/PR; no data or schema migrations. Stripe branding is per-session, so reverting code fully reverts checkout appearance.

## Open Questions

- None blocking. Stripe `branding_settings` acceptance can only be confirmed against the live test-mode account during the checkout phase (guarded retry covers rejection).

## 1. Design tokens

- [x] 1.1 Rewrite `:root` in `app/styles/tailwind.css` with the dark token set from design.md (`--radius: 0.5rem`, new `--success`/`--border-strong`); leave the `.dark` block and `@custom-variant dark` untouched (inert); replace blue `--sidebar-primary` with gray
- [x] 1.2 Add `@theme inline` mappings `--color-success`, `--color-border-strong`, `--shadow-overlay`; base layer `color-scheme: dark`, body `bg-background text-foreground antialiased`, white/20% `::selection`; add shimmer keyframe and `.reveal` utility behind `@supports (animation-timeline: view())` + `prefers-reduced-motion`
- [x] 1.3 Add `<meta name="theme-color" content="#000000">` in `app/root.tsx`; align app.css global `img` border-radius with the token scale
- [x] 1.4 Gate: site renders dark wherever token-driven; dark-OS check shows no double-dark from inert `dark:` variants; imagery radius looks right

## 2. UI primitives (in-place restyle of `app/components/ui/`)

- [x] 2.1 `button.tsx`: `rounded-md text-sm font-medium` sentence case (drop `rounded-none`/`uppercase`/`tracking-wider`); variants — default white/black + `hover:bg-primary/85`, secondary `bg-secondary hover:bg-accent`, outline `border-border-strong hover:bg-accent`, ghost `hover:bg-accent`; keep `active:translate-y-px`
- [x] 2.2 `input.tsx`: `bg-white/[0.04] border-input focus-visible:border-border-strong` + ring transition
- [x] 2.3 Floating surfaces (`dialog`, `sheet`, `popover`, `dropdown-menu`): `shadow-overlay`, `bg-popover`, ~300ms data-state animations
- [x] 2.4 Remaining primitives (`card`, `badge`, `alert`, `accordion`, `skeleton` + shimmer, `radio-group`, `label`, `carousel`): tokenize, sentence case
- [x] 2.5 Gate: primitives render Vercel-style; no `uppercase` left in `app/components/ui/`

## 3. Layout chrome + navigation aids

- [x] 3.1 `Header.tsx`: restyle in place — `bg-black/80 backdrop-blur-md border-b border-border`, sentence-case nav `text-sm text-muted-foreground hover:text-foreground`, monochrome cart badge, muted announcement bar; replace inline `activeLinkStyle` with className callback (active `text-foreground`)
- [x] 3.2 `Footer.tsx`: `border-t border-border`, muted sentence-case links, newsletter via `ui/input`, className-based active states
- [x] 3.3 `Aside.tsx`/sheets: `bg-card border-l border-border`, sentence-case titles; restyle `.header-menu-mobile` values in app.css to tokens
- [x] 3.4 Gate: cohesive dark chrome on every route incl. mobile menu; active route visibly indicated

## 4. Home page (restyle within existing sections)

- [x] 4.1 `routes/_index.tsx`: convert all 16 hardcoded colors to tokens; restyle existing hero carousel (gradient overlay for legibility, sentence-case headline `font-semibold tracking-tighter`, white primary CTA, tokenized arrows, remove grayscale filters) — keep current section structure
- [x] 4.2 Restyle new-arrivals / featured-collection / recommended section headers with `border-b border-border` rows and muted "View all →" links; ensure featured band is visible on black via `bg-card` + border within its current markup
- [x] 4.3 Add shimmer skeleton grid for the deferred recommended-products state
- [x] 4.4 Gate: home fully dark at 1280/375, no white patches, skeletons shaped like cards

## 5. Product detail page (restyle + breadcrumb)

- [x] 5.1 `products.$handle.tsx`: keep current layout; add breadcrumb (Home / collection / product) from existing loader data; sentence-case title/vendor treatment
- [x] 5.2 Restyle `.product*` values in app.css to tokens; `ProductImage.tsx` tile `rounded-xl border border-border bg-card`
- [x] 5.3 `ProductForm.tsx`: option chips `rounded-md border` (selected `border-border-strong bg-secondary`, unavailable `opacity-40 line-through`); `ProductPrice.tsx` sale = muted strikethrough compare-at; `AddToCartButton` white primary
- [x] 5.4 Gate: PDP dark and token-styled at 1280/375, breadcrumb navigates correctly

## 6. Collections + discovery presentation

- [x] 6.1 Collection routes (`collections.$handle`, `collections._index`, `collections.all`): restyle within current layouts; bordered toolbar row (result count muted + `Filter` controls tokenized); restyle `.products-grid`/`.collections-grid`/`.collection-description` values in app.css; breadcrumb/back link on collection detail
- [x] 6.2 `ProductItem.tsx`: convert 9 hardcoded colors; tile `rounded-lg border bg-card hover:border-border-strong` (replace `bg-[#F4F4F4]`), image `group-hover:scale-[1.03] duration-500`, 🟢 emoji → `ui/badge` with `bg-success` dot, restyle hover add-to-cart panel dark, sentence-case meta
- [x] 6.3 `PaginatedResourceSection.tsx`: "Load more" as centered outline button; skeletons for pending pagination; designed empty-collection state
- [x] 6.4 Gate: discovery toolbar scannable, cards consistent, empty collection designed

## 7. Cart + add-to-cart feedback

- [x] 7.1 `CartMain.tsx` + `routes/cart.tsx`: restyle within current layouts (dividers, summary panel `border bg-card` in its existing position); designed empty-cart state (icon, muted message, white "Continue shopping" CTA)
- [x] 7.2 `CartLineItem.tsx`: convert 9 hardcoded colors; bordered thumb, muted sentence-case options, tokenized quantity controls `hover:bg-accent`, remove control `hover:text-destructive`, optimistic rows `opacity-60`; CSS entrance highlight on newly added line
- [x] 7.3 `CartSummary.tsx`: discount chips `border-success/40 text-success bg-success/10`, gift cards monochrome, white full-width "Checkout" primary + ghost continue-shopping hierarchy in the aside; aside summary footer `border-t bg-card` (replace `bg-gray-50/50`)
- [x] 7.4 Gate: add-to-cart opens aside with visible confirmation moment; empty cart designed; cart page + aside fully dark

## 8. Search + empty/loading states

- [x] 8.1 `SearchResultsPredictive.tsx`: convert all 28 hardcoded colors to tokens; `SearchFormPredictive.tsx`/`SearchForm.tsx` via `ui/input`; spinner `border-black` → `border-foreground`
- [x] 8.2 `SearchResults.tsx` + `routes/search.tsx`: tokenize; restyle `.search-result*`/`.predictive-search*` values in app.css (preserve the `calc(100vh - var(--header-height) - 40px)` scroll cap); predictive panel gets `shadow-overlay`
- [x] 8.3 Designed no-results state (query echoed in foreground, muted guidance); skeletons for pending search results
- [x] 8.4 Gate: search page + predictive aside dark, scroll cap intact, empty state designed

## 9. Secondary pages (restyle within current layouts)

- [x] 9.1 Account routes (login, profile, addresses, orders ×2, layout): tokenize forms via `ui/input`/`ui/button`; restyle `.order-search-*`/`.account-logout` values in app.css
- [x] 9.2 Blog routes ×3, policies ×2, `pages.$handle.tsx`: tokenize; restyle `.blog-grid`/`.article`/`.blog-article-image` values in app.css
- [x] 9.3 `$.tsx` 404 and root `ErrorBoundary` (`.route-error`): dark, sentence-case, centered treatments within current markup
- [x] 9.4 Gate: every secondary route dark and consistent, no legacy light colors

## 10. Checkout theming + continuity

- [x] 10.1 `checkout.tsx`: restyle `.checkout-shell*` values in app.css to tokens; brand header + lock-icon "Secure checkout" row + back-to-cart link; seat Stripe embed in `rounded-xl border border-border bg-card overflow-hidden`; destructive-tinted error panel
- [x] 10.2 `app/lib/checkout.server.ts`: add `branding_settings` (`background_color '#0a0a0a'`, `button_color '#ffffff'`, `border_style 'rounded'`, `font_family 'inter'`, `display_name`); thread `shopName` from `checkout._index.tsx` loader; guarded retry without branding on rejection
- [x] 10.3 `checkout.success.tsx` / `checkout.return.tsx`: tokenize within current layouts (green check kept, halo `bg-success/20`)
- [x] 10.4 Gate: cart → checkout feels continuous; test-mode embed themed (or gracefully unthemed with logged rejection); success page dark

## 11. Motion, polish, and final audit

- [x] 11.1 Apply `.reveal` to home sections; hover audit (links `hover:text-foreground`, arrows `group-hover:translate-x-0.5`, cart badge `zoom-in` mount, in-stock dot `animate-pulse`); all keyframed motion behind `prefers-reduced-motion`
- [x] 11.2 Final audits: `grep -rnE "bg-white|text-black|text-white|bg-gray-|text-gray-|bg-\[#|text-\[#" app/` — only intentional hits remain; app.css live rules contain no hardcoded hex/named colors; `grep -rn "uppercase" app/components app/routes` clean
- [x] 11.3 Full visual QA: walk route checklist (`/`, `/collections`, `/collections/<handle>`, `/collections/all`, `/products/<handle>`, `/cart` + asides + mobile menu, `/search?q=`, `/account`, `/blogs/journal` + article, `/policies` + policy, `/pages/about`, `/checkout`, `/checkout/success`, 404) at 1280px and 375px, console clean; run `pnpm typecheck`/lint

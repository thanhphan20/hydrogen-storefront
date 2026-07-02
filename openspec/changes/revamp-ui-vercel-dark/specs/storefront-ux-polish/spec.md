## ADDED Requirements

### Requirement: Dark layout chrome (in place)
The existing header SHALL be restyled with `bg-black/80 backdrop-blur-md border-b border-border`, sentence-case nav links (`text-sm text-muted-foreground hover:text-foreground`), and a monochrome cart badge; the footer with `border-t border-border` and the same link treatment; asides (cart, search, mobile menu) as `bg-card border-l border-border` sheets. Current structure, menus, and behavior are unchanged.

#### Scenario: Chrome consistency across routes
- **WHEN** any route renders
- **THEN** header, footer, and aside chrome are dark, sentence case, and visually consistent

### Requirement: Active navigation states
Header and footer nav links SHALL indicate the active route via className-based styling (active `text-foreground`, inactive `text-muted-foreground`), replacing the inline-style `activeLinkStyle` callbacks.

#### Scenario: Active nav link
- **WHEN** the user is on a route matching a nav link
- **THEN** that link renders `text-foreground` while inactive links render `text-muted-foreground`

### Requirement: Breadcrumb and back navigation
The product detail page SHALL show a breadcrumb (Home / collection / product, `text-sm text-muted-foreground`, built from data already available in the loader) and collection pages SHALL offer a clear route back (breadcrumb or back-to-collections link). No loader changes are permitted.

#### Scenario: PDP breadcrumb
- **WHEN** the user views a product page
- **THEN** a breadcrumb renders above the product with clickable ancestors and the current product in foreground color

### Requirement: Every page restyled within its current layout
All routes — home, collections, product, cart, search, account (login, profile, addresses, orders), blog, policies, CMS pages, 404, and the root ErrorBoundary — SHALL be restyled with tokens (dark surfaces, sentence case, token borders/radius) while keeping their current layout and section structure. The ~106 hardcoded light-color utilities SHALL be converted to token utilities in place.

#### Scenario: Home page dark polish
- **WHEN** the home page loads
- **THEN** the existing hero carousel, new-arrivals, featured-collection, and recommended sections render dark and token-styled with legible text over imagery, with no white patches

#### Scenario: Secondary page consistency
- **WHEN** an account, blog, or policy page renders
- **THEN** it uses dark tokens and sentence-case headings consistent with the rest of the site

### Requirement: Designed empty states
Empty conditions SHALL render designed states instead of bare text: empty cart (icon, "Your cart is empty", white "Continue shopping" CTA), zero search results (query echoed, suggestion to adjust), and empty collection. Each uses only the empty conditions already present in the components.

#### Scenario: Empty cart
- **WHEN** the user opens the cart with no items
- **THEN** a centered dark empty state renders with a muted message and a primary continue-shopping action

#### Scenario: No search results
- **WHEN** a search returns zero results
- **THEN** a designed empty state renders echoing the query in foreground color with muted guidance text

### Requirement: Skeleton loading states
Deferred/pending UI (home recommended products, collection pagination, search results) SHALL show shimmer skeletons via the existing `ui/skeleton` primitive in the existing Suspense/pending spots, shaped to match the content they replace.

#### Scenario: Home recommended products loading
- **WHEN** the recommended-products data is still streaming
- **THEN** a grid of card-shaped shimmer skeletons renders in place of the product grid

### Requirement: Add-to-cart feedback
Adding to cart SHALL produce a clear confirmation moment using the existing cart-aside-opens behavior: the newly added line is briefly visually distinct (CSS entrance highlight), and the aside presents a clear hierarchy — white primary "Checkout" CTA and a ghost continue-shopping/close action.

#### Scenario: Item added to cart
- **WHEN** the user clicks add to cart
- **THEN** the cart aside opens showing the added line visually highlighted, with checkout as the primary action

### Requirement: Product discovery presentation
Collection pages SHALL present discovery controls as a scannable bordered toolbar row — result count in muted text plus the existing filter and sort controls restyled with tokens — and pagination SHALL render "Load more" as a clear outline button. Product cards SHALL show consistent meta (sentence-case title `text-sm font-medium`, muted price, stock badge with `bg-success` dot instead of the emoji) with `hover:border-border-strong` and subtle image zoom.

#### Scenario: Collection toolbar
- **WHEN** a collection page renders
- **THEN** a bordered toolbar shows the product count and functional filter/sort controls, and the grid below uses consistent dark product cards

#### Scenario: Card hover state
- **WHEN** the user hovers a product card
- **THEN** the border strengthens and the image zooms subtly, with the existing add-to-cart affordance restyled dark

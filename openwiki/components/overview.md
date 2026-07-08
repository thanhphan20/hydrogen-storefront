# Component Reference

This section documents the UI component system, patterns, and how to extend or customize components.

## Component Organization

Components are organized into two main categories:

### 1. Shadcn UI Components (`/app/components/ui/`)

Reusable, accessibility-focused primitives built on Radix UI. These are the building blocks for custom domain components.

| Component | Purpose | From Shadcn |
|-----------|---------|------------|
| `button` | Button with multiple variants | shadcn/ui |
| `card` | Container with header/footer/content | shadcn/ui |
| `dialog` | Modal dialog | shadcn/ui |
| `dropdown-menu` | Dropdown menu (desktop) | shadcn/ui |
| `sheet` | Slide-out drawer/sheet (mobile) | shadcn/ui |
| `input` | Text input field | shadcn/ui |
| `label` | Form label | shadcn/ui |
| `badge` | Small label/tag | shadcn/ui |
| `alert` | Alert box with variants | shadcn/ui |
| `accordion` | Collapsible accordion | shadcn/ui |
| `carousel` | Image carousel (Embla-based) | shadcn/ui |
| `popover` | Popover menu | shadcn/ui |
| `radio-group` | Radio button group | shadcn/ui |
| `skeleton` | Loading placeholder | shadcn/ui |

### 2. Domain Components (`/app/components/`)

Custom components for specific features (product, cart, search, etc.).

## Common Patterns

### Using Shadcn UI

All Shadcn components are imported and can be customized:

```typescript
import {Button} from '~/components/ui/button';

export function MyComponent() {
  return (
    <Button variant="outline" size="lg">
      Click me
    </Button>
  );
}
```

**Customization:** Edit files in `/app/components/ui/` to adjust colors, spacing, or behavior. Changes apply to all uses of that component.

### Form Patterns

```typescript
import {useState} from 'react';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';

export function LoginForm() {
  const [email, setEmail] = useState('');
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Submit form via fetch or action
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit">Sign In</Button>
    </form>
  );
}
```

## Domain Components

### Product Display

#### ProductItem

Displays a single product in a grid (used in collections, search results, recommendations).

**Props:**
```typescript
interface ProductItemProps {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}
```

**Features:**
- Product image (lazy-loaded)
- Title and vendor
- Price and "Add to Cart" button
- Links to product page

**Location:** `/app/components/ProductItem.tsx`

**Usage:**
```typescript
import {ProductItem} from '~/components/ProductItem';

export function ProductGrid({products}) {
  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} loading="lazy" />
      ))}
    </div>
  );
}
```

#### ProductPrice

Displays product pricing (current price, original price, badge).

**Props:**
```typescript
interface ProductPriceProps {
  price?: PriceType;
  compareAtPrice?: PriceType;
  variant?: 'default' | 'large';
}
```

**Features:**
- Current price
- Crossed-out original price if discounted
- Currency formatting

**Location:** `/app/components/ProductPrice.tsx`

#### ProductImage

Responsive product image with alt text and sizing.

**Props:**
```typescript
interface ProductImageProps {
  image?: ImageType;
  loading?: 'eager' | 'lazy';
  alt?: string;
}
```

**Location:** `/app/components/ProductImage.tsx`

#### ProductForm

Option selection and add-to-cart form for product pages.

**Props:**
```typescript
interface ProductFormProps {
  product: ProductFragment;
  selectedVariant?: VariantType;
  onVariantSelect?: (variant: VariantType) => void;
}
```

**Features:**
- Option dropdowns (size, color, etc.)
- Variant preview (image changes when options change)
- Add to cart button with loading state
- Out of stock handling

**Location:** `/app/components/ProductForm.tsx`

**Customization:**
- Modify option UI (use radios instead of dropdowns)
- Change "Add to Cart" button label or behavior
- Add quantity selector

### Cart & Checkout

#### CartMain

Main cart layout showing line items and summary.

**Location:** `/app/components/CartMain.tsx`

**Features:**
- List of cart line items
- "Continue Shopping" link
- "Checkout" button
- Empty cart message

**Customization:**
- Add "Save for Later" functionality
- Show product recommendations
- Add promo code input

#### CartLineItem

Single line item in cart (product image, title, quantity controls, remove button).

**Props:**
```typescript
interface CartLineItemProps {
  line: CartLineType;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
}
```

**Location:** `/app/components/CartLineItem.tsx`

**Features:**
- Product image and title
- Variant options display
- Quantity +/- buttons
- Remove button
- Line total

#### CartSummary

Displays cart totals (subtotal, tax, shipping, discount, total).

**Props:**
```typescript
interface CartSummaryProps {
  cart: CartType;
  cost?: CostType;
  onCheckout?: () => void;
}
```

**Location:** `/app/components/CartSummary.tsx`

**Features:**
- Subtotal
- Estimated tax
- Shipping estimate
- Discount/promo code line
- Final total
- "Checkout" button

**Customization:**
- Add order summary breakdown
- Show shipping options selection
- Add gift message input

#### StripeEmbeddedCheckout

Renders Stripe Embedded Checkout iframe.

**Props:**
```typescript
interface StripeEmbeddedCheckoutProps {
  clientSecret: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}
```

**Location:** `/app/components/StripeEmbeddedCheckout.tsx`

**Features:**
- Loads Stripe.js SDK
- Renders payment form in iframe
- Handles payment completion

### Search

#### SearchForm

Traditional search input form that submits to `/search` route.

**Features:**
- Text input with search icon
- Submit button or auto-submit on enter
- Form validation

**Location:** `/app/components/SearchForm.tsx`

#### SearchFormPredictive

Real-time search input that shows predictive results in aside drawer.

**Features:**
- Debounced search on keystroke
- Aside drawer for results
- Escape key to close drawer
- Click outside to close

**Location:** `/app/components/SearchFormPredictive.tsx`

**Customization:**
- Change debounce delay
- Modify result limit
- Update result types (products, collections, etc.)

#### SearchResults

Container and compound components for traditional search results.

**Pattern:**
```typescript
import {SearchResults} from '~/components/SearchResults';

export function MySearchPage({results}) {
  return (
    <SearchResults>
      <SearchResults.Products products={results.products} />
      <SearchResults.Articles articles={results.articles} />
    </SearchResults>
  );
}
```

**Location:** `/app/components/SearchResults.tsx`

#### SearchResultsPredictive

Results drawer component for predictive search.

**Features:**
- Organized sections (products, collections, articles, queries)
- Click to navigate or search
- Show loading state while typing

**Location:** `/app/components/SearchResultsPredictive.tsx`

### Navigation & Layout

#### Header

Top navigation bar with:
- Store logo/name link
- Search form (predictive or traditional)
- Account menu (login, account, logout)
- Cart icon with item count
- Mobile menu (hamburger)

**Location:** `/app/components/Header.tsx`

**Customization:**
- Change logo and branding
- Modify navigation menu items
- Add announcement banner
- Change mobile breakpoint

#### Footer

Bottom footer with:
- Copyright and links
- Policy links (privacy, terms, etc.)
- Newsletter signup (optional)
- Social media links

**Location:** `/app/components/Footer.tsx`

**Customization:**
- Add company info
- Change link structure
- Add payment method badges

#### PageLayout

Main layout wrapper for pages (header, content, footer, aside).

**Props:**
```typescript
interface PageLayoutProps {
  children: React.ReactNode;
  aside?: React.ReactNode;  // For filters, mobile menu, etc.
}
```

**Location:** `/app/components/PageLayout.tsx`

**Features:**
- Sticky header
- Main content area
- Optional aside panel (used for search drawer, mobile nav)
- Footer

#### Aside

Slide-out drawer for mobile navigation, search, filters, etc.

**Props:**
```typescript
interface AsideProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

**Location:** `/app/components/Aside.tsx`

**Features:**
- Overlay background (click to close)
- Slide-in animation
- Close button
- Keyboard escape to close

### Product Filtering

#### Filter

Faceted filter UI for product filtering (vendor, price range, availability).

**Props:**
```typescript
interface FilterProps {
  filters: FilterType[];
  onFilterChange?: (filters: FilterType[]) => void;
}
```

**Location:** `/app/components/Filter.tsx`

**Features:**
- Checkbox filters (vendor, collections, etc.)
- Price range slider
- Availability toggle
- Sort by dropdown
- Apply/Reset buttons

**Customization:**
- Add color swatches
- Add size guides
- Change price slider range
- Add custom filter types

### Gallery & Carousels

#### Carousel

Image carousel using Embla (mobile-friendly, touch-enabled).

**Props:**
```typescript
interface CarouselProps {
  items: CarouselItemType[];
  autoPlay?: boolean;
  onSlideChange?: (index: number) => void;
}
```

**Location:** `/app/components/Carousel.tsx`

**Features:**
- Touch and keyboard navigation
- Dot indicators
- Auto-play (optional)
- Responsive sizing

#### Hotspot

Clickable hotspots on product image (for image-based product discovery).

**Props:**
```typescript
interface HotspotProps {
  image: ImageType;
  hotspots: HotspotType[];
  onHotspotClick?: (hotspot: HotspotType) => void;
}
```

**Location:** `/app/components/Hotspot.tsx`

### Utility Components

#### Modal

Generic modal dialog for forms, confirmations, etc.

**Props:**
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

**Location:** `/app/components/Modal.tsx`

#### Link

Custom link component (prefetching, active state styling, external link handling).

**Props:**
```typescript
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  prefetch?: 'intent' | 'render';
  className?: string;
}
```

**Location:** `/app/components/Link.tsx`

#### MockShopNotice

Displays banner warning in non-production storefronts.

**Location:** `/app/components/MockShopNotice.tsx`

#### PaginatedResourceSection

Wrapper for paginated lists (products, articles, orders) with "Load more" button.

**Props:**
```typescript
interface PaginatedResourceSectionProps {
  children: React.ReactNode;
  hasNextPage: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}
```

**Location:** `/app/components/PaginatedResourceSection.tsx`

#### RegionSelector

Country/currency selector dropdown.

**Location:** `/app/components/RegionSelector.tsx`

#### AddToCartButton

Simple "Add to Cart" button (used on product cards).

**Location:** `/app/components/AddToCartButton.tsx`

---

## Styling & Customization

### Tailwind CSS v4

All components use Tailwind utility classes. Customize by:

1. **Global CSS:** Edit `/app/styles/app.css`
2. **Tailwind config:** Edit `/app/styles/tailwind.css`
3. **Component files:** Edit component files directly (e.g., `/app/components/ui/button.tsx`)

### Shadcn UI Customization

1. **Copy component** from shadcn registry
2. **Customize colors and spacing** in the component file
3. **Commit to repo** (shadcn components should be version-controlled)
4. **Update imports** in other files if needed

### Color Scheme

Default colors defined in `/app/styles/tailwind.css` (Tailwind v4 CSS custom properties):

```css
@theme {
  --color-primary: #000;
  --color-secondary: #666;
  --color-accent: #f00;
}
```

Change by editing CSS variables.

---

## Component Patterns

### Compound Components

Pattern used for SearchResults, Carousel, etc.:

```typescript
export function SearchResults({children}) {
  return <div>{children}</div>;
}

SearchResults.Products = function({products}) {
  return <div>{/* render products */}</div>;
};

SearchResults.Articles = function({articles}) {
  return <div>{/* render articles */}</div>;
};
```

Usage:
```typescript
<SearchResults>
  <SearchResults.Products products={data} />
  <SearchResults.Articles articles={data} />
</SearchResults>
```

### Render Props

Pattern used in some components for flexibility:

```typescript
interface CarouselProps {
  items: Item[];
  render: (item: Item, index: number) => React.ReactNode;
}

export function Carousel({items, render}) {
  return <div>{items.map((item, i) => render(item, i))}</div>;
}
```

### Error Boundaries

For critical UI sections, use React error boundary:

```typescript
import {Suspense} from 'react';

export function ProductGrid({products}) {
  return (
    <Suspense fallback={<Skeleton />}>
      <ErrorBoundary fallback={<ErrorMessage />}>
        <Grid products={products} />
      </ErrorBoundary>
    </Suspense>
  );
}
```

---

## Accessibility

All Shadcn UI components follow WCAG 2.1 AA standards:

- **Keyboard navigation:** Tab, Enter, Space, Escape work as expected
- **ARIA labels:** All interactive elements have proper ARIA labels
- **Color contrast:** Text meets 4.5:1 contrast ratio
- **Screen readers:** Form labels associated with inputs

**When building custom components:**
- Use semantic HTML (`<button>`, `<label>`, `<nav>`, etc.)
- Add `aria-label` or `aria-labelledby` for unlabeled elements
- Test with keyboard navigation
- Use browser DevTools accessibility tab

---

**Key files:**
- `/app/components/` — Domain components
- `/app/components/ui/` — Shadcn UI components
- `/app/styles/tailwind.css` — Tailwind config
- `/app/styles/app.css` — Global styles

**See Also:**
- [Shadcn UI Docs](https://ui.shadcn.com/)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)

## ADDED Requirements

### Requirement: Dark-only design tokens
The design system SHALL define the dark theme by rewriting `:root` in `app/styles/tailwind.css` with: pure black `--background`; three surface levels (`--card`/`--popover` ~oklch 0.145, `--secondary`/`--muted` ~0.205, `--accent` ~0.269); foreground hierarchy (`--foreground` ~0.985, `--muted-foreground` ~0.708); white-on-black CTA (`--primary` white, `--primary-foreground` black); semantic `--destructive` and new `--success`; low-alpha white borders (`--border` 10%, new `--border-strong` 22%, `--input` 14%); gray `--ring`; and `--radius: 0.5rem`. The unused `.dark` block and existing `dark:` component variants MAY remain but MUST stay inert (class-based `@custom-variant dark` retained, `.dark` class never applied).

#### Scenario: Site renders dark from tokens alone
- **WHEN** any route renders with no component-level color overrides
- **THEN** the page background is pure black, text uses the foreground hierarchy, and borders are low-alpha white

#### Scenario: Inert dark variants
- **WHEN** the site is viewed on a device with OS dark mode enabled
- **THEN** `dark:` utility classes in components have no effect (no double-dark styling)

### Requirement: Monochrome palette
The UI SHALL use no accent or brand color. Chromatic color MUST appear only in product photography and semantic states (destructive red, success green). The blue `--sidebar-primary` token SHALL be replaced with a gray value.

#### Scenario: Semantic-only color audit
- **WHEN** the final hardcoded-color audit runs (`grep -rnE "bg-white|text-black|text-white|bg-gray-|text-gray-|bg-\[#|text-\[#" app/`)
- **THEN** every remaining match is an intentional, documented exception (e.g. text over hero imagery), and no blue/pastel utility classes remain

### Requirement: Native UI renders dark
The base layer SHALL set `color-scheme: dark` on `html` so scrollbars, form controls, and autofill render dark; body defaults SHALL be `bg-background text-foreground antialiased` with a white/20% `::selection`; and `app/root.tsx` SHALL declare `<meta name="theme-color" content="#000000">`.

#### Scenario: Native scrollbar check
- **WHEN** a page overflows vertically in a Chromium browser
- **THEN** the scrollbar renders in dark colors, not white

### Requirement: Elevation via surfaces and borders
Elevation SHALL be expressed through surface-color steps and borders, not shadow scales. A single `--shadow-overlay` utility (hairline white ring + deep umbra) SHALL be applied only to floating layers: dialog, sheet, popover, dropdown menu, and predictive search panel.

#### Scenario: Floating layer treatment
- **WHEN** a dropdown menu or dialog opens
- **THEN** it renders on a surface-1 background with `shadow-overlay`, visually separated from the black page

### Requirement: Sentence-case Geist typography
UI text in updated components SHALL be sentence case: headings `font-semibold tracking-tight`; UI text `text-sm`; captions and eyebrows `text-muted-foreground` with no added letter-spacing. `uppercase`, display `italic`, and `tracking-[0.x]` patterns SHALL be replaced in every component touched by the revamp.

#### Scenario: Heading treatment
- **WHEN** a page title renders after the revamp
- **THEN** it is sentence case, `font-semibold tracking-tight`, not uppercase/italic/letter-spaced

### Requirement: Restyled shadcn primitives (in place)
All 14 primitives in `app/components/ui/` SHALL be updated in place to derive styling from tokens: buttons `rounded-md text-sm font-medium` with variants default (white/black, `hover:bg-primary/85`), secondary (`bg-secondary hover:bg-accent`), outline (`border-border-strong hover:bg-accent`), ghost (`hover:bg-accent`); inputs `bg-white/[0.04] border-input focus-visible:border-border-strong`; skeletons use a shimmer animation. No primitive file is deleted or replaced.

#### Scenario: Button variant rendering
- **WHEN** a default-variant button renders
- **THEN** it is a white, 6px-rounded, sentence-case button with black text that dims toward `primary/85` on hover

### Requirement: app.css restyled in place
`app/styles/app.css` SHALL be retained. Live rules SHALL keep their selectors and layout properties while color, border, and radius values are swapped to `var(--*)` tokens (including the global `img` border-radius aligning to the token scale). Hardcoded hex/named colors SHALL NOT remain in live rules.

#### Scenario: Legacy-styled component on dark
- **WHEN** a component styled by app.css (e.g. predictive search panel, checkout shell, PDP grid) renders
- **THEN** it appears fully dark-themed with token-driven colors, with its layout behavior unchanged

### Requirement: CSS-only motion primitives
The design system SHALL provide motion without new dependencies: default transitions `duration-150 ease-out`; a `.reveal` scroll-reveal utility implemented with `animation-timeline: view()` inside `@supports (animation-timeline: view())`; a skeleton shimmer keyframe. All keyframed motion MUST be gated behind `prefers-reduced-motion: no-preference`.

#### Scenario: Reduced motion respected
- **WHEN** the OS has reduced motion enabled
- **THEN** scroll-reveal, shimmer, and other keyframed animations do not play, and content is fully visible

#### Scenario: Scroll-reveal fallback
- **WHEN** a browser without `animation-timeline: view()` support loads the home page
- **THEN** all sections render fully visible with no JavaScript fallback required

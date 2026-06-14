---
name: responsive-design
description: Implement modern responsive layouts using container queries, fluid typography, CSS Grid, and mobile-first breakpoint strategies. Use when building adaptive interfaces, implementing fluid layouts, or creating component-level responsive behavior.
---

# Responsive Design

Master modern responsive design to build interfaces that adapt seamlessly across screen sizes and device contexts.

This project is the **Kashmir Tyre House** enquiry platform: Next.js App Router, React 19, **Tailwind CSS v4**, `next/image`, mobile-first. The patterns below are tuned to that stack — read the "Project Conventions" section first, it overrides any generic advice that conflicts with it.

## When to Use This Skill

- Implementing mobile-first responsive layouts
- Using container queries for component-based responsiveness (product cards, enquiry panels)
- Creating fluid typography and spacing scales
- Building layouts with CSS Grid and Flexbox
- Designing a breakpoint strategy
- Implementing responsive images and media with `next/image`
- Building adaptive navigation (the site header already does this)
- Building responsive tables and data displays (admin tables)

## Project Conventions (read first)

1. **Tailwind v4 — no plugins needed.** Container queries (`@container`, `@sm:`, `@md:`, `@lg:`) and the fluid `clamp()`-friendly utilities ship in core. Do **not** add `@tailwindcss/container-queries`.
2. **Mobile-first, always.** Base styles target the smallest screen; layer up with `sm:` / `md:` / `lg:` / `xl:`. This matches the existing landing page, header, and gallery work.
3. **Radius scale is customized.** `--radius-md` is `0.75rem` (12px), so `rounded-md` ≠ 6px here. The codebase prefers **explicit** `rounded-[Npx]` (e.g. `rounded-[12px]`, `rounded-[20px]`) for clarity — follow that rather than the named scale when matching surrounding code.
4. **Images go through `next/image`.** Use the `fill` + `sizes` pattern already in the codebase (see [product-card.tsx](apps/web/components/product-card.tsx)). Do **not** hand-roll `<img srcset>` / `<picture>` for product or about images.
5. **Use `dvh`/`svh` for full-height sections** on mobile, never bare `vh` (avoids the mobile browser-chrome jump).
6. **Touch targets ≥ 44×44px** on mobile; the existing hamburger/menu buttons follow this.
7. **No layout shift.** Reserve space for images (`aspect-ratio` / fixed box) and skeletons — a performance rule for this project.

## Modern Breakpoint Scale

Tailwind defaults, mobile-first:

```
sm:  @media (min-width: 640px)   /* landscape phones, small tablets */
md:  @media (min-width: 768px)   /* tablets */
lg:  @media (min-width: 1024px)  /* laptops, small desktops */
xl:  @media (min-width: 1280px)  /* desktops */
2xl: @media (min-width: 1536px)  /* large desktops */
```

Set breakpoints based on **content** (where the layout actually breaks), not specific devices.

## Pattern 1: Container Queries (Tailwind v4)

Use for component-level responsiveness — a product card should adapt to the space it's dropped into, not the viewport. No plugin required in v4.

```tsx
// Mark the wrapper as a container, then query it with @ variants
function ResponsiveCard({ title, image, description }: CardProps) {
  return (
    <div className="@container">
      <article className="flex flex-col @md:flex-row @md:gap-4">
        <div className="relative w-full @md:w-48 @lg:w-64 aspect-video @md:aspect-square shrink-0">
          <Image src={image} alt="" fill sizes="(min-width: 768px) 16rem, 100vw" className="object-cover" />
        </div>
        <div className="p-4 @md:p-0">
          <h2 className="text-lg @md:text-xl @lg:text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-[#8b7a6c] @md:line-clamp-3">{description}</p>
        </div>
      </article>
    </div>
  );
}
```

Raw CSS equivalent (only when Tailwind can't express it):

```css
.card-wrap { container-type: inline-size; container-name: card; }

@container card (min-width: 400px) {
  .card { display: grid; grid-template-columns: 200px 1fr; gap: 1rem; }
}

/* Container query units: 5% of container width, clamped 1rem–2rem */
.card-title { font-size: clamp(1rem, 5cqi, 2rem); }
```

## Pattern 2: Fluid Typography & Spacing

Use `clamp(min, preferred, max)` so type and spacing scale smoothly between breakpoints instead of jumping. Define tokens in the Tailwind v4 `@theme` block in the global stylesheet, then reference them.

```css
@theme {
  --text-fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-fluid-xl:   clamp(1.25rem, 1rem + 1.25vw, 1.5rem);
  --text-fluid-3xl:  clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
  --text-fluid-4xl:  clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem);

  --space-fluid-md:  clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-fluid-lg:  clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
}
```

```tsx
// Inline clamp for one-off hero headings (matches the codebase's bracket style)
<h1 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.03em]">…</h1>
```

Helper for generating fluid values (min/max in rem, viewport in px):

```ts
function fluid(minRem: number, maxRem: number, minVw = 320, maxVw = 1280) {
  const slope = (maxRem - minRem) / (maxVw - minVw);
  const intercept = -minVw * slope + minRem;
  return `clamp(${minRem}rem, ${intercept.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxRem}rem)`;
}
```

## Pattern 3: CSS Grid Responsive Layouts

```tsx
// Product grid — fixed responsive columns (predictable, what this project uses)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {products.map((p) => <ProductCard key={p.id} product={p} />)}
</div>
```

```css
/* Auto-fit grid — items wrap on their own; great for unknown counts.
   The min(..., 100%) guard stops overflow on very narrow screens. */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
}
```

```css
/* Named-area page layout that re-flows by breakpoint */
.page { display: grid; gap: 1rem; grid-template-areas: "header" "main" "sidebar" "footer"; }
@media (min-width: 768px) {
  .page { grid-template-columns: 1fr 300px;
          grid-template-areas: "header header" "main sidebar" "footer footer"; }
}
```

## Pattern 4: Responsive Navigation

The [site-header.tsx](apps/web/components/site-header.tsx) already implements this — hamburger on mobile, horizontal on desktop, with the Tyres dropdown portaled to escape the glass `filter` context. When extending it:

```tsx
<ul className={cn(
  "absolute top-full inset-x-0 flex flex-col border-b bg-background",
  isOpen ? "flex" : "hidden",
  // Desktop: always visible, horizontal, no chrome
  "lg:static lg:flex lg:flex-row lg:border-0 lg:bg-transparent",
)}>
```

Keep tap targets ≥ 44px (`px-4 py-3` on mobile links).

## Pattern 5: Responsive Images (use `next/image`)

```tsx
// Resolution switching is automatic — just give an accurate `sizes`.
<div className="relative aspect-square">
  <Image
    src={product.image}
    alt={`${product.brand} ${product.productName}`}
    fill
    sizes="(min-width: 1280px) 260px, (min-width: 768px) 45vw, 92vw"
    className="object-contain"
  />
</div>
```

- `priority` / `fetchPriority="high"` only for above-the-fold hero images; `loading="lazy"` (default) elsewhere.
- For art direction (genuinely different crops per breakpoint), render two `<Image>` elements toggled with `hidden`/`md:block` rather than `<picture>`.
- Always set `sizes` so the browser downloads the right resolution — wrong `sizes` is the #1 cause of oversized image payloads here.

## Pattern 6: Responsive Tables (admin)

```tsx
// Simple case: keep the table, scroll horizontally below its min width.
<div className="w-full overflow-x-auto">
  <table className="w-full min-w-[600px]">…</table>
</div>
```

```tsx
// Better mobile UX: table on desktop, stacked cards on mobile.
<table className="hidden md:table w-full">…</table>
<div className="md:hidden space-y-4">
  {rows.map((row, i) => (
    <div key={i} className="rounded-[12px] border p-4 space-y-2">
      {columns.map((c) => (
        <div key={c.key} className="flex justify-between">
          <span className="font-medium text-[#8b7a6c]">{c.label}</span>
          <span>{row[c.key]}</span>
        </div>
      ))}
    </div>
  ))}
</div>
```

For large admin datasets, paginate (a performance rule) rather than rendering everything.

## Viewport Units

```css
.hero      { min-height: 100dvh; } /* dynamic — accounts for mobile browser UI */
.min-hero  { min-height: 100svh; } /* smallest viewport */
/* Avoid bare 100vh on mobile — it overshoots and causes a jump. */
```

## Best Practices

1. **Mobile-first** — base styles for mobile, enhance upward.
2. **Content breakpoints** — break where the layout breaks, not at device widths.
3. **Fluid over fixed** — `clamp()` for type/spacing; relative units over `px` for sizing.
4. **Container queries** for reusable components that live in varied contexts.
5. **`next/image` + accurate `sizes`** for every product/about image.
6. **Touch targets ≥ 44×44px** on mobile.
7. **No layout shift** — reserve space with `aspect-ratio` / fixed boxes / skeletons.
8. **Logical properties** (`inline`/`block`, `inset-x`) where it aids future i18n.

## Common Issues

- **Horizontal overflow** — guard auto-fit grids with `minmax(min(300px, 100%), 1fr)`; watch fixed `min-w-[…]`.
- **`100vh` jump on mobile** — use `dvh`/`svh`.
- **Oversized images** — almost always a wrong/missing `sizes` prop.
- **Text too small on mobile** — use the fluid type scale.
- **Squished images** — set `aspect-ratio` and `object-contain`/`object-cover`.
- **Z-index / stacking** — overlays and portaled dropdowns (see the header glass dropdown) need explicit, sane `z` values.

## Resources

- CSS Container Queries — MDN
- Utopia Fluid Type Calculator — utopia.fyi
- Every Layout — every-layout.dev
- Tailwind v4 responsive + container query docs

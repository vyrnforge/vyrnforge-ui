# Skeleton

Skeleton is a decorative loading-placeholder primitive for pending content whose structure is already predictable enough to preserve useful spatial context.

## Use Skeleton when

Use Skeleton for structured pending content such as a known card, row, avatar-like region, or text layout when the placeholder helps preserve the eventual layout.

Do not use Skeleton as fake content, empty state, determinate progress, or the only accessible indication that work is happening. Unknown or unstructured waiting should use the appropriate async feedback pattern instead.

## Native Web

Load `@vyrnforge/web/styles/skeleton.css` and apply `data-vf-skeleton` to a consumer-owned native element.

Skeleton supports one optional visual shape:

- no shape attribute or `data-vf-skeleton-shape="block"` — general rectangular placeholder;
- `data-vf-skeleton-shape="line"` — text-line placeholder;
- `data-vf-skeleton-shape="circle"` — circular visual treatment.

Circle does **not** own square geometry. Compose `data-vf-aspect-ratio data-vf-aspect-ratio-value="square"` on the same element (and load `@vyrnforge/web/styles/layout.css`) when equal inline/block size is required.

## Loading motion

Skeleton consumes the shared loading-motion shimmer recipe from `@vyrnforge/web/styles/loading-motion.css`. The cadence and easing are shared foundation tokens rather than Skeleton-specific animation constants.

Reduced motion removes the non-essential animation while preserving the placeholder. Forced-colors retains a visible fallback.

## Composition

Skeleton owns placeholder paint, not layout or containment.

Use existing VyrnForge composition responsibilities when they describe the pending structure:

- **Stack** for vertically related placeholder regions;
- **Inline** for avatar + text-line or similar inline relationships;
- **Grid** for repeated peers/cards;
- **AspectRatio** for known square/video/landscape/portrait regions;
- **Surface** when the eventual content genuinely has a contained surface boundary.

These are normal compositions, not Skeleton inheritance. Surface and Layout remain useful without loading, and Skeleton does not turn them into loading-state components.

Exact width, height, repetition, padding, and grid-track decisions remain consumer-owned.

## Accessibility and async state

Skeleton shapes are decorative. Author `aria-hidden="true"` on each placeholder shape.

The application or higher-level pattern owns meaningful loading state. Use an appropriate surrounding `aria-busy` relationship and/or authored status message when users need that feedback. Skeleton does not provide a loading state machine, timers, progress, retry, cancellation, or hidden English labels.

## Framework boundary

React, Angular, Vue, and Elements wrappers are not required for symmetry. Framework consumers can compose the same Native Web hooks with their framework-native Surface/Layout primitives without introducing a second Skeleton semantic or visual implementation.

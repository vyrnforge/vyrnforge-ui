# Skeleton

Skeleton is a decorative loading-placeholder primitive for pending content whose structure is already predictable enough to preserve useful spatial context.

## Use Skeleton when

Use Skeleton for structured pending content such as a known card, row, avatar-like region, or text layout when the placeholder helps preserve the eventual layout.

Do not use Skeleton as fake content, empty state, determinate progress, or the only accessible indication that work is happening. Unknown or unstructured waiting should use the appropriate async feedback pattern instead.

## Native Web

Load `@vyrnforge/web/styles/skeleton.css` and apply `data-vf-skeleton` to a consumer-owned native element.

Skeleton supports one optional geometry choice:

- no shape attribute or `data-vf-skeleton-shape="block"` — general rectangular placeholder;
- `data-vf-skeleton-shape="line"` — text-line placeholder;
- `data-vf-skeleton-shape="circle"` — circular placeholder with an equal aspect ratio.

Exact width, height, layout, repetition, and composition remain consumer-owned because they describe the pending content structure rather than a Skeleton size scale.

## Accessibility and async state

Skeleton shapes are decorative. Author `aria-hidden="true"` on each placeholder shape.

The application or higher-level pattern owns meaningful loading state. Use an appropriate surrounding `aria-busy` relationship and/or authored status message when users need that feedback. Skeleton does not provide a loading state machine, timers, progress, retry, cancellation, or hidden English labels.

Reduced-motion removes the non-essential animation while preserving the placeholder. Forced-colors retains a visible fallback.

## Framework boundary

React, Angular, Vue, and Elements wrappers are not required for symmetry. Framework consumers can put the same Native Web hook on their own element and use the canonical stylesheet without introducing a second semantic or visual implementation.

# React Layout

Flow and AutoGrid are lightweight React authoring components over the canonical Web layout recipes. Shared layout rules remain in the Layout guide; public prop types belong in the API reference.

## React installation and first use

```tsx
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
```

The first checked-in example demonstrates default Flow spacing with a labeled form control. Follow React overview for shared stylesheet and SSR/hydration setup; no layout provider is required.

## Semantic layout and accessibility

Use `as="nav"` with an accessible name for navigation groups, or `as="ul"` with native `li` children for lists. The `as` prop changes the semantic host, not the shared spacing algorithm. Keep `fieldset` and `legend` for named form groups; layout does not create form relationships or manage focus.

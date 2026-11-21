# React Divider

Use the `Divider` component for visual horizontal or vertical lines. React only authors the native decorative span and orientation hook; canonical Web CSS owns its appearance.

## React setup

```tsx
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/divider.css';

<Divider />
<Divider orientation="vertical" />
```

No provider, wrapper div, CSS-in-JS system or browser runtime is needed. For a thematic break, author `<hr />` directly instead.

## React authoring

The default orientation is `horizontal`. The vertical variant stretches in a row whose height is established by content. The component forwards a native `HTMLSpanElement` ref and accepts ordinary nonsemantic span attributes such as `className`, `style`, `id` and `data-*`. Role, focusability and accessible-name overrides are intentionally not part of this decorative API. The shared stylesheet gives both variants the same light/dark border token.

## React accessibility

Divider has no keyboard or focus behavior. It is always `aria-hidden="true"`. Do not use a visual Divider when a real separator role, structural heading, or user-resizable handle is required.

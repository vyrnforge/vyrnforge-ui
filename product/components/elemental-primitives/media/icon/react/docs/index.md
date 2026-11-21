# React Icon

Use the public React `Icon` renderer with a typed `IconDefinition` from the optional glyph catalog or your own `defineIcon` result. Icon is a visual SVG primitive, not an interactive control.

## React setup

```tsx
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

<Icon icon={bookmarkIcon} label="Bookmark" />
```

The explicit `label` is appropriate only when an icon independently conveys meaning. For decorative icons inside labeled controls, omit `label` so the SVG stays hidden from assistive technology. Use the shared React overview for stylesheet delivery and SSR/hydration setup.

## React authoring

Pass an `IconDefinition` through `icon`; optional `variant`, `shape` and `size` change only the shared SVG visual treatment. Ordinary applicable SVG attributes and a ref may be passed to the SVG host, while the component owns its accessibility role, `aria-hidden`, `aria-label` and focusable state. For an icon-only action, place a decorative Icon inside a natively operable, explicitly named Button. The component itself never registers pointer or keyboard actions.

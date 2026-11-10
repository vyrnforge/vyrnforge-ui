# Icon

Icon is the genuine visual primitive inside the Layer 1 Media family.

It owns reusable SVG glyph definitions/rendering, sizing, variant/shape treatment, canonical styling, and decorative-versus-meaningful accessibility behavior. It remains non-interactive: Button, Link, or another semantic interactive owner owns interaction and the accessible name when Icon appears inside a control.

## Shared artwork contract

`IconDefinition` and `defineIcon(...)` live in `@vyrnforge/web/icon`. The definition is framework-neutral data, so one definition can be rendered by React, Angular, Vue, Elements, or another renderer implementing the Icon contract.

`@vyrnforge/icons` is the optional first-party artwork catalog. Renderer packages do **not** depend on it.

```ts
import { searchIcon } from '@vyrnforge/icons/search';
```

Consumers and VyrnForge-owned feature code can also define application/product artwork without adding it to the official catalog:

```ts
import { defineIcon } from '@vyrnforge/web/icon';

export const productMarkIcon = defineIcon({
  name: 'product-mark',
  outlined: {
    paths: [{
      d: 'M12 4 20 12 12 20 4 12 12 4Z',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.75,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }],
  },
  filled: {
    paths: [{ d: 'M12 3 21 12 12 21 3 12 12 3Z', fill: 'currentColor' }],
  },
});
```

No global registry, connector, runtime SVG parser, or network service is required.

The Media family does not create a `Media` runtime component or package.

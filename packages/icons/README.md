# @vyrnforge/icons

Official, reusable VyrnForge SVG artwork catalog.

The shared `IconDefinition` contract, `defineIcon` custom-artwork helper, and canonical Icon styling live in `@vyrnforge/web/icon`. This package contains first-party artwork only.

Prefer granular imports so applications and VyrnForge components consume only the artwork they need:

```ts
import { searchIcon } from '@vyrnforge/icons/search';
import { chevronDownIcon } from '@vyrnforge/icons/chevron-down';
```

The root package re-exports the catalog for discovery, but renderer packages do not depend on it.

## Custom icons

Applications do not need this package to use their own artwork. Define a framework-neutral icon once:

```ts
import { defineIcon } from '@vyrnforge/web/icon';

export const acmeIcon = defineIcon({
  name: 'acme',
  outlined: {
    paths: [{
      d: 'M4 12 12 4l8 8-8 8-8-8Z',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.75,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }],
  },
  filled: {
    paths: [{ d: 'M12 2.8 21.2 12 12 21.2 2.8 12 12 2.8Z', fill: 'currentColor' }],
  },
});
```

The same `acmeIcon` value can be passed to React, Angular, Vue, Elements, or another renderer implementing the shared Icon contract. No global registry, network connector, runtime SVG parser, or framework provider is required.

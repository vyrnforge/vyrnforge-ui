# @vyrnforge/ui-core

Shared VyrnForge UI foundation for native-first semantic tokens, CSS variables,
themes, density, typography, motion, layering, and small utility classes.

`@vyrnforge/ui-core` owns design foundations only. It does not own React
components, data-grid behavior, application state, adapters, or a global store.

## Package status

VyrnForge UI is in early alpha. Install through the explicit `alpha` dist-tag
while contracts continue to be evaluated. This package is not yet intended for
production use.

VyrnForge UI is source-available under the VyrnForge Source License 1.0.
Production, commercial, redistribution, republication, resale, sublicensing,
white-labeling, and competing-library use require separate written permission
or a commercial license.

## Import

```ts
import {
  normalizeVyrnForgeDensity,
  vyrnForgeLayerOrder,
  vyrnForgeSemanticTokenGroups,
} from "@vyrnforge/ui-core";

import "@vyrnforge/ui-core/styles/index.css";
```

Import `ui-core` styles before other VyrnForge package styles:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

Public package entry points use built `dist` output. They do not expose internal
`src` paths.

## Semantic token contract

The S3 contract contains nine categories:

- surfaces
- text
- borders
- interaction and focus
- status and feedback
- density and control sizing
- typography
- motion
- layers

Complete documentation lives in
`docs/architecture/08-semantic-token-contract.md` and
`docs/api/css-token-reference.md`.

## Themes

Supported themes:

- `light`
- `dark`
- `enterprise`
- `system`

Each TypeScript preset contains the complete set of theme-scoped semantic
tokens.

```ts
import {
  createVyrnForgeTheme,
  vyrnForgeEnterpriseTheme,
} from "@vyrnforge/ui-core";

const theme = createVyrnForgeTheme({
  ...vyrnForgeEnterpriseTheme,
  "--vf-interactive-primary": "#003b71",
  "--vf-focus-color": "#005ea8",
});
```

## Density

Canonical names:

- `compact`
- `balanced`
- `spacious`

Compatibility aliases:

- `standard` → `balanced`
- `comfortable` → `spacious`

```ts
normalizeVyrnForgeDensity("comfortable"); // "spacious"
```

The CSS supports both canonical and compatibility selectors.

## Typography utilities

Shared named-role utilities include:

- `vf-type-display`
- `vf-type-page-title`
- `vf-type-section-title`
- `vf-type-label`
- `vf-type-body`
- `vf-type-caption`
- `vf-type-code`
- `vf-type-numeric`

Use these for small shared presentation needs. Reusable React typography
components remain owned by `@vyrnforge/ui-components`.

## Motion and accessibility

Automatic `prefers-reduced-motion: reduce` support and explicit
`data-motion="reduced"` / `vf-motion-reduced` modes preserve state changes
while shortening non-essential animation.

Focus utilities consume the canonical focus color, width, offset, and shadow
roles.

## Styling architecture

- `ui-core` owns shared `--vf-*` tokens and utility classes.
- `ui-components` owns reusable `vf-*` component classes.
- `ui-data-grid` owns grid-specific `udg-*` and `--udg-*`.
- TSX owns structure, behavior, accessibility, state classes, and measured
  values.
- CSS owns static visual decisions.
- Shared semantic values must not be reinvented in component or grid CSS.

## Verification

```bash
npm run test --workspace @vyrnforge/ui-core
npm run verify:design-tokens
```

This package has no runtime dependencies.

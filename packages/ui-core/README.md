# @vyrnforge/ui-core

Shared VyrnForge UI foundation package for native-first design tokens, CSS variables, theme helpers, density tokens, and small utility classes.

`@vyrnforge/ui-core` owns tokens and utilities only. It does not own React components, data-grid behavior, app state, adapters, or a global store.

## Package Status

VyrnForge UI is currently in an early alpha prerelease stage. For registry
installations, use the explicit `alpha` dist-tag while the public APIs,
accessibility behavior, and package boundaries continue to be evaluated. This
package is not yet intended for production use.

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Source inspection, local evaluation, and temporary non-production prototypes are permitted. Production use, commercial use, redistribution, package republication, resale, sublicensing, white-labeling, and competing-library use require separate written permission or a separate written commercial license.

Public package entry points use the package root and CSS subpath exports:

```ts
import { createVyrnForgeTheme } from "@vyrnforge/ui-core";
import "@vyrnforge/ui-core/styles/index.css";
```

The package is built from `dist` output. Public exports do not point at internal `src` files.
Package metadata uses `SEE LICENSE IN LICENSE`, and the npm artifact includes a package-local LICENSE that matches the repository root license.

## CSS

```tsx
import "@vyrnforge/ui-core/styles/index.css";
```

The CSS provides:

- primitive tokens
- semantic tokens
- `light`, `dark`, `enterprise`, and `system` theme support
- `compact`, `standard`, and `comfortable` density support
- utility classes such as `vf-text-muted`, `vf-truncate`, `vf-sr-only`, and `vf-focus-ring`

Use `ui-core` before other VyrnForge package styles so shared `--vf-*` tokens are available:

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

Global app theme override:

```css
.my-app {
  --vf-primary: #003b71;
  --vf-radius-md: 10px;
}
```

## Styling Architecture Rules

- `ui-core` owns shared `--vf-*` tokens and utility classes.
- `ui-components` owns reusable `vf-*` component classes and should consume `ui-core` tokens.
- `ui-data-grid` owns grid-specific `udg-*` classes and maps grid variables back to `vf-*` tokens.
- TSX should not contain static visual styling. Component TSX should define structure, behavior, accessibility, state classes, and dynamic CSS variables only.
- CSS owns colors, spacing, borders, radius, shadows, typography, hover/focus/active/disabled states, theme behavior, and density behavior.
- Use CSS variables for customization; do not edit package CSS directly.
- Use `className` for structural extension and `style` or `themeVars` only for instance-level overrides.

## Theme Helpers

```ts
import {
  createVyrnForgeTheme,
  vyrnForgeEnterpriseTheme
} from "@vyrnforge/ui-core";

const theme = createVyrnForgeTheme({
  ...vyrnForgeEnterpriseTheme,
  "--vf-primary": "#1d4ed8"
});
```

This package has no runtime dependencies.

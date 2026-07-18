# @vyrnforge/ui-core

Shared VyrnForge UI foundation package for native-first design tokens, CSS variables, theme helpers, density tokens, and small utility classes.

`@vyrnforge/ui-core` owns tokens and utilities only. It does not own React components, data-grid behavior, app state, adapters, or a global store.

## Package Status

VyrnForge UI is pre-alpha. This package is private in the repository until release, versioning, and licensing gates are complete.

Public package entry points are prepared for the first approved alpha:

```ts
import { createVyrnForgeTheme } from "@vyrnforge/ui-core";
import "@vyrnforge/ui-core/styles/index.css";
```

The package is built from `dist` output. Public exports do not point at internal `src` files.

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

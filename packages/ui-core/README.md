# @dravyn/ui-core

Shared Dravyn UI foundation package for native-first design tokens, CSS variables, theme helpers, density tokens, and small utility classes.

`@dravyn/ui-core` owns tokens and utilities only. It does not own React components, data-grid behavior, app state, adapters, or a global store.

## CSS

```tsx
import "@dravyn/ui-core/styles/index.css";
```

The CSS provides:

- primitive tokens
- semantic tokens
- `light`, `dark`, `enterprise`, and `system` theme support
- `compact`, `standard`, and `comfortable` density support
- utility classes such as `dv-text-muted`, `dv-truncate`, `dv-sr-only`, and `dv-focus-ring`

Use `ui-core` before other Dravyn package styles so shared `--dv-*` tokens are available:

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
```

Global app theme override:

```css
.my-app {
  --dv-primary: #003b71;
  --dv-radius-md: 10px;
}
```

## Styling Architecture Rules

- `ui-core` owns shared `--dv-*` tokens and utility classes.
- `ui-components` owns reusable `dv-*` component classes and should consume `ui-core` tokens.
- `ui-data-grid` owns grid-specific `udg-*` classes and maps grid variables back to `dv-*` tokens.
- TSX should not contain static visual styling. Component TSX should define structure, behavior, accessibility, state classes, and dynamic CSS variables only.
- CSS owns colors, spacing, borders, radius, shadows, typography, hover/focus/active/disabled states, theme behavior, and density behavior.
- Use CSS variables for customization; do not edit package CSS directly.
- Use `className` for structural extension and `style` or `themeVars` only for instance-level overrides.

## Theme Helpers

```ts
import {
  createDravynTheme,
  dravynEnterpriseTheme
} from "@dravyn/ui-core";

const theme = createDravynTheme({
  ...dravynEnterpriseTheme,
  "--dv-primary": "#1d4ed8"
});
```

This package has no runtime dependencies.

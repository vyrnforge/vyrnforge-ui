# @dravyn/ui-core

Shared Dravyn UI foundation package for native-first design tokens, CSS variables, theme helpers, density tokens, and small utility classes.

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

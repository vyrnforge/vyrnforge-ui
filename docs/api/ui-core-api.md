# @vyrnforge/ui-core API

`@vyrnforge/ui-core` is the shared design foundation for VyrnForge UI.

It owns:

- CSS variables and token defaults
- theme presets
- density tokens
- utility classes
- theme helper contracts

It does not own React components, data-grid behavior, app state, backend fetching, or business workflows.

## CSS Import

```ts
import "@vyrnforge/ui-core/styles/index.css";
```

Import `ui-core` CSS before `ui-components` and `ui-data-grid` CSS.

## Public Exports

```ts
import {
  createVyrnForgeTheme,
  mergeVyrnForgeTheme,
  toVyrnForgeThemeStyle,
  vyrnForgeLightTheme,
  vyrnForgeDarkTheme,
  vyrnForgeEnterpriseTheme,
  getVyrnForgeThemePreset
} from "@vyrnforge/ui-core";
```

Public types include:

- `VyrnForgeTheme`
- `VyrnForgeThemeName`
- `VyrnForgeThemeVars`
- `VyrnForgeCssVar`
- `VyrnForgeDensity`
- `VyrnForgeVariant`

## Theme Model

Themes are CSS-variable maps using the `--dv-*` namespace. Apps can use preset themes or create scoped overrides.

```tsx
import { vyrnForgeEnterpriseTheme, toVyrnForgeThemeStyle } from "@vyrnforge/ui-core";

export function AppShell() {
  return <div style={toVyrnForgeThemeStyle(vyrnForgeEnterpriseTheme)}>...</div>;
}
```

Use `mergeVyrnForgeTheme` to extend a preset without losing defaults.

## Density Model

VyrnForge uses these density names:

- `compact`
- `standard`
- `comfortable`

Density is represented through reusable tokens such as `--dv-control-height` and `--dv-row-height`.

## Public Token Categories

| Category | Examples |
| --- | --- |
| Color | `--dv-primary`, `--dv-primary-hover`, `--dv-primary-soft` |
| Surface | `--dv-bg`, `--dv-surface`, `--dv-surface-subtle`, `--dv-surface-raised` |
| Text | `--dv-text`, `--dv-text-muted`, `--dv-text-strong` |
| Border | `--dv-border`, `--dv-border-strong` |
| Focus | `--dv-focus-ring` |
| Status | `--dv-danger`, `--dv-warning`, `--dv-success`, `--dv-info` and soft variants |
| Spacing | shared spacing values used by package CSS |
| Radius | `--dv-radius-sm`, `--dv-radius-md`, `--dv-radius-lg` |
| Shadow | `--dv-shadow-sm`, `--dv-shadow-md` |
| Typography | `--dv-font-family`, font-size tokens |
| Density | `--dv-control-height`, `--dv-row-height` |

See `css-token-reference.md` for the stable token list.

## Utility Classes

Public utility classes include:

- `dv-text-muted`
- `dv-text-strong`
- `dv-truncate`
- `dv-sr-only`
- `dv-focus-ring`

Use utilities for small shared behavior only. Do not move package-specific component styles into `ui-core`.

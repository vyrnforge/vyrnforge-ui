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

Themes are CSS-variable maps using the `--vf-*` namespace. Apps can use preset themes or create scoped overrides.

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

Density is represented through reusable tokens such as `--vf-control-height` and `--vf-row-height`.

## Public Token Categories

| Category | Examples |
| --- | --- |
| Color | `--vf-primary`, `--vf-primary-hover`, `--vf-primary-soft` |
| Surface | `--vf-bg`, `--vf-surface`, `--vf-surface-subtle`, `--vf-surface-raised` |
| Text | `--vf-text`, `--vf-text-muted`, `--vf-text-strong` |
| Border | `--vf-border`, `--vf-border-strong` |
| Focus | `--vf-focus-ring` |
| Status | `--vf-danger`, `--vf-warning`, `--vf-success`, `--vf-info` and soft variants |
| Spacing | shared spacing values used by package CSS |
| Radius | `--vf-radius-sm`, `--vf-radius-md`, `--vf-radius-lg` |
| Shadow | `--vf-shadow-sm`, `--vf-shadow-md` |
| Typography | `--vf-font-family`, font-size tokens |
| Density | `--vf-control-height`, `--vf-row-height` |

See `css-token-reference.md` for the stable token list.

## Utility Classes

Public utility classes include:

- `vf-text-muted`
- `vf-text-strong`
- `vf-truncate`
- `vf-sr-only`
- `vf-focus-ring`

Use utilities for small shared behavior only. Do not move package-specific component styles into `ui-core`.

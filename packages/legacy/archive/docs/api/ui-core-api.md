# @vyrnforge/ui-core API

`@vyrnforge/ui-core` is the dependency-free shared design foundation for
VyrnForge UI.

It owns CSS variables, semantic tokens, theme presets, density contracts,
typography roles, motion, layering, utilities, and theme helpers. It does not
own React components, data-grid behavior, app state, or business workflows.

## CSS import

```ts
import "@vyrnforge/ui-core/styles/index.css";
```

Import core CSS before component and grid CSS.

## Public exports

```ts
import {
  createVyrnForgeTheme,
  getVyrnForgeThemePreset,
  mergeVyrnForgeTheme,
  normalizeVyrnForgeDensity,
  toVyrnForgeThemeStyle,
  vyrnForgeCanonicalDensities,
  vyrnForgeDarkTheme,
  vyrnForgeDensityAliases,
  vyrnForgeEnterpriseTheme,
  vyrnForgeLayerOrder,
  vyrnForgeLightTheme,
  vyrnForgeSemanticTokenGroups,
  vyrnForgeThemeColorTokens,
} from "@vyrnforge/ui-core";
```

Public types include:

- `VyrnForgeTheme`
- `VyrnForgeThemeName`
- `VyrnForgeThemeVars`
- `VyrnForgeCssVar`
- `VyrnForgeDensity`
- `VyrnForgeCanonicalDensity`
- `VyrnForgeLegacyDensity`
- `VyrnForgeSemanticToken`
- `VyrnForgeSemanticTokenGroup`
- `VyrnForgeLayerToken`
- `VyrnForgeVariant`

## Theme model

Theme presets are complete maps for every theme-scoped semantic role.

```tsx
import {
  mergeVyrnForgeTheme,
  toVyrnForgeThemeStyle,
  vyrnForgeEnterpriseTheme,
} from "@vyrnforge/ui-core";

const productTheme = mergeVyrnForgeTheme(vyrnForgeEnterpriseTheme, {
  "--vf-interactive-primary": "#003b71",
  "--vf-focus-color": "#005ea8",
});

export function ProductRoot() {
  return <div style={toVyrnForgeThemeStyle(productTheme)}>...</div>;
}
```

`system` resolves to the light JavaScript preset; CSS applies the complete dark
role set when the operating system requests dark mode.

## Density model

Canonical names:

- `compact`
- `balanced`
- `spacious`

Compatibility names:

- `standard` → `balanced`
- `comfortable` → `spacious`

```ts
normalizeVyrnForgeDensity("standard"); // "balanced"
```

The CSS selectors support both canonical and compatibility names.

## Typed token inventory

`vyrnForgeSemanticTokenGroups` exposes the nine semantic categories without
requiring applications to parse CSS. It is useful for documentation, token
inspectors, and controlled theme tooling.

`vyrnForgeLayerOrder` exposes the deterministic layer contract.

Do not use these exports to generate runtime component state or introduce a
global store.

## Utility classes

Public utilities include:

- `vf-text-muted`
- `vf-text-strong`
- `vf-truncate`
- `vf-sr-only`
- `vf-focus-ring`
- `vf-type-display`
- `vf-type-page-title`
- `vf-type-section-title`
- `vf-type-label`
- `vf-type-body`
- `vf-type-caption`
- `vf-type-code`
- `vf-type-numeric`

See `css-token-reference.md` and
`../architecture/08-semantic-token-contract.md` for the complete contract.

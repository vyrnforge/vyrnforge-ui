> Archived: This document is historical and no longer canonical.
> Replacement: ../../architecture/03-theming-and-styling.md

# 04 — Theme System Specification

## Purpose

The theme system allows Dravyn UI components to be customized across projects without editing package internals.

The system should support:

* light theme
* dark theme
* system theme
* enterprise theme
* custom project themes
* density modes
* visual variants
* per-instance CSS variable overrides

## Theme implementation model

Use CSS variables and data attributes.

Example:

```tsx
<UniversalDataGrid
  theme="enterprise"
  density="compact"
  variant="card"
/>
```

Renders a root similar to:

```html
<div class="udg" data-theme="enterprise" data-density="compact" data-variant="card">
```

## CSS file structure

Recommended structure for every package with component styling:

```txt
styles/
  index.css
  tokens.css
  themes.css
  density.css
  components.css
  utilities.css
```

For the data grid package:

```txt
packages/ui-data-grid/src/styles/
  index.css
  data-grid.tokens.css
  data-grid.themes.css
  data-grid.density.css
  data-grid.components.css
  data-grid.utilities.css
```

## Token layers

### 1. Primitive tokens

Raw design values:

```css
--udg-font-family
--udg-font-size-xs
--udg-font-size-sm
--udg-font-size-md
--udg-font-size-lg
--udg-space-1
--udg-space-2
--udg-space-3
--udg-radius-sm
--udg-radius-md
--udg-shadow-sm
```

### 2. Semantic tokens

Meaning-based values:

```css
--udg-bg
--udg-surface
--udg-surface-subtle
--udg-text
--udg-text-muted
--udg-border
--udg-primary
--udg-danger
--udg-warning
--udg-success
--udg-focus-ring
```

### 3. Component tokens

Component-specific values:

```css
--udg-toolbar-height
--udg-header-height
--udg-row-height
--udg-cell-padding-x
--udg-control-height
--udg-header-bg
--udg-row-hover-bg
--udg-row-selected-bg
```

## Built-in themes

### Light

Default clean SaaS theme.

Recommended direction:

```txt
background: very light slate
surface: white
text: slate
border: soft slate
primary: professional blue
```

### Dark

Calm dark slate theme.

Recommended direction:

```txt
background: dark slate
surface: raised slate
text: light gray
border: medium slate
primary: soft blue
```

Avoid pure black and glowing blue borders.

### Enterprise

Polished corporate light theme.

Slightly stronger borders, compact surfaces, and restrained primary color.

### System

Uses `prefers-color-scheme` where possible.

## Optional dragon-inspired named presets

These may be added later:

```txt
ember-light
obsidian-dark
forge-enterprise
```

## Density modes

Supported densities:

```txt
compact
standard
comfortable
```

Density affects:

* row height
* header height
* toolbar height
* control height
* cell padding
* menu row height

## Variants

Supported variants:

```txt
plain
bordered
card
```

### Plain

Minimal wrapper. Useful when the component sits inside another panel.

### Bordered

Adds border around the component.

### Card

Adds border, radius, subtle surface, and minimal elevation.

## ThemeVars API

Components may support per-instance variable overrides:

```tsx
const theme = createDataGridTheme({
  "--udg-primary": "#003b71",
  "--udg-radius-md": "10px"
});

<UniversalDataGrid themeVars={theme} />
```

## Recommended customization hierarchy

1. Use built-in theme, density, and variant.
2. Use scoped CSS variable overrides.
3. Use `themeVars` for per-instance overrides.
4. Avoid editing package CSS directly.

## Future ui-core extraction

The theme system currently lives in `ui-data-grid`.

Long-term, generic tokens should move to:

```txt
@dravyn/ui-core
```

Then `ui-data-grid` and `ui-components` can consume the shared core theme system.

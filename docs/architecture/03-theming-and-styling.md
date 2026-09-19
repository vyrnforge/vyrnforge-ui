# Theming & Styling

VyrnForge uses package-owned CSS and CSS custom properties. The same styling foundation is shared across Native HTML, React, Angular, and Vue.

## What to customize

| Scope                       | Prefix    | Use for                                                        |
| --------------------------- | --------- | -------------------------------------------------------------- |
| Shared VyrnForge tokens     | `--vf-*`  | color, typography, spacing, density, focus, motion, layers     |
| VyrnForge component classes | `vf-*`    | component structure and states                                 |
| Data-grid tokens            | `--udg-*` | grid-specific layout and behavior                               |
| Data-grid classes           | `udg-*`   | grid structure and interaction                                  |

Use `--vf-*` for reusable application-wide decisions. Use `--udg-*` only when the decision is specific to the grid.

## Themes

VyrnForge themes expose the same semantic roles. Components should not require framework-specific or theme-specific forks.

A host can select a theme with a normal attribute:

```html
<div data-theme="dark">
  ...
</div>
```

TypeScript theme presets are also available from `@vyrnforge/ui-core`.

## Density

The canonical density values are:

- `compact`
- `balanced`
- `spacious`

Compatibility aliases may exist for older applications, but new code should use the canonical values.

## Override order

Prefer customization in this order:

1. built-in component variants, theme, and density;
2. scoped `--vf-*` semantic token overrides;
3. `--udg-*` overrides for grid-only needs;
4. `className` or equivalent framework class hooks for structural extension;
5. inline style only for instance-specific or measured values.

## Example

```css
.my-product {
  --vf-interactive-primary: #003b71;
  --vf-focus-color: #005ea8;
  --vf-radius-md: 10px;
}

.my-product .udg {
  --udg-row-height: 42px;
}
```

## Framework consistency

Angular and Vue adapters must not invent framework-specific token systems. Native elements use Light DOM by default so theme, typography, density, and application overrides inherit normally.

For exact token names, use the **Design Tokens** reference in the documentation site.

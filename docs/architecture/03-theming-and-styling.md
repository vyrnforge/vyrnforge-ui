# Theming And Styling Architecture

## Styling model

Dravyn uses package CSS and CSS variables, not CSS-in-JS or utility-framework dependency.

## Theme layers

| Layer | Prefix | Owner | Purpose |
| --- | --- | --- | --- |
| Shared foundation | `--dv-*` | `@dravyn/ui-core` | app-wide colors, typography, spacing, radius, shadows, density |
| Component classes | `dv-*` | `@dravyn/ui-components` | shared component visuals |
| Grid variables | `--udg-*` | `@dravyn/ui-data-grid` | grid row/header/layout variables |
| Grid classes | `udg-*` | `@dravyn/ui-data-grid` | grid-specific layout and interactions |

## Recommended import order

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
```

## TSX vs CSS rule

Component TSX owns:

- structure
- behavior
- accessibility
- state classes
- dynamic CSS variables when necessary

CSS owns:

- colors
- spacing
- radius
- borders
- shadows
- hover/focus/disabled states
- theme variants
- density variants

## Inline styles are allowed for

- user-provided `style` prop
- dynamic CSS variables
- measured runtime positions
- dynamic width/height when CSS cannot know the value

Inline styles are not allowed for static theme styling.

## Customization hierarchy

1. Use built-in `theme`, `density`, `variant` props.
2. Override scoped `--dv-*` tokens.
3. Override scoped `--udg-*` variables for grid-specific needs.
4. Use `className` for structural extension.
5. Use `style` only for instance-level dynamic overrides.

## Example

```css
.my-product {
  --dv-primary: #003b71;
  --dv-radius-md: 10px;
}

.my-product .udg {
  --udg-row-height: 42px;
  --udg-header-bg: #f8fafc;
}
```

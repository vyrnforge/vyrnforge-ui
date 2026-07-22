# Theming And Styling Architecture

## Styling model

VyrnForge uses package-owned CSS and CSS custom properties. It does not require
CSS-in-JS, Tailwind, MUI, Radix, or another styling framework.

## Theme layers

| Layer                             | Prefix              | Owner                      | Purpose                                                                  |
| --------------------------------- | ------------------- | -------------------------- | ------------------------------------------------------------------------ |
| Primitive and semantic foundation | `--vf-*`            | `@vyrnforge/ui-core`       | surfaces, text, interaction, status, density, typography, motion, layers |
| Component classes                 | `vf-*`              | `@vyrnforge/ui-components` | reusable component structure and visuals                                 |
| Grid variables                    | `--udg-*`           | `@vyrnforge/ui-data-grid`  | grid-only layout and behavior                                            |
| Grid classes                      | `udg-*`             | `@vyrnforge/ui-data-grid`  | grid structure and interactions                                          |
| Application classes               | approved app prefix | consuming app              | product-specific presentation                                            |

The complete semantic contract lives in
`08-semantic-token-contract.md` and
`../metadata/design-tokens.json`.

## Import order

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

## Decision ownership

Use a shared `--vf-*` token when a decision represents a reusable role across
components or products.

Keep a decision component-local only when it describes:

- measured geometry
- dynamic positioning
- private composition
- a value supplied by the consuming application

Use `--udg-*` only when the role is specific to grid behavior. Grid variables
should map shared color, focus, typography, density, motion, and layer roles to
canonical `--vf-*` tokens.

## TSX versus CSS

Component TSX owns:

- structure
- behavior
- accessibility
- state classes
- measured runtime positions
- dynamic CSS variables when CSS cannot know the value

CSS owns:

- surfaces and text hierarchy
- borders, radius, and shadows
- hover, active, selected, disabled, and focus states
- status presentation
- density and typography
- motion and reduced-motion fallbacks
- layering
- theme variants

Static visual decisions do not belong in TSX.

## Theme roles

Light, dark, enterprise, and system themes expose the same semantic roles.
Components must not require theme-specific overrides.

Applications may apply a complete TypeScript preset:

```tsx
import {
  toVyrnForgeThemeStyle,
  vyrnForgeEnterpriseTheme,
} from "@vyrnforge/ui-core";

<div style={toVyrnForgeThemeStyle(vyrnForgeEnterpriseTheme)} />;
```

or use CSS selectors:

```html
<div data-theme="dark"></div>
```

## Density

Canonical density selectors are `compact`, `balanced`, and `spacious`.
`standard` remains a compatibility alias of `balanced`; `comfortable` remains
an alias of `spacious`.

Density controls reusable active tokens rather than requiring components to
invent local heights or padding.

## Customization hierarchy

1. Use built-in theme, density, and component variants.
2. Override scoped canonical `--vf-*` semantic roles.
3. Override `--udg-*` only for grid-specific needs.
4. Use `className` for structural extension.
5. Use `style` only for instance-level or measured values.

## Example

```css
.my-product {
  --vf-interactive-primary: #003b71;
  --vf-interactive-primary-hover: #002f5b;
  --vf-focus-color: #005ea8;
  --vf-radius-md: 10px;
}

.my-product .udg {
  --udg-row-height: 42px;
  --udg-header-bg: var(--vf-surface-canvas);
}
```

Historical tokens such as `--vf-primary` remain compatibility sources during
S3. New work should use canonical semantic roles.

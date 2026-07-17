# `@vyrnforge/ui-core`

## Purpose

`@vyrnforge/ui-core` is the shared foundation package.

It provides:

- design tokens
- theme variables
- density variables
- utility classes
- theme helper contracts

It should remain dependency-light and should not own React components.

## Owns

- `--vf-*` CSS variables
- `vf-*` utility classes where not component-specific
- theme presets: light, dark, system, enterprise
- density presets: compact, standard, comfortable

## Does not own

- React components
- grid behavior
- backend data
- app state

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
```

## Theme override example

```css
.my-app {
  --vf-primary: #003b71;
  --vf-radius-md: 10px;
}
```

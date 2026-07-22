# `@vyrnforge/ui-core`

## Purpose

`@vyrnforge/ui-core` is the dependency-free shared design foundation.

It provides:

- primitive and semantic design tokens
- light, dark, enterprise, and system themes
- compact, balanced, and spacious density contracts
- typography roles
- motion and reduced-motion behavior
- deterministic layer levels
- shared utility classes
- typed token and theme helper contracts

It does not own React components, grid behavior, application state, adapters,
or business workflows.

## Ownership

- `--vf-*` primitive and semantic variables
- shared non-component `vf-*` utility classes
- theme presets and complete theme-scoped token maps
- density sizing and compatibility aliases
- typography, motion, focus, status, and layer roles

The machine-readable token source is
`docs/metadata/design-tokens.json`.

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
```

Import core styles before components and grid styles.

## Density names

Canonical:

- `compact`
- `balanced`
- `spacious`

Compatibility:

- `standard` → `balanced`
- `comfortable` → `spacious`

## Package readiness

- JavaScript entry: built `dist/index.js` and `dist/index.cjs`.
- Type declarations: `dist/index.d.ts`.
- CSS entry: built `dist/index.css`.
- Published whitelist: `dist` and `README.md`.
- Runtime dependencies: none.
- License metadata: `SEE LICENSE IN LICENSE`.

## Theme override example

```css
.my-app {
  --vf-interactive-primary: #003b71;
  --vf-interactive-primary-hover: #002f5b;
  --vf-focus-color: #005ea8;
  --vf-radius-md: 10px;
}
```

See `../architecture/08-semantic-token-contract.md` for ownership and
compatibility rules.

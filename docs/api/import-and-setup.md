# Import And Setup

VyrnForge UI is package-based. Import only the packages and CSS that your app uses.

## Recommended CSS Order

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

Use this order when an app renders core tokens, shared components, and the data grid together.

These package-level entry files are the public CSS import contract. Internally, each package may split CSS into smaller files by token layer, component family, or grid feature, but apps should not import those internal files directly.

## Why Order Matters

| CSS import | Why it comes here |
| --- | --- |
| `@vyrnforge/ui-core/styles/index.css` | Defines shared `--vf-*` tokens, themes, density, and utilities. |
| `@vyrnforge/ui-components/styles/index.css` | Defines shared component classes that consume `--vf-*` tokens. |
| `@vyrnforge/ui-data-grid/styles/index.css` | Defines `udg-*` grid classes and `--udg-*` variables, with fallbacks to `--vf-*` tokens where practical. |

Apps that only use `@vyrnforge/ui-core` and `@vyrnforge/ui-components` do not need to import data-grid CSS. Apps that only use the data grid should still prefer importing `ui-core` first for shared token alignment, but the grid CSS includes fallback values so it can render correctly without forcing every consumer to import all CSS.

## JavaScript Imports

```tsx
import { Button, Card } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

Package JavaScript and TypeScript entry points resolve through built package output:

| Package | JavaScript entry | Type declarations |
| --- | --- | --- |
| `@vyrnforge/ui-core` | `dist/index.js` / `dist/index.cjs` | `dist/index.d.ts` |
| `@vyrnforge/ui-components` | `dist/index.js` / `dist/index.cjs` | `dist/index.d.ts` |
| `@vyrnforge/ui-data-grid` | `dist/index.js` / `dist/index.cjs` | `dist/index.d.ts` |

Public exports must not point at internal `src` files. Package verification is available from the repository root:

```bash
npm run build:packages
npm run verify:packages
```

## Theme Overrides

Use `--vf-*` tokens for app-wide theming:

```css
.my-app {
  --vf-primary: #003b71;
  --vf-radius-md: 10px;
}
```

Use `--udg-*` tokens for grid-specific overrides:

```css
.my-app .udg {
  --udg-row-height: 42px;
  --udg-header-bg: #f8fafc;
}
```

## Rules

- Do not edit package CSS files in consuming apps.
- Do not import internal package CSS modules directly; use package-level `styles/index.css` paths.
- Prefer component props and CSS variables before custom class overrides.
- Keep app-specific styles scoped to the consuming application.
- Do not import forbidden UI frameworks to style VyrnForge components.

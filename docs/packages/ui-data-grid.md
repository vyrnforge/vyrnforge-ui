# `@vyrnforge/ui-data-grid`

## Purpose

`@vyrnforge/ui-data-grid` provides `UniversalDataGrid`, a specialized enterprise data-management grid.

It is not the entire VyrnForge UI library. It is one specialized package inside the larger foundation.

## Owns

- grid rendering
- grid-specific `udg-*` styles
- search/filter/sort/pagination/grouping/selection behavior
- column visibility/order/sizing
- grid state contracts
- persistence/server/export adapters

## Does not own

- app data fetching
- auth/tenant/permissions
- backend mutations
- report file generation
- global store

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

## State model

The grid supports controlled and uncontrolled state.

Apps own backend rows and business actions.

## Server/export policy

- Server mode emits query contracts.
- Export emits request contracts.
- The grid does not fetch or generate files by default.

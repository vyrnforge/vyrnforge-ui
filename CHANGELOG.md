# Changelog

## Unreleased

- Restructured the repository as the VyrnForge UI workspace.
- Added `@vyrnforge/ui-core` with shared tokens, theme helpers, density CSS, and utility classes.
- Added `@vyrnforge/ui-components` with native-first React primitives for actions, typography, badges, forms, and feedback states.
- Aligned `@vyrnforge/ui-data-grid` theme defaults with shared `--dv-*` tokens while preserving backward-compatible `--udg-*` variables.
- Aligned the data grid package name with `@vyrnforge/ui-data-grid`.
- Made the VyrnForge UI docs the primary flat documentation set under `docs/`.

## Historical naming

Entries before BR-005 may refer to Dravyn UI, the former project identity. Entries before BR-006 may refer to the historical `@dravyn/*` package scope. Current packages now use `@vyrnforge/*`.

## 0.1.0

Initial Dravyn UI Universal Data Grid scaffold. Historical reference: this release predates the VyrnForge UI rename.

- Added npm workspace foundation.
- Added `@dravyn/ui-data-grid` package scaffold.
- Added native-first React and TypeScript grid foundation.
- Added controlled/uncontrolled grid state contracts.
- Added pure core helpers for search, filters, sorting, pagination, grouping, column sizing, column visibility, and export request building.
- Added base CSS variables and native table styling.
- Added basic playground app for package reuse validation.
- Added light, dark, system, and enterprise theme foundations.
- Added column visibility, ordering, compact column menu, reset actions, and persistence support.
- Added native column resizing with min/max width constraints and reset behavior.
- Added progressive header actions for sorting, hiding, resizing, and column movement.
- Added opt-in row selection, page-level select all, controlled selected IDs, disabled rows, and native bulk action bar support.
- Added opt-in client-side row grouping with nested groups, expand/collapse rows, grouping chips, header group actions, persistence support, and grouped playground examples.
- Replaced rough text controls with native inline SVG icons without adding runtime dependencies.
- Kept the package lightweight with only React and React DOM as peer dependencies.

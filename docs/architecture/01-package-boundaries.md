# Package Boundaries

## Responsibilities

| Package | Owns | Must Not Own |
| --- | --- | --- |
| `@dravyn/ui-core` | Design tokens, themes, density tokens, utility classes, theme helpers | React components, grid behavior, app data |
| `@dravyn/ui-components` | Native reusable React primitives and `dv-*` component styles | Data-grid behavior, backend data, global app state |
| `@dravyn/ui-data-grid` | Grid-specific rendering, state contracts, pure grid helpers, grid adapters, `udg-*` styles | Shared primitive ownership, app business state, direct fetching/export generation |

## Dependency Direction

Valid:

- `ui-components -> ui-core`
- `ui-data-grid -> ui-core`
- `ui-data-grid -> ui-components`

Invalid:

- `ui-core -> ui-components`
- `ui-core -> ui-data-grid`
- `ui-components -> ui-data-grid`

## Current Dependency Audit

Checked package manifests:

- `packages/ui-core/package.json`: no Dravyn package dependencies. This is valid.
- `packages/ui-components/package.json`: depends on `@dravyn/ui-core`. This is valid.
- `packages/ui-data-grid/package.json`: depends on `@dravyn/ui-core` and `@dravyn/ui-components`. This is valid.

No circular Dravyn package dependency is present.

## Boundary Rules

- Public package APIs should export components, public types, hooks, and stable helpers only.
- Internal implementation details can be organized under `state/`, `core/`, `hooks/`, and `adapters/`, but old public imports must remain compatible unless explicitly deprecated.
- Styling ownership follows prefixes: shared components use `dv-*`; data-grid-specific styles use `udg-*`.

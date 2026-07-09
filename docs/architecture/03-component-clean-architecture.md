# Component Clean Architecture

`@dravyn/ui-components` owns reusable primitives used by apps and specialized packages such as the data grid.

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Components | `src/components/` | Markup, accessibility, behavior, state classes |
| Hooks | `src/hooks/` | Shared component interaction hooks such as controlled/uncontrolled state |
| Utils | `src/utils/` | Small framework-local helpers |
| Styles | `src/styles/` | `dv-*` visual styles, states, density, theme compatibility |

## Rules

- Component TSX should not contain static visual styling.
- Use `className` and variant/state classes for styling hooks.
- Use inline `style` only for user overrides or dynamic runtime values.
- Components consume `--dv-*` tokens from `@dravyn/ui-core`.
- Components must not import from `@dravyn/ui-data-grid`.
- Reusable behavior can live in `src/hooks/`; do not move to `ui-core` unless it is clearly generic and dependency-free.

## Styling

CSS owns colors, spacing, borders, radius, shadows, typography, focus, active, hover, disabled, theme, and density behavior.

Examples of expected classes:

- `dv-button`, `dv-button--primary`, `dv-button--loading`
- `dv-icon-button`, `dv-toolbar-button`
- `dv-input`, `dv-select`, `dv-checkbox`
- `dv-popover`, `dv-menu`, `dv-dialog`, `dv-drawer`

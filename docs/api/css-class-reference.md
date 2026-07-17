# CSS Class Reference

CSS classes exist to support component rendering and scoped extension. App code should prefer component props and CSS variables before relying on class names.

## Prefixes

| Prefix | Owner | Public meaning |
| --- | --- | --- |
| `vf-*` | `@vyrnforge/ui-core` and `@vyrnforge/ui-components` | Shared utilities and component classes. |
| `udg-*` | `@vyrnforge/ui-data-grid` | Data-grid-specific classes. |
| `vf-docs-*` | `apps/docs` | Docs-app-only layout and documentation presentation classes. |
| `vf-playground-*` | `examples/basic-playground` | Playground-only demo layout and example helper classes. |

## Shared dv Classes

Public utility classes include:

- `vf-text-muted`
- `vf-text-strong`
- `vf-truncate`
- `vf-sr-only`
- `vf-focus-ring`

Component classes such as `vf-button`, `vf-card`, `vf-panel`, `vf-input`, `vf-radio`, `vf-radio-group`, `vf-switch`, `vf-number-input`, `vf-date-input`, `vf-datetime-input`, `vf-multi-select`, `vf-validation-message`, `vf-app-shell`, `vf-app-shell--scroll-content`, `vf-app-shell--header-sticky`, `vf-app-shell--sidebar-sticky`, `vf-page`, `vf-page-header`, `vf-page-toolbar`, `vf-side-nav`, `vf-top-nav`, `vf-breadcrumbs`, and `vf-tabs` are owned by `@vyrnforge/ui-components`. Apps should usually use the component instead of styling these classes directly.

## Grid udg Classes

`udg-*` classes are data-grid-specific. They support grid layout, cells, rows, headers, toolbar, density, selection, grouping, and states.

Prefer grid props and `--udg-*` variables for customization. Use `className` only for scoped app extension.

## Docs App Classes

`vf-docs-*` classes are private to `apps/docs`. They are not public package API and should not be copied into consuming applications.

They cover:

- docs shell layout
- sidebar layout
- markdown rendering
- metadata master-detail layout
- docs code blocks
- responsive docs layout

## Playground Classes

`vf-playground-*` classes are private to `examples/basic-playground`. They are demo helpers only and should not be copied into packages or consuming apps.

## Rules

- Prefer component props first.
- Prefer `--vf-*` and `--udg-*` variables for styling changes.
- Use `className` for scoped layout and extension.
- Do not rely on undocumented internal classes.
- Do not copy package CSS or docs CSS into consuming apps.
- Do not create duplicate button, input, badge, card, or grid styling outside the owning package.

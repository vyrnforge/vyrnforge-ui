# CSS Class Reference

CSS classes exist to support component rendering and scoped extension. App code should prefer component props and CSS variables before relying on class names.

## Prefixes

| Prefix | Owner | Public meaning |
| --- | --- | --- |
| `dv-*` | `@dravyn/ui-core` and `@dravyn/ui-components` | Shared utilities and component classes. |
| `udg-*` | `@dravyn/ui-data-grid` | Data-grid-specific classes. |
| `dv-docs-*` | `apps/docs` | Docs-app-only layout and documentation presentation classes. |

## Shared dv Classes

Public utility classes include:

- `dv-text-muted`
- `dv-text-strong`
- `dv-truncate`
- `dv-sr-only`
- `dv-focus-ring`

Component classes such as `dv-button`, `dv-card`, `dv-panel`, `dv-input`, `dv-radio`, `dv-radio-group`, `dv-switch`, `dv-number-input`, `dv-date-input`, `dv-datetime-input`, `dv-multi-select`, `dv-validation-message`, `dv-app-shell`, `dv-page`, `dv-page-header`, `dv-page-toolbar`, `dv-side-nav`, `dv-top-nav`, `dv-breadcrumbs`, and `dv-tabs` are owned by `@dravyn/ui-components`. Apps should usually use the component instead of styling these classes directly.

## Grid udg Classes

`udg-*` classes are data-grid-specific. They support grid layout, cells, rows, headers, toolbar, density, selection, grouping, and states.

Prefer grid props and `--udg-*` variables for customization. Use `className` only for scoped app extension.

## Docs App Classes

`dv-docs-*` classes are private to `apps/docs`. They are not public package API and should not be copied into consuming applications.

They cover:

- docs shell layout
- sidebar layout
- markdown rendering
- metadata master-detail layout
- docs code blocks
- responsive docs layout

## Rules

- Prefer component props first.
- Prefer `--dv-*` and `--udg-*` variables for styling changes.
- Use `className` for scoped layout and extension.
- Do not rely on undocumented internal classes.
- Do not copy package CSS or docs CSS into consuming apps.

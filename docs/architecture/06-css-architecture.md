# CSS Architecture

VyrnForge CSS is package-owned and imported through stable package entry files. Internal CSS files may be split by component group or feature, but consuming apps should keep using package-level imports.

## Stable Imports

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

## Ownership

| Area | Prefix | Owns | Must not own |
| --- | --- | --- | --- |
| `@vyrnforge/ui-core` | `--dv-*`, shared `dv-*` utilities | reset, tokens, themes, density, generic utilities, accessibility helpers | component classes, grid classes, app-specific classes |
| `@vyrnforge/ui-components` | `dv-*` | shared component styles for actions, forms, feedback, layout, navigation, overlays, typography | `udg-*`, docs/playground styling |
| `@vyrnforge/ui-data-grid` | `udg-*`, `--udg-*` | grid shell, table, header, body, toolbar, pagination, grid features, grid states | generic button/input/badge/card styles |
| `apps/docs` | `dv-docs-*` | docs shell, sidebar, markdown, metadata, code block presentation | package component styles |
| `examples/basic-playground` | `dv-playground-*` | demo layout and example helpers | package component styles |

## Split Policy

| Size | Action |
| --- | --- |
| Over 600 LOC | Review for ownership and possible split. |
| Over 1000 LOC | Split into package/component-group modules. |
| Over 3000 LOC | Must be split before further growth. |

Do not split tiny files just to mirror a theoretical folder tree. Create CSS files when a component or feature exists or when a module improves reviewability.

## Package Structure

`ui-core` styles should stay foundation-only:

- `reset.css`
- `tokens.css`
- `themes.css`
- `density.css`
- `utilities.css`
- `accessibility.css`

`ui-components` styles are grouped by component family:

- `base/`
- `actions/`
- `typography/`
- `forms/`
- `feedback/`
- `layout/`
- `navigation/`
- `overlays/`

`ui-data-grid` styles are grouped by grid concern:

- `tokens/`
- `layout/`
- `features/`
- `states/`
- `utilities/`

## Rules

- Keep static visual styling in CSS, not TSX.
- Use CSS variables for theming and instance dimensions.
- Preserve package-level import paths.
- Do not expose internal CSS modules as required public API.
- Do not duplicate generic component styling in docs, playground, or grid CSS.
- Map `--udg-*` variables to `--dv-*` fallbacks where practical.
- Persistent shell scrolling belongs to component CSS: `AppShell` owns the sidebar viewport with `dv-app-shell__sidebar-scroll`, and `SideNav` owns its list viewport with `dv-side-nav__scroll`.
- Persistent shell scrolling belongs to component CSS: `AppShell` owns the sidebar viewport with `dv-app-shell__sidebar-scroll`, and `SideNav` owns its list viewport with `dv-side-nav__scroll`.
- Persistent shell scrolling belongs to component CSS: `AppShell` owns the sidebar viewport with `dv-app-shell__sidebar-scroll`, and `SideNav` owns its list viewport with `dv-side-nav__scroll`.

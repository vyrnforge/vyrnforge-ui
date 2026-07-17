# VyrnForge UI - Coding Rules For AI

## Components

- Use TypeScript.
- Use native elements first.
- Support `className` and `style` when reasonable.
- Use accessible labels for icon-only controls.
- Use controlled/uncontrolled props for stateful components.
- Do not add global store dependencies.

## Styling

- Static styling belongs in CSS.
- TSX should use classes and dynamic CSS variables only.
- Use `dv-*` classes for shared components.
- Use `udg-*` classes for data grid only.
- Use `--dv-*` tokens for shared theme values.
- Use `--udg-*` variables for grid-specific styling.
- Map grid variables to `--dv-*` when practical.

## Data Grid

- Rows come from props.
- App owns fetching.
- Grid emits query/export contracts.
- Grid state must not include row data.
- Persistence stores preferences only.

## Docs

Use `docs/README.md` as the canonical index.

When changing public API:

- update package README
- update docs index if needed
- update playground examples
- update AI docs if rules changed

When a doc becomes outdated, archive it under `docs/archive/<yyyy-mm-topic>/` with a note pointing to the replacement.

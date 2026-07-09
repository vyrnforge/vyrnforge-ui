# Project Source Of Truth

## Canonical positioning

Dravyn UI is a **native-first enterprise UI foundation** for internal tools, admin portals, customer portals, data-heavy applications, and workflow systems.

Dravyn UI is not only a data grid package.

The data grid is the first strategic specialized component, but the project direction is broader:

- shared tokens
- reusable application components
- specialized enterprise data-management surfaces
- clean state contracts
- AI-friendly documentation and examples

## Package roles

| Package | Role | Owns | Does not own |
| --- | --- | --- | --- |
| `@dravyn/ui-core` | Shared foundation | tokens, themes, density, utilities, CSS variables | React components, data grid logic, app state |
| `@dravyn/ui-components` | Reusable UI layer | native React primitives, application components, shared `dv-*` styles | data-grid algorithms, backend data, global store |
| `@dravyn/ui-data-grid` | Specialized data package | UniversalDataGrid, grid state contracts, grid algorithms, adapters, `udg-*` styles | backend fetching, report generation, business workflows |

## Principles

- Native-first.
- CSS-variable theming.
- Dependency-minimal.
- Store-agnostic.
- Controlled/uncontrolled component state.
- Adapter-based persistence/server/export integration.
- Enterprise density.
- Accessibility by default.
- Data-management strength.

## Non-goals

Dravyn does not aim to be:

- a CSS framework replacement
- a Material Design clone
- an Ant Design clone
- a Tailwind requirement
- a Radix wrapper
- a TanStack wrapper
- a Redux framework
- a spreadsheet clone
- a BI/pivot/chart platform
- an export/report generation engine inside the grid

## North star

Dravyn should become the smallest credible enterprise UI foundation that can build a full data-heavy product interface without forcing teams into a large third-party design system.

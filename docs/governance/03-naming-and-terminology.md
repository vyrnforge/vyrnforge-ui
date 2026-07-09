# Naming And Terminology

## Project naming

| Item | Name |
| --- | --- |
| Project | Dravyn UI |
| Repository | `dravyn-ui` |
| Package scope | `@dravyn` |
| Core package | `@dravyn/ui-core` |
| Components package | `@dravyn/ui-components` |
| Data grid package | `@dravyn/ui-data-grid` |

## CSS prefixes

| Prefix | Owner | Usage |
| --- | --- | --- |
| `--dv-*` | `@dravyn/ui-core` | shared design tokens |
| `dv-*` | `@dravyn/ui-components` | shared component classes |
| `--udg-*` | `@dravyn/ui-data-grid` | grid-specific variables |
| `udg-*` | `@dravyn/ui-data-grid` | grid-specific classes |

## Terms

| Term | Meaning |
| --- | --- |
| Native-first | Prefer platform/native HTML behavior before custom abstractions. |
| Store-agnostic | Dravyn does not require Redux/Zustand/TanStack state. |
| Controlled state | App owns state through props and callbacks. |
| Uncontrolled state | Component owns local view state internally. |
| Adapter | Explicit integration boundary for persistence/server/export. |
| View state | UI state such as filters, sort, pagination, density, column setup. |
| Business state | App-owned state such as auth, API rows, permissions, tenant, export jobs. |

## Avoid terms

Avoid calling Dravyn:

- only a data-grid library
- a CSS framework
- a headless-only library
- a Redux UI framework
- a TanStack wrapper
- a MUI alternative in full scope

Dravyn is a focused enterprise UI foundation.

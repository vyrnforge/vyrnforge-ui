# Naming And Terminology

## Project naming

| Item | Name |
| --- | --- |
| Project | VyrnForge UI |
| Repository | `vyrnforge-ui` |
| Package scope | `@vyrnforge` |
| Core package | `@vyrnforge/ui-core` |
| Components package | `@vyrnforge/ui-components` |
| Data grid package | `@vyrnforge/ui-data-grid` |

## CSS prefixes

| Prefix | Owner | Usage |
| --- | --- | --- |
| `--vf-*` | `@vyrnforge/ui-core` | shared design tokens |
| `vf-*` | `@vyrnforge/ui-components` | shared component classes |
| `--udg-*` | `@vyrnforge/ui-data-grid` | grid-specific variables |
| `udg-*` | `@vyrnforge/ui-data-grid` | grid-specific classes |

## Terms

| Term | Meaning |
| --- | --- |
| Native-first | Prefer platform/native HTML behavior before custom abstractions. |
| Store-agnostic | VyrnForge does not require Redux/Zustand/TanStack state. |
| Controlled state | App owns state through props and callbacks. |
| Uncontrolled state | Component owns local view state internally. |
| Adapter | Explicit integration boundary for persistence/server/export. |
| View state | UI state such as filters, sort, pagination, density, column setup. |
| Business state | App-owned state such as auth, API rows, permissions, tenant, export jobs. |

## Avoid terms

Avoid calling VyrnForge:

- only a data-grid library
- a CSS framework
- a headless-only library
- a Redux UI framework
- a TanStack wrapper
- a MUI alternative in full scope

VyrnForge is a focused enterprise UI foundation.

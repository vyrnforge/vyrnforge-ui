# VyrnForge Positioning

VyrnForge UI is a native-first enterprise UI foundation for internal tools, admin portals, customer portals, data-heavy applications, and workflow systems.

VyrnForge UI is not only a data grid package. The data grid is the first strategic specialized component, but the product direction is broader: shared tokens, reusable application components, and specialized enterprise data-management surfaces.

## What VyrnForge Is

| Identity | Status | Meaning |
| --- | --- | --- |
| Data-grid library | Yes, but not only that | `@vyrnforge/ui-data-grid` provides a specialized enterprise grid. |
| Component library | Yes | `@vyrnforge/ui-components` provides reusable React primitives and application components. |
| Design system foundation | Yes | `@vyrnforge/ui-core` provides tokens, themes, density, and utilities. |
| Enterprise UI foundation | Primary positioning | The packages work together for dense business applications and workflow-heavy products. |
| CSS framework | No | VyrnForge does not aim to replace Bootstrap or Tailwind as a general CSS utility layer. |
| Headless primitive library | No | VyrnForge may expose controlled APIs, but it ships styled enterprise defaults. |
| App state framework | No | VyrnForge does not own global state, fetching, permissions, auth, or business workflows. |

## Package Roles

| Package | Role | Owns | Does not own |
| --- | --- | --- | --- |
| `@vyrnforge/ui-core` | Shared foundation | Tokens, themes, density, utilities, shared CSS variables | React components, grid logic, app state |
| `@vyrnforge/ui-components` | Reusable UI layer | Native React primitives, application components, shared `dv-*` styles | Data-grid behavior, backend data, global store |
| `@vyrnforge/ui-data-grid` | Specialized data-management package | UniversalDataGrid, grid state contracts, grid-specific algorithms, adapters, `udg-*` styles | App data fetching, report generation, business workflows |

## Principles

| Principle | Position |
| --- | --- |
| Native-first | Prefer browser-native elements and platform behavior before adding custom abstractions. |
| CSS variable theming | Use `--dv-*` shared tokens and `--udg-*` grid variables for scoped customization. |
| Dependency-minimal | Do not add heavy UI/runtime dependencies by default. |
| Store-agnostic | No Redux/Zustand/TanStack state dependency inside VyrnForge packages. |
| Controlled/uncontrolled state | Components can manage local view state or let apps fully control it. |
| Adapter-based integration | Persistence, server query, and export request behavior should flow through explicit contracts. |
| Enterprise density | Compact, standard, and comfortable density should support repeated operational use. |
| Accessibility by default | Native controls, keyboard support, labels, focus rings, and ARIA where needed. |
| Data-management strength | Search, filter, sort, pagination, selection, grouping, column setup, and future server/export/saved-view contracts. |

## Target Users

| User/team | VyrnForge value |
| --- | --- |
| Internal platform teams | Shared UI foundation without importing a large external design system. |
| Admin/product teams | Dense, predictable components for workflows and data management. |
| Backend-heavy teams building portals | Usable native controls with low dependency and styling overhead. |
| Teams with custom brand requirements | CSS variable theme layer without adopting Material, Ant, or Tailwind as the brand language. |
| Teams with Redux/RTK Query/custom data layers | Controlled state and adapter contracts without store coupling. |

## Positioning Against Major Categories

| Compared with | VyrnForge positioning |
| --- | --- |
| MUI / Ant Design / Chakra / Mantine | Smaller and more opinionated toward enterprise density and data workflows. Not trying to match total component count immediately. |
| Bootstrap / Tailwind Plus | More component/API focused than CSS-toolkit focused. Does not require utility-first authoring. |
| Radix / React Aria / Headless UI | Less headless; VyrnForge ships usable visual defaults. Should learn accessibility depth without taking dependency by default. |
| shadcn/ui | Versioned package model rather than copy-paste ownership. Should learn transparent, readable implementation. |
| TanStack Table | VyrnForge owns a styled grid, not only a headless engine. Should learn controlled state and row model clarity. |
| AG Grid / MUI X | Smaller enterprise grid scope. Should be good enough for common product workflows before chasing advanced spreadsheet/BI features. |

## Product Boundary

VyrnForge should optimize for:

- internal tools
- admin portals
- customer portals
- resource management
- operational dashboards
- workflow systems
- data-heavy product screens

VyrnForge should not optimize for:

- marketing landing pages as the primary use case
- replacing every CSS utility framework
- becoming a spreadsheet clone
- becoming a BI/pivot/chart platform
- owning app auth, permissions, tenants, API rows, or backend mutations
- forcing Redux, TanStack, Tailwind, MUI, Radix, or another framework on consumers

## Practical North Star

VyrnForge should become the smallest credible enterprise UI foundation that can build a full data-heavy product interface without forcing teams into a large third-party design system.

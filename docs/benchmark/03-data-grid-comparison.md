# Data Grid Comparison

VyrnForge's data grid sits between headless table engines and full enterprise grid platforms.

It should be more usable out of the box than TanStack Table, smaller and more design-system-neutral than MUI X, and much lighter in scope than AG Grid.

## Positioning

| Library | Grid type | Primary strength | Trade-off |
| --- | --- | --- | --- |
| VyrnForge UniversalDataGrid | Styled native-first enterprise grid | Fits VyrnForge tokens/components, dependency-minimal, controlled/uncontrolled, adapter-based | Not yet as feature-complete as AG Grid or MUI X advanced tiers |
| TanStack Table | Headless table engine | Powerful row models and controlled state without owning markup | Requires teams to build UI, accessibility, styling, density, and workflow surfaces |
| AG Grid | Full enterprise data grid | Deep feature set, performance, enterprise options | Larger conceptual/API surface, grid-first ecosystem, enterprise licensing for advanced features |
| MUI X Data Grid | Styled React/MUI data grid | Batteries-included grid integrated with MUI | Best fit when adopting MUI/MUI X styling and package model |
| Ant Design Table | Enterprise table component | Strong admin table defaults inside Ant ecosystem | Not a standalone grid foundation for VyrnForge's native-first package goals |
| Bootstrap table | CSS table styling | Simple responsive table styling | Not an interactive data-grid engine |

## Capability Matrix

| Capability | VyrnForge | TanStack Table | AG Grid | MUI X Data Grid | Ant Design Table |
| --- | --- | --- | --- | --- | --- |
| Styled grid UI | Yes | No | Yes | Yes | Yes |
| Headless engine option | No | Yes | No | No | No |
| Native table rendering | Yes | App choice | Grid-managed | Grid-managed | Table component |
| Global search | Yes | App/row model | Yes | Yes | App/filter model |
| Column filters | State/core support; advanced UI planned | Strong engine | Strong | Strong | Strong |
| Sorting | Yes | Strong | Strong | Strong | Strong |
| Pagination | Yes | Strong | Strong | Strong | Strong |
| Column visibility | Yes | Strong | Strong | Strong | Strong |
| Column order/reorder | Yes | Strong engine | Strong | Strong | Partial/varies |
| Column resizing | Yes | Strong engine | Strong | Strong | Partial/varies |
| Row selection | Yes | Strong engine | Strong | Strong | Strong |
| Bulk action bar | Yes | App-built | App/grid patterns | App-built | App-built |
| Grouping | Yes | Strong engine | Strong | Advanced | Limited/expandable patterns |
| Aggregation | Contract/types started | Strong engine | Strong | Advanced | Summary patterns |
| Virtualization | Planned | Pair with TanStack Virtual | Strong | Strong | Limited/virtual list patterns |
| Server mode | Planned adapter/query contract | Strong controlled model | Strong | Strong | App-controlled |
| Export files | Request contract only | App-owned | Strong | Built-in/export features | App-owned/extensions |
| Saved views | Planned adapter model | App-owned | Enterprise/app-owned patterns | App-owned | App-owned |
| Accessibility ownership | VyrnForge owns grid UI | App owns markup quality | Grid owns UI | Grid owns UI | Component owns table UI |
| Dependency footprint | Minimal | Engine dependency | Dedicated grid packages | MUI X/MUI ecosystem | Ant ecosystem |
| Best use case | VyrnForge enterprise apps needing a package-native grid | Teams designing their own table UI | Feature-heavy grid products | MUI-based products | Ant-based admin apps |

## What VyrnForge Should Learn

| Source | Lesson |
| --- | --- |
| TanStack Table | Keep state explicit and controllable. Separate row models and pure logic from React rendering. Avoid hiding data transforms inside components. |
| AG Grid | Enterprise users expect keyboard support, column tools, density, export, saved views, performance, and clear feature docs. |
| MUI X Data Grid | Good defaults matter. A grid should be useful before every slot is customized. |
| Ant Design Table | Admin tables need practical actions, filters, pagination, and empty/loading states integrated as normal workflow pieces. |

## Where VyrnForge Should Differ

| Source | Intentional difference |
| --- | --- |
| TanStack Table | VyrnForge should not require every app to rebuild table markup and styling from scratch. |
| AG Grid | VyrnForge should not chase spreadsheet, BI, pivot, charting, or massive enterprise feature scope early. |
| MUI X Data Grid | VyrnForge should not require MUI theming or Material visual language. |
| Ant Design Table | VyrnForge should not couple the grid to a large all-in-one UI ecosystem. |

## Near-Term Grid Priorities

1. Server query mode with lazy/fetching state.
2. Export request contract polish, not file generation.
3. Saved views adapter contract.
4. Advanced filter drawer.
5. Virtualization/performance only after server/export/saved-view contracts are stable.
6. Accessibility QA across keyboard, resize, reorder, grouping, and selection flows.

## Non-Goals

VyrnForge UniversalDataGrid should not become:

- a spreadsheet clone
- a BI pivot engine
- a charting package
- an export/report generator
- a TanStack wrapper
- an AG Grid clone
- a MUI X re-skin

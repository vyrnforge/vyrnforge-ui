# Component Coverage Comparison

Legend:

- Current: available in Dravyn today.
- Planned: named in the Dravyn roadmap, not yet stable.
- Partial: available with limited scope or only as a pattern.
- External: usually solved by another package in that ecosystem.
- N/A: not a goal for that library/category.

## Coverage Matrix

| Area | Dravyn | MUI | AntD | Chakra | Mantine | Bootstrap | Radix | React Aria | shadcn | TanStack Table | AG Grid |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tokens/themes | Current | Strong | Strong | Strong | Strong | Strong | N/A | External | Strong | N/A | Grid themes |
| Typography | Current | Strong | Strong | Strong | Strong | Strong | N/A | External | Current | N/A | N/A |
| Buttons/actions | Current | Strong | Strong | Strong | Strong | Strong | Primitive | Current | Current | N/A | Grid actions |
| Icon button/action controls | Current | Strong | Strong | Strong | Strong | Partial | Primitive | Current | Current | N/A | Grid actions |
| Badge/status | Current | Strong | Strong | Strong | Strong | Strong | N/A | External | Current | N/A | N/A |
| Form field wrapper | Current | Strong | Strong | Strong | Strong | Strong | Primitive | Current | Current | N/A | Grid editors |
| Text input/search/select | Current | Strong | Strong | Strong | Strong | Strong | Primitive | Current | Current | N/A | Grid filters/editors |
| Checkbox/radio/switch | Checkbox current, radio/switch planned | Strong | Strong | Strong | Strong | Strong | Primitive | Current | Current | N/A | Grid selection |
| Textarea | Current | Strong | Strong | Strong | Strong | Strong | N/A | Current | Current | N/A | Grid editors |
| Date/time input | Planned | Strong | Strong | Strong | Strong | Partial | N/A | Strong | Current | N/A | Grid filters/editors |
| Multi-select/combobox | Planned | Strong | Strong | Strong | Strong | Partial | Primitive | Strong | Current | N/A | Grid filters/editors |
| Layout primitives | Current, more planned | Strong | Strong | Strong | Strong | Strong | N/A | External | Current | N/A | Grid layout only |
| App shell/navigation | Planned | Strong | Strong | Partial | Strong | Strong | Primitive | External | Current | N/A | N/A |
| Tabs | Planned | Strong | Strong | Strong | Strong | Strong | Primitive | Current | Current | N/A | N/A |
| Popover/menu/dropdown | Current | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Current | N/A | Grid menus |
| Tooltip | Current | Strong | Strong | Strong | Strong | Strong | Primitive | Current | Current | N/A | Grid tooltip |
| Dialog/drawer/confirm | Current | Strong | Strong | Strong | Strong | Modal/offcanvas | Primitive | Current | Current | N/A | Grid dialogs |
| Toast/notification | Planned | Strong | Strong | Strong | Strong | Toast | N/A | External | Current | N/A | N/A |
| Alert/inline message | Current | Strong | Strong | Strong | Strong | Strong | N/A | External | Current | N/A | N/A |
| Skeleton/loading/empty/error | Current | Strong | Strong | Strong | Strong | Partial | N/A | External | Current | N/A | Grid overlays |
| Progress | Planned | Strong | Strong | Strong | Strong | Strong | Primitive | Current | Current | N/A | N/A |
| Data table | UniversalDataGrid current | Basic table + MUI X | Strong Table | Basic table | Strong table | Basic table | N/A | Table primitives | Data table examples | Core purpose | Core purpose |
| Enterprise data grid | Current, growing | MUI X | Table/Pro ecosystem | External | External | N/A | N/A | Build yourself | Usually TanStack-based | Headless engine | Strong |
| Column visibility/order/resize | Current | MUI X | Partial/strong table features | External | Partial | N/A | N/A | Build yourself | Usually TanStack-based | Strong engine | Strong |
| Row selection/bulk actions | Current | MUI X | Strong | External | Partial | N/A | N/A | Build yourself | Usually TanStack-based | Strong engine | Strong |
| Grouping | Current | MUI X paid/advanced | Partial/Pro patterns | External | Partial | N/A | N/A | Build yourself | Usually TanStack-based | Strong engine | Strong |
| Server query contract | Planned/adapter contract started | MUI X server modes | App/table callbacks | App-owned | App-owned | N/A | N/A | App-owned | App-owned | Strong controlled model | Strong |
| Export request contract | Adapter contract started | MUI X export | Ant table/export patterns | External | External | N/A | N/A | App-owned | App-owned | App-owned | Strong/export features |
| Saved views | Planned | App-owned | Pro/app patterns | App-owned | App-owned | N/A | N/A | App-owned | App-owned | App-owned | Enterprise patterns |
| Workflow components | Planned | Partial | Strong ecosystem | Partial | Partial | N/A | N/A | N/A | Blocks | N/A | N/A |
| Charts | Not planned now | MUI X Charts | AntV ecosystem | Chakra Charts | External | N/A | N/A | N/A | Charts registry | N/A | AG Charts separate |

## Dravyn Current Strengths

- Shared core tokens and CSS variable theming.
- Dense action, form, feedback, layout, and overlay primitives.
- Specialized grid with search, sorting, pagination, column management, resizing, selection, grouping, persistence contracts, server query contracts, and export request contracts.
- Store-agnostic controlled/uncontrolled state.
- Native-first components with accessible labels and keyboard-friendly behavior.

## Dravyn Coverage Gaps

| Gap | Why it matters | Priority |
| --- | --- | --- |
| Tabs and navigation | Common for admin portals and data-heavy workflows | High |
| Page shell/header/sidebar patterns | Needed to build complete products, not just components | High |
| Radio, switch, number/date input, multi-select | Completes basic form coverage | High |
| Toast/progress | Common feedback primitives | Medium |
| Description/key-value/resource lists | Enterprise read-only data display | Medium |
| Advanced filters and saved views | Grid workflow maturity | Medium/high after server/export contracts |
| Command palette | Valuable but not foundational | Later |
| Wizard/audit/diff/workflow surfaces | Important for workflow systems, but should follow repeated product needs | Later |
| Charts | Better handled later or by separate package/ecosystem | Not now |

## Recommendation

Dravyn should not attempt to match MUI, Ant Design, Chakra, or Mantine component counts in the short term. The correct comparison is not raw volume. Dravyn should prioritize the smallest set of components needed to build complete enterprise workflows:

1. App shell and navigation.
2. Form completeness.
3. Data display primitives.
4. Grid server/export/saved-view maturity.
5. Accessibility and QA hardening across overlays, menus, and grid interactions.

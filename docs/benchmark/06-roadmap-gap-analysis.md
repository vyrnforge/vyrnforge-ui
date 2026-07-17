# Roadmap Gap Analysis

This gap analysis uses the benchmark comparison to prioritize VyrnForge's next work.

## What VyrnForge Already Has

| Area | Current assets |
| --- | --- |
| Package structure | `@vyrnforge/ui-core`, `@vyrnforge/ui-components`, `@vyrnforge/ui-data-grid` |
| Theme foundation | Shared `--vf-*` tokens, light/dark/system/enterprise themes, density tokens, utilities |
| Component primitives | Buttons, icon buttons, toolbar buttons, segmented control, typography, badges, field/input/select/checkbox/textarea, feedback states, card/panel/stack/inline/section, popover/menu/dropdown/tooltip/dialog/drawer/confirm dialog |
| Grid foundation | Native table grid, search, filters state/core logic, sorting, pagination, column management, resizing, selection, bulk actions, grouping, persistence, server query builder, export request builder |
| Architecture | State ownership docs, package boundaries, clean architecture folders, adapter boundaries, Redux policy |
| Design direction | Native-first, dependency-minimal, CSS variable theming, store-agnostic, controlled/uncontrolled |

## Missing Or Weak Areas

| Gap | Impact | Benchmark pressure |
| --- | --- | --- |
| App shell/navigation | Hard to build complete admin portals using VyrnForge alone | MUI, AntD, Mantine, Bootstrap, shadcn |
| Tabs/breadcrumbs/sidebar/top nav | Common enterprise navigation missing from stable set | MUI, AntD, Bootstrap, shadcn |
| Form completion | Radio, switch, number/date input, multi-select, combobox not complete | MUI, AntD, Chakra, Mantine, React Aria |
| Data display primitives | Description list, key/value list, property table, timeline, resource list missing | AntD, Mantine, shadcn |
| Progress | Common feedback loop still missing after Toast foundation | MUI, AntD, Chakra, Mantine, Bootstrap, shadcn |
| Overlay robustness | Positioning/collision/portal/focus trap still limited | Radix, React Aria, Headless UI |
| Grid server mode | Adapter contract exists, full server mode not built | TanStack Table, AG Grid, MUI X |
| Grid saved views | Not built | Enterprise grid expectations |
| Advanced filtering | Not built | AG Grid, MUI X, AntD Pro-style workflows |
| Virtualization/performance | Not built | TanStack Virtual, AG Grid, MUI X |
| Accessibility QA depth | Needs systematic keyboard/screen reader testing | React Aria, Radix, AG Grid |
| Public docs/API examples | Needs more task-based examples | All mature libraries |

## Priority Recommendations

### P0: Stabilize The Foundation

| Work | Reason |
| --- | --- |
| Finish public architecture/docs alignment | Makes package roles and state ownership clear before feature growth |
| Add component examples for all current primitives | Makes current coverage usable and testable |
| Create token and CSS variable reference docs | Reduces styling confusion and protects backward compatibility |
| Add overlay QA checklist | Prevents regressions in menu/popover/dialog/drawer behavior |

### P1: Complete Core Enterprise App Components

| Work | Reason |
| --- | --- |
| Tabs | Common dense workflow navigation |
| Breadcrumbs | Admin/customer portal orientation |
| SideNav/TopNav/AppShell | VyrnForge must prove it is broader than a grid |
| Radio/Switch/NumberInput/DateInput/MultiSelect | Completes normal enterprise forms |
| Progress | Completes feedback basics after Toast foundation |
| DescriptionList/KeyValueList/PropertyTable | Common read-only enterprise data display |

### P2: Advance Data-Management Workflows

| Work | Reason |
| --- | --- |
| Server mode and lazy/fetching states | Required for real API-backed grids |
| Export request polish | Prepares export workflows without adding file generators |
| Saved views adapter | High-value enterprise grid preference workflow |
| Advanced filter drawer | Needed for dense data apps after server contracts are clear |
| Grid accessibility hardening | Required before release confidence |

### P3: Performance And Advanced Patterns

| Work | Reason |
| --- | --- |
| Optional virtualization | Needed only after real large-data pressure |
| Command palette | Useful for power users, but not foundational |
| Workflow components | Wizard, audit trail, diff viewer should follow real repeated product use |
| Registry/playground examples | Helpful after APIs stabilize |

## What Should Not Be Built Yet

| Avoid | Why |
| --- | --- |
| Charting package | Not core to current VyrnForge positioning; can integrate external chart packages later |
| Spreadsheet clone features | Would pull grid toward AG Grid/Excel scope too early |
| BI pivot engine | Too broad and not aligned with current enterprise UI foundation phase |
| Built-in Redux adapter package | Controlled props already support Redux; wait for repeated integration pain |
| Required Tailwind/MUI/Radix/TanStack dependency | Violates native-first, dependency-minimal positioning |
| Full export generation engine | Grid should emit export requests; apps or future packages can generate files |
| Broad workflow suite before app shell/forms | Workflow components need proven repeated use cases |

## Success Criteria For Next Phase

VyrnForge should be considered well-positioned when a team can build a realistic admin/customer portal using only VyrnForge packages for:

- theme and density
- page shell and navigation
- forms and validation surfaces
- feedback and overlays
- read-only data display
- data grid with server query/export/saved-view contracts
- controlled integration with app-owned state and APIs

The benchmark does not suggest copying any one library. It suggests a focused path: AntD-level enterprise sensibility, Radix/React Aria-level accessibility discipline, TanStack-level state clarity, and VyrnForge's own native-first dependency-minimal implementation.

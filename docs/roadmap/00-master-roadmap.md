# VyrnForge UI Master Roadmap

## Execution principle

VyrnForge should not become only a data-grid project. The roadmap balances:

1. foundation stabilization
2. complete enterprise app components
3. data-management workflows
4. accessibility and performance hardening
5. release maturity

## Sprint plan

| Sprint | Name | Goal |
| --- | --- | --- |
| S0 | Baseline Freeze | Validate repo, package names, build, tests, docs. |
| S1 | Public Docs + Token Reference | Create stable token/API/reference docs for humans and AI. |
| S2 | App Shell + Navigation | AppShell, Page, PageHeader, SideNav, TopNav, Breadcrumbs, Tabs. |
| S3 | Form Completion | Radio, Switch, NumberInput, DateInput, DateTimeInput, MultiSelect. |
| S4 | Feedback System | Toast, ProgressBar, ProgressCircle, InlineMessage polish. |
| S5 | Data Display Primitives | DescriptionList, KeyValueList, PropertyTable, ResourceList, Timeline, ActivityLog. |
| S6 | Overlay Robustness | Portal, focus return, simple focus trap, viewport placement, QA checklist. |
| S7 | Data Grid Server Mode | Server query mode, lazy placeholders, loading/fetching, totalRows. |
| S8 | Export Request + Preview Shell | Export request scope/format/preview, no file generation by default. |
| S9 | Saved Views | Save/rename/delete/default views with adapter contracts. |
| S10 | Advanced Filter Drawer | AND/OR, ranges, multi-condition filters. |
| S11 | Accessibility + QA Hardening | Keyboard/screen reader/contrast/reduced motion QA. |
| S12 | Performance + Optional Virtualization | Profiling, memoization, optional row windowing. |
| S13 | Release Hardening | Changelog, migration, npm pack test, API docs, CI. |
| S14 | Advanced Patterns Later | Command palette, wizard, audit trail, diff viewer, impact preview. |

## Near-term priority

Do S1-S6 before deep grid-only work if the goal is to prove VyrnForge as a full UI foundation.

## Data-grid continuation

After S6, continue:

1. server mode
2. export request preview
3. saved views
4. advanced filters
5. accessibility hardening
6. performance/virtualization

---
title: S8 Non-Grid Beta Scope Audit
status: Evidence Complete
owner: Architecture
last_reviewed: 2026-08-03
canonical: true
task: BT-8001
quality_gate: GBETA
---

# S8 Non-Grid Beta Scope Audit

## Decision

BT-8001 freezes the component boundary for the first VyrnForge non-grid
multi-framework beta. The canonical machine-readable decision is
[`docs/metadata/non-grid-beta-scope.json`](../metadata/non-grid-beta-scope.json).

The beta scope contains **67 public non-grid components** from
`@vyrnforge/ui-components`, mapped to **58 native Custom Element tags** in
`@vyrnforge/ui-elements`. React and native HTML remain the first-class
renderers. Angular and Vue remain verified consumers of the same native
contracts under GMF4.

This is a scope decision only. It does not claim that the release candidate is
publishable. BT-8002 through BT-8014 still own versioning, package verification,
size budgets, compatibility, security, external configuration, application
canaries, final accessibility, documentation, publication, and exit approval.

## Included release group

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`
- `@vyrnforge/ui-components`
- `@vyrnforge/ui-elements`

`@vyrnforge/ui-data-grid` remains an independent React alpha package and is
not promoted with the non-grid beta release group.

## Component inventory

| Category     |  Count | Included public components                                                                                                                                                                                                                  |
| ------------ | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitive    |     20 | Button, ButtonGroup, Caption, ClearButton, CloseButton, CodeText, Heading, Icon, IconButton, Label, MoreButton, RefreshButton, SegmentedControl, Text, ToastAction, ToastProvider, ToggleButton, ToggleButtonGroup, ToolbarButton, useToast |
| Form control |     17 | Autocomplete, Checkbox, DateInput, DateTimeInput, Field, MultiSelect, NumberInput, Radio, RadioGroup, Rating, SearchInput, Select, Slider, Switch, TextInput, Textarea, ValidationMessage                                                   |
| Feedback     |      9 | Alert, Badge, EmptyState, ErrorState, InlineMessage, LoadingState, Skeleton, StatusBadge, Toast                                                                                                                                             |
| Composite    |      8 | Card, Inline, Page, PageHeader, PageToolbar, Panel, Section, Stack                                                                                                                                                                          |
| Overlay      |      7 | ConfirmDialog, Dialog, Drawer, Dropdown, Menu, Popover, Tooltip                                                                                                                                                                             |
| Navigation   |      5 | AppShell, Breadcrumbs, SideNav, Tabs, TopNav                                                                                                                                                                                                |
| Data display |      1 | TransferList                                                                                                                                                                                                                                |
| **Total**    | **67** | Every package-root public non-grid export is included.                                                                                                                                                                                      |

The complete per-component list, renderer mapping, maturity, documentation
path, evidence state, limitations, and decision rationale are recorded in the
canonical JSON manifest rather than duplicated in this document.

## Explicit exclusions

### Data grid

Ten public `@vyrnforge/ui-data-grid` exports remain deferred with the grid's
independent React alpha track:

- UniversalDataGrid
- DataGridToolbar
- DataGridColumnMenu
- useDataGridState
- DataGridSearch
- DataGridFilterBar
- DataGridSkeletonRows
- DataGridEmptyState
- DataGridErrorState
- DataGridPagination

### Non-public planned surfaces

Progress, DescriptionList, KeyValueList, PropertyTable, ResourceList, Timeline,
and ActivityLog remain planned and are not package-root public exports. They do
not receive a beta support claim.

`ToastViewport` remains an internal implementation surface.

### Platforms

React Native, Flutter, native Android, native iOS, and desktop-native renderers
remain outside the first web beta program.

## Maturity decision

**No component maturity is promoted by BT-8001.** All 67 included components
retain their canonical `experimental` maturity in
`docs/metadata/components.json`. Scope inclusion means the component is part of
the beta release candidate boundary; it does not replace the component maturity
model or waive its evidence requirements.

## Framework decision

- React: first-class renderer through `@vyrnforge/ui-components`.
- Native HTML: first-class renderer through `@vyrnforge/ui-elements`.
- Angular: GMF4-verified consumer of `@vyrnforge/ui-elements`.
- Vue: GMF4-verified consumer of `@vyrnforge/ui-elements`.
- Angular Forms and Vue `v-model`: thin reference adapters over shared native
  contracts, not new published component libraries.

The component catalog now records Angular and Vue as `verified-consumer` and
links each public component mapping to `docs/metadata/gmf4-closure.json`.

## Cross-cutting release gaps

### Internationalization and RTL

The current component catalog has no canonical per-component
internationalization or RTL evidence field. BT-8001 does not invent a support
claim. BT-8012 must document string ownership, locale-sensitive formatting
ownership, directionality expectations, and known limitations before beta
publication.

### Responsive and reflow

The scope is frozen, but final responsive and integration evidence remains a
release concern. BT-8005 must cover the supported compatibility matrix, while
BT-8009 and BT-8010 must validate real application layouts, forms, overlays,
themes, and upgrade behavior.

## Acceptance result

- Every public non-grid component is included: **passed**.
- Every excluded or deferred public surface has a rationale: **passed**.
- React/native mappings are current: **passed**.
- Angular/Vue component metadata reflects GMF4 verification: **passed**.
- Canonical maturity remains explicit and unpromoted: **passed**.
- Release-group membership excludes the data grid: **passed**.
- Scope blockers: **none**.
- Next task unlocked: **BT-8002 — Set beta release groups and versions**.

## Verification

```bash
npm run generate:beta-scope
npm run test:beta-scope
npm run verify:beta-scope
npm run generate:component-reference
npm run verify:component-reference
npm run verify:component-metadata
npm run verify:component-maturity
npm run verify:gmf4-closure
npm run verify:metadata
```

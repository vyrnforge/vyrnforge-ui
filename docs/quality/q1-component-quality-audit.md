# Q1 Component Quality Audit

Audit date: 2026-07-18.

This is the CI-004 source-of-truth audit report for the VyrnForge UI public surface. CI-006 records the focused resolution of Q1-P1-001 below; it changes only the affected pre-alpha data-grid hook exports, documentation, metadata, consumer verification, and tests.

## Executive Summary

| Area | Result |
| --- | --- |
| Branch reviewed | `audit/q1-component-quality` |
| Public package entry points reviewed | `@vyrnforge/ui-core`, `@vyrnforge/ui-components`, `@vyrnforge/ui-data-grid` |
| Public named exports reviewed | 337 unique named exports after CI-006 hook disposition |
| Public CSS entry points reviewed | 9 package export-map CSS paths |
| Confirmed P0 findings | 0 |
| Confirmed P1 findings | 0 active; Q1-P1-001 resolved by CI-006 |
| Confirmed P2 findings | 6 |
| Confirmed P3 findings | 1 |
| Alpha recommendation | The public-hook classification blocker is resolved. P2/P3 items can remain in the alpha backlog if documented as known limitations. |

No runtime crash, data-loss issue, destructive behavior, broken package import, or unusable public CSS import was found through the available automated evidence. CI-006 resolved the former public-hook governance blocker by retaining one documented experimental hook and withdrawing four internal coordination hooks from the package root.

## Scope And Methodology

Reviewed evidence:

- package manifests and export maps in `packages/ui-core/package.json`, `packages/ui-components/package.json`, and `packages/ui-data-grid/package.json`;
- public TypeScript entry points in `packages/*/src/index.ts`;
- public CSS entry points exported as `./styles/index.css`, `./style.css`, and `./index.css`;
- docs under `docs/api/`, `docs/packages/`, `docs/metadata/`, `docs/quality/`, and `docs/roadmap/`;
- playground route registry in `examples/basic-playground/src/app/routes.ts`;
- external consumer fixture in `tests/package-consumer/src/main.tsx`;
- package tests under `packages/ui-components/src/components/__tests__/` and `packages/ui-data-grid/src/**.test.ts`;
- current repository commands listed in the validation section.

Audit limits:

- This audit did not use a browser or assistive technology session.
- Browser-only focus loops, portal stacking, sticky scroll behavior, pointer drag behavior, visual clipping, contrast, and responsive layout are marked as manual review where automation cannot prove them.
- Planned components are classified from docs and metadata only; they are not treated as implemented public exports unless present in package entry points.

## Severity Definitions

| Severity | Definition |
| --- | --- |
| P0 | Release blocking: crash, data loss, inaccessible primary interaction, keyboard dead end, broken form submission, unusable public API/CSS import, or critical security/privacy issue. |
| P1 | Major alpha-quality issue: misleading/incomplete public API, major controlled/uncontrolled defect, major state sync defect, incorrect ARIA for primary interaction, major theme/responsive failure, or missing meaningful tests for primary behavior. |
| P2 | Important improvement: incomplete docs/examples/tests, secondary accessibility gap, edge-state gap, token inconsistency, moderate layout risk, or API ergonomics issue with workaround. |
| P3 | Polish or future enhancement: minor wording, optional convenience, non-blocking consistency improvement, or future optimization. |

## Public Surface Summary

| Package | Public JS entry | Public CSS entries | Unique named exports | Value exports | Type exports |
| --- | --- | --- | ---: | ---: | ---: |
| `@vyrnforge/ui-core` | `.` | `./styles/index.css`, `./style.css`, `./index.css` | 14 | 8 | 6 |
| `@vyrnforge/ui-components` | `.` | `./styles/index.css`, `./style.css`, `./index.css` | 198 | 69 | 129 |
| `@vyrnforge/ui-data-grid` | `.` | `./styles/index.css`, `./style.css`, `./index.css` | 129 | 79 | 50 |
| Total | 3 JS entries | 9 CSS entries | 341 | 156 | 185 |

## Complete Public Inventory

This inventory groups related public exports by audit unit. All named public exports from package root entry points are also listed in the appendix.

Legend:

- Docs: `Full`, `Partial`, `Missing`, or `Planned`.
- Playground: `Full`, `Partial`, `Pattern`, `None`, or `N/A`.
- Tests: `Meaningful`, `Partial`, `Missing`, or `N/A`.
- Result: `Pass`, `Gap`, or `Manual review required`.

| Package | Export / audit unit | Category | Public entry point | Docs | Playground | Tests | Declared maturity | Recommended maturity | Audit result | Highest severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@vyrnforge/ui-core` | Theme tokens and theme helpers (`createVyrnForgeTheme`, `mergeVyrnForgeTheme`, `toVyrnForgeThemeStyle`, presets, theme types) | Core foundation | `@vyrnforge/ui-core` and CSS entries | Full | Full | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-core` | Density tokens (`VyrnForgeDensity`, density CSS variables) | Core foundation | `@vyrnforge/ui-core` and CSS entries | Full | Full | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-core` | Utility classes (`vf-text-muted`, `vf-text-strong`, `vf-truncate`, `vf-sr-only`, `vf-focus-ring`) | Core utilities | CSS entries | Full | Partial | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Button | Action | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | IconButton | Action | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | `CloseButton`, `ClearButton`, `RefreshButton`, `MoreButton` | Action aliases | `@vyrnforge/ui-components` | Partial | Pattern | Partial | stable by package README | stable | Gap | P2 |
| `@vyrnforge/ui-components` | ToolbarButton | Action | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | ButtonGroup | Action | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | SegmentedControl | Action | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | ToggleButton | Action | `@vyrnforge/ui-components` | Full with duplicate rows | Full | Meaningful | experimental | experimental | Gap | P2 |
| `@vyrnforge/ui-components` | ToggleButtonGroup | Action | `@vyrnforge/ui-components` | Full with duplicate rows | Full | Meaningful | experimental | experimental | Gap | P2 |
| `@vyrnforge/ui-components` | Icon | Icon primitive | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Text | Typography | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Heading | Typography | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Label | Typography | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Caption | Typography | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | CodeText | Typography | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Field | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | ValidationMessage | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | TextInput | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | SearchInput | Form | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | Select | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | Checkbox | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | Radio | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | RadioGroup | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | Switch | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | NumberInput | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | DateInput | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | DateTimeInput | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | Textarea | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Pass | P2 |
| `@vyrnforge/ui-components` | Rating | Form | `@vyrnforge/ui-components` | Full with duplicate rows | Full | Meaningful | experimental | experimental | Gap | P2 |
| `@vyrnforge/ui-components` | Slider | Form | `@vyrnforge/ui-components` | Full with duplicate rows | Full | Meaningful | experimental | experimental | Gap | P2 |
| `@vyrnforge/ui-components` | MultiSelect | Form | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | Autocomplete | Form | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | TransferList | Data management | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | Badge | Feedback | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | StatusBadge | Feedback | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Alert / InlineMessage | Feedback | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Toast / ToastAction / ToastProvider / useToast | Feedback | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | ToastViewport | Feedback implementation surface | `@vyrnforge/ui-components` | Missing as direct consumer API | None | Meaningful | exported | internal | Gap | P2 |
| `@vyrnforge/ui-components` | EmptyState | Feedback | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | ErrorState | Feedback | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | LoadingState | Feedback | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Skeleton | Feedback | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Card | Layout | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Panel | Layout | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Stack | Layout | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Inline | Layout | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | Section | Layout | `@vyrnforge/ui-components` | Full | Pattern | Partial | stable | stable | Pass | P3 |
| `@vyrnforge/ui-components` | AppShell | Layout / navigation shell | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | Page | Layout / app primitive | `@vyrnforge/ui-components` | Partial | Pattern | Partial | experimental | experimental | Gap | P2 |
| `@vyrnforge/ui-components` | PageHeader | Layout / app primitive | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | PageToolbar | Layout / app primitive | `@vyrnforge/ui-components` | Partial | Pattern | Partial | experimental | experimental | Gap | P2 |
| `@vyrnforge/ui-components` | SideNav | Navigation | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | TopNav | Navigation | `@vyrnforge/ui-components` | Partial | Pattern | Partial | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | Breadcrumbs | Navigation | `@vyrnforge/ui-components` | Full | Pattern | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | Tabs | Navigation | `@vyrnforge/ui-components` | Full | Full | Meaningful | experimental | experimental | Manual review required | P2 |
| `@vyrnforge/ui-components` | Popover | Overlay | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-components` | Menu | Overlay | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-components` | Dropdown | Overlay | `@vyrnforge/ui-components` | Full | Full | Partial | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-components` | Tooltip | Overlay | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-components` | Dialog | Overlay | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-components` | Drawer | Overlay | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-components` | ConfirmDialog | Overlay | `@vyrnforge/ui-components` | Full | Full | Meaningful | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-components` | Planned data-display components (`Progress`, `DescriptionList`, `KeyValueList`, `PropertyTable`, `ResourceList`, `Timeline`, `ActivityLog`) | Planned | Not exported | Planned | Pattern | N/A | planned | planned | Pass | P3 |
| `@vyrnforge/ui-data-grid` | UniversalDataGrid | Data grid component | `@vyrnforge/ui-data-grid` | Full | Full | Meaningful | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-data-grid` | DataGridToolbar | Grid component | `@vyrnforge/ui-data-grid` | Partial | Pattern | Partial | stable | stable | Pass | P2 |
| `@vyrnforge/ui-data-grid` | DataGridSearch | Grid component | `@vyrnforge/ui-data-grid` | Partial / metadata gap | Pattern | Partial | stable | stable | Gap | P2 |
| `@vyrnforge/ui-data-grid` | DataGridFilterBar | Grid component | `@vyrnforge/ui-data-grid` | Partial / metadata gap | Pattern | Partial | stable | stable | Gap | P2 |
| `@vyrnforge/ui-data-grid` | DataGridColumnMenu | Grid component | `@vyrnforge/ui-data-grid` | Full | Pattern | Partial | stable | stable | Manual review required | P2 |
| `@vyrnforge/ui-data-grid` | DataGridSkeletonRows | Grid component | `@vyrnforge/ui-data-grid` | Partial / metadata gap | Pattern | Partial | stable | stable | Gap | P2 |
| `@vyrnforge/ui-data-grid` | DataGridEmptyState | Grid component | `@vyrnforge/ui-data-grid` | Partial / metadata gap | Pattern | Partial | stable | stable | Gap | P2 |
| `@vyrnforge/ui-data-grid` | DataGridErrorState | Grid component | `@vyrnforge/ui-data-grid` | Partial / metadata gap | Pattern | Partial | stable | stable | Gap | P2 |
| `@vyrnforge/ui-data-grid` | DataGridPagination | Grid component | `@vyrnforge/ui-data-grid` | Partial / metadata gap | Pattern | Partial | stable | stable | Gap | P2 |
| `@vyrnforge/ui-data-grid` | Grid state (`createGridState`, defaults, reducer, actions, merge, selector, state types) | State contract | `@vyrnforge/ui-data-grid` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Search, filtering, sorting, pagination helpers | Pure helpers | `@vyrnforge/ui-data-grid` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Grouping helpers | Pure helpers | `@vyrnforge/ui-data-grid` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Column sizing helpers | Pure helpers | `@vyrnforge/ui-data-grid` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Column filters and column management helpers | Pure helpers | `@vyrnforge/ui-data-grid` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Row selection helpers | Pure helpers | `@vyrnforge/ui-data-grid` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Persistence, server-query, and export-request adapters | Adapter contracts | `@vyrnforge/ui-data-grid` | Full | Pattern | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Data-grid theme helpers and presets | Theme helpers | `@vyrnforge/ui-data-grid` | Full | Full | Meaningful | stable | stable | Pass | P3 |
| `@vyrnforge/ui-data-grid` | Data-grid hooks (`useDataGridState` public; resize/reorder/controlled/debounce hooks internal) | Hooks | `@vyrnforge/ui-data-grid` | Full for `useDataGridState`; internal hooks intentionally undocumented | Public root import and packed consumer for `useDataGridState`; internal source use only otherwise | Meaningful public contract test | experimental / internal | experimental public / internal | Pass | P1 resolved |
| `@vyrnforge/ui-data-grid` | Planned grid features (`DataGridBulkActionBar`, `AdvancedFilterDrawer`, `SavedViewSelector`, `ExportPreviewPanel`) | Planned | Not exported | Planned | None | N/A | planned | planned | Pass | P3 |

## Component-Level Findings

### Q1-P1-001: Public data-grid hooks lacked current support classification (resolved by CI-006)

- Severity: P1
- Package: `@vyrnforge/ui-data-grid`
- Component or feature: `useColumnResize`, `useColumnReorder`, `useControlledState`, `useDataGridState`, `useDebouncedValue`
- Category: Public API governance
- Historical evidence: These hooks were exported from `packages/ui-data-grid/src/index.ts`, but current docs/metadata did not describe their supported contract. `rg` found the hooks only in source/internal use and archived stability notes, not current API docs.
- User impact: Consuming apps may treat coordination hooks as stable public APIs even though support boundaries, callback behavior, and intended ownership are not documented.
- Resolution: CI-006 retains `useDataGridState` as the sole supported experimental package-root hook. `useColumnResize`, `useColumnReorder`, `useControlledState`, and `useDebouncedValue` remain internal implementation hooks and are no longer root exports. Their reorder-only types were removed with the internal hook export.
- Final inventory: `useDataGridState` is experimental, documented in `docs/api/ui-data-grid-api.md`, cataloged in both component metadata files, compiled by the packed-consumer fixture, and covered by `publicHooks.test.tsx`. The four internal hooks have no package-root import path.
- Release disposition: Resolved before the first alpha. The removal is recorded under `CHANGELOG.md` Unreleased with migration guidance; no compatibility alias is added during pre-alpha.

### Q1-P2-001: Data-grid public subcomponents are missing from full component metadata

- Severity: P2
- Package: `@vyrnforge/ui-data-grid`
- Component or feature: `DataGridSearch`, `DataGridFilterBar`, `DataGridSkeletonRows`, `DataGridEmptyState`, `DataGridErrorState`, `DataGridPagination`
- Category: Metadata completeness
- Historical evidence: the former compact status list named these stable and `packages/ui-data-grid/src/index.ts` exports them, while the earlier catalog omitted them. VF-1011 migrates the records into the canonical catalog.
- User impact: The docs app and AI-readable metadata can under-report public grid components.
- Recommended resolution: Add component metadata entries or explicitly classify these as internal implementation exports in the approved maturity update.
- Affected files: `docs/metadata/components.json`, `packages/ui-data-grid/src/index.ts`
- Test requirement: Add metadata parity validation for root component exports.
- Release disposition: Alpha backlog unless CI-007 decides the components are stable public API.

### Q1-P2-002: Public convenience exports need clearer docs ownership

- Severity: P2
- Package: `@vyrnforge/ui-components`
- Component or feature: `CloseButton`, `ClearButton`, `RefreshButton`, `MoreButton`, `ToastViewport`
- Category: Documentation and support boundary
- Evidence: These values are exported from `packages/ui-components/src/index.ts`. Package README mentions icon action aliases, but `docs/metadata/components.json` and `docs/api/ui-components-api.md` do not catalog the convenience buttons individually. `ToastViewport` is exported but appears to be provider infrastructure rather than an ordinary consumer component.
- User impact: Consumers may not know whether these are supported direct APIs or implementation helpers.
- Recommended resolution: Document the four action aliases as stable convenience wrappers, and classify `ToastViewport` as internal or experimental with explicit usage guidance.
- Affected files: `packages/ui-components/src/index.ts`, `docs/api/ui-components-api.md`, `docs/metadata/components.json`, `packages/ui-components/README.md`
- Test requirement: Add metadata/API parity check for exported component values.
- Release disposition: Alpha backlog.

### Q1-P2-003: Component API docs contain duplicate rows

- Severity: P2
- Package: `@vyrnforge/ui-components`
- Component or feature: ToggleButton, ToggleButtonGroup, Rating, Slider, choice guidance
- Category: Documentation quality
- Evidence: `docs/api/ui-components-api.md` repeats `ToggleButton` and `ToggleButtonGroup` rows, repeats `Rating` and `Slider` rows, and repeats `## Choice Guidance`.
- User impact: Repeated guidance makes the API document harder to scan and can cause agents to over-weight duplicated entries.
- Recommended resolution: Deduplicate the API reference in a documentation cleanup task.
- Affected files: `docs/api/ui-components-api.md`
- Test requirement: Documentation lint or metadata-driven docs generation should detect duplicate component rows.
- Release disposition: Alpha backlog.

### Q1-P2-004: Playground foundation copy still references old `dv` wording

- Severity: P2
- Package: Examples / docs
- Component or feature: Playground foundations routes
- Category: CSS-token terminology
- Evidence: `examples/basic-playground/src/app/routes.ts` still says "Shared dv tokens" and "Global dv overrides" while the approved shared prefix is `--vf-*` / `vf-*`.
- User impact: Public examples can confuse consumers about the current CSS ownership model.
- Recommended resolution: Update wording to `vf` in a dedicated docs/examples cleanup. Do not rename package CSS identifiers in CI-004.
- Affected files: `examples/basic-playground/src/app/routes.ts`
- Test requirement: Add a docs/examples grep check for unresolved current-identity `dv` references outside archive.
- Release disposition: Alpha backlog.

### Q1-P2-005: Browser-level interaction evidence is incomplete for overlays, composites, and grid layout

- Severity: P2
- Package: `@vyrnforge/ui-components`, `@vyrnforge/ui-data-grid`
- Component or feature: Popover, Menu, Dropdown, Tooltip, Dialog, Drawer, ConfirmDialog, AppShell, SideNav, Tabs, Autocomplete, MultiSelect, TransferList, Toast, UniversalDataGrid
- Category: Manual accessibility and layout QA
- Evidence: Current tests are SSR/unit-oriented and cover semantic markup, state helpers, and selected keyboard helpers. They do not run a real browser focus, scroll, pointer, viewport, or assistive-technology session.
- User impact: Some focus restoration, nested overlay, sticky scroll, pointer drag, responsive overflow, and color-contrast regressions may not be caught before alpha.
- Recommended resolution: Keep affected composite controls experimental where appropriate and run the manual checklist before promotion. Add browser tests in a future test sprint rather than adding a framework during CI-004.
- Affected files: `packages/ui-components/src/components/__tests__/primitives.test.tsx`, `packages/ui-data-grid/src/**.test.ts`, `docs/quality/00-quality-gates.md`
- Test requirement: Future Playwright or equivalent browser tests for focus loops, Escape/outside dismissal, keyboard navigation, resizing/reordering, and responsive/sticky layout.
- Release disposition: Alpha backlog; stable overlays/grid can ship alpha only with this limitation disclosed.

### Q1-P2-006: Docs and metadata do not fully separate implemented, planned, and exported surfaces

- Severity: P2
- Package: Documentation / metadata
- Component or feature: Planned data display and grid feature entries
- Category: Documentation classification
- Evidence: `docs/metadata/components.json` includes planned entries such as `Progress`, `DescriptionList`, `AdvancedFilterDrawer`, `SavedViewSelector`, and `ExportPreviewPanel`, while root package entry points do not export them. This is valid roadmap metadata, but it increases the risk of treating planned items as available unless docs consistently say "Planned; no import yet."
- User impact: Consumers or AI agents could attempt to import a planned component if metadata is rendered without status context.
- Recommended resolution: Keep planned entries, but ensure docs app and metadata views visibly separate planned from exported public APIs.
- Affected files: `docs/metadata/components.json`, `apps/docs/src/MetadataPage.tsx`, `docs/roadmap/01-component-inventory.md`
- Test requirement: Metadata/UI check that planned entries cannot be rendered as importable unless package root exports them.
- Release disposition: Alpha backlog.

### Q1-P3-001: Playground production bundle exceeds default Vite chunk warning threshold

- Severity: P3
- Package: `examples/basic-playground`
- Component or feature: Playground build artifact
- Category: Future optimization
- Evidence: `npm run build`, `npm run build:playground`, and `npm run quality` pass but emit the existing Vite warning that a playground chunk is larger than 500 kB after minification.
- User impact: No package runtime impact; the playground may eventually benefit from route-level code splitting.
- Recommended resolution: Consider route-level lazy loading for the playground after alpha readiness work.
- Affected files: `examples/basic-playground/src/app/routes.ts` and route page modules if pursued later.
- Test requirement: Production playground build should remain green after any split.
- Release disposition: Non-blocking.

## Data-Grid Findings

| Feature | Evidence reviewed | Result | Notes |
| --- | --- | --- | --- |
| Rendering, empty, loading, error | `UniversalDataGrid`, `DataGridEmptyState`, `DataGridErrorState`, `DataGridSkeletonRows`, playground grid states | Manual review required | Unit/build evidence exists; browser visual behavior still needs manual QA. |
| Sorting | `applySorting.test.ts`, `UniversalDataGrid` header logic | Pass | Pure helper tests cover ascending, descending, and immutability. |
| Filtering and header filters | `applyFilters.test.ts`, `columnFilters.test.ts`, API docs | Pass | Header filter UI is intentionally limited; advanced filtering remains planned. |
| Global search | `applySearch.test.ts`, `DataGridSearch`, API docs | Pass | Search helper respects searchable columns; input debounce is isolated. |
| Selection and bulk actions | `rowSelection.test.ts`, playground selection route, API docs | Pass | Selection helpers and page selection state are tested. |
| Pagination | `applyPagination.test.ts`, `DataGridPagination` | Pass | Helper tests cover page slice and out-of-range behavior; UI needs browser review. |
| Grouping | `applyGrouping.test.ts`, playground grouping route, API docs | Pass | Client-side grouping documented; server grouping is out of scope. |
| Column visibility/order | `columnManagement.test.ts`, playground columns route | Pass | Visibility and ordering helpers are tested. |
| Column resizing | `columnSizing.test.ts`, playground resizing route | Manual review required | Pure sizing logic is tested; pointer/keyboard resize needs browser QA. |
| Column reordering | `columnManagement.test.ts`, `useColumnReorder` export | Manual review required | Pure ordering is tested; drag behavior and public hook status need classification. |
| Keyboard navigation/focus model | Source and quality docs | Manual review required | Needs browser and assistive-tech pass before stable promotion beyond alpha. |
| Theme/density | theme helper tests, playground theme/density routes, CSS token files | Pass with manual visual review | CSS prefix ownership is correct; visual contrast remains manual. |
| Export/server/persistence boundaries | adapter tests and architecture docs | Pass | Adapters build contracts and do not fetch/generate files. |
| Store independence | package manifests, architecture docs, tests | Pass | No Redux/Zustand/TanStack dependency found in package manifests. |

## Documentation And Test Coverage Gaps

| Gap | Severity | Evidence | Recommendation |
| --- | --- | --- | --- |
| Public data-grid hooks missing current API classification | P1 | root exports exist, current docs/metadata omit them | Classify internal/experimental/stable before alpha. |
| Metadata omits several public grid subcomponents | P2 | Historic compact metadata had names missing from the earlier catalog | VF-1011 migrated canonical entries. |
| Component API docs have duplicate rows | P2 | repeated rows in `docs/api/ui-components-api.md` | Deduplicate. |
| Browser-level focus/scroll/pointer evidence missing | P2 | tests are unit/SSR-style | Add manual checklist now; browser tests later. |
| Planned items need stronger "not exported" separation | P2 | planned docs exist beside public metadata | Keep status visible and prevent import examples. |

## CSS And Token Ownership Findings

| Check | Evidence | Result |
| --- | --- | --- |
| Shared classes and variables use `vf-*` / `--vf-*` | `docs/architecture/03-theming-and-styling.md`, package CSS, package READMEs | Pass |
| Grid-only classes and variables use `udg-*` / `--udg-*` | `packages/ui-data-grid/src/styles/**`, API docs | Pass |
| Public CSS import order remains valid | `docs/api/import-and-setup.md`, package export maps, external consumer fixture | Pass |
| Old `dv` wording outside archive | `examples/basic-playground/src/app/routes.ts` | Gap: Q1-P2-004 |
| Data-grid CSS imports component/core CSS for standalone use | `packages/ui-data-grid/src/styles/index.css` | Pass; documented standalone compatibility. |

## Package-Boundary Findings

| Check | Evidence | Result |
| --- | --- | --- |
| `ui-core` remains independent | `packages/ui-core/package.json` has no runtime dependencies | Pass |
| `ui-components` depends on `ui-core` only | `packages/ui-components/package.json` | Pass |
| `ui-data-grid` may depend on `ui-core` and `ui-components` | `packages/ui-data-grid/package.json` | Pass |
| No forbidden package dependency added | package manifests and grep evidence | Pass |
| Public exports do not point at internal `src` files | package export maps use `dist` | Pass |
| Examples use public package imports | playground/docs/consumer searches | Pass |
| Public API support boundaries | data-grid hooks and `ToastViewport` need classification | Gap: Q1-P1-001, Q1-P2-002 |

## Recommended Maturity Classifications

These are recommendations only. CI-004 does not modify actual metadata.

| Recommendation | Count | Items |
| --- | ---: | --- |
| stable | 47 | Core theme/density/utility foundations; Button; IconButton; action aliases; ToolbarButton; SegmentedControl; Icon; typography primitives; Badge; StatusBadge; Alert; InlineMessage; EmptyState; ErrorState; LoadingState; Skeleton; Card; Panel; Stack; Inline; Section; Popover; Menu; Dropdown; Tooltip; Dialog; Drawer; ConfirmDialog; UniversalDataGrid; DataGridToolbar; DataGridSearch; DataGridFilterBar; DataGridColumnMenu; DataGridSkeletonRows; DataGridEmptyState; DataGridErrorState; DataGridPagination; grid state/core/adapters/theme helpers. |
| experimental | 32 | ButtonGroup; ToggleButton; ToggleButtonGroup; Field; ValidationMessage; TextInput; SearchInput; Select; Checkbox; Radio; RadioGroup; Switch; NumberInput; DateInput; DateTimeInput; Textarea; Rating; Slider; MultiSelect; Autocomplete; TransferList; Toast; useToast; AppShell; Page; PageHeader; PageToolbar; SideNav; TopNav; Breadcrumbs; Tabs; useDataGridState. |
| planned | 11 | Progress; DescriptionList; KeyValueList; PropertyTable; ResourceList; Timeline; ActivityLog; DataGridBulkActionBar; AdvancedFilterDrawer; SavedViewSelector; ExportPreviewPanel. |
| deprecated | 0 | None. |
| internal | 5 | ToastViewport, useColumnResize, useColumnReorder, useControlledState, useDebouncedValue. |

`useDataGridState` is now the one documented experimental public data-grid hook. The remaining grid hooks are implementation details and have no supported package-root import path.

## P0 Remediation Queue

No confirmed P0 findings.

## P1 Remediation Queue

No active P1 remediation remains from this audit. Q1-P1-001 was resolved by CI-006.

## P2/P3 Backlog

| ID | One-line description |
| --- | --- |
| Q1-P2-001 | Full metadata omits several stable public data-grid subcomponents. |
| Q1-P2-002 | Public action aliases and ToastViewport need clearer docs/support ownership. |
| Q1-P2-003 | Component API docs contain duplicate rows and duplicate choice guidance. |
| Q1-P2-004 | Playground foundation descriptions still reference old `dv` wording. |
| Q1-P2-005 | Browser-level interaction evidence is incomplete for overlays, composites, and grid layout. |
| Q1-P2-006 | Planned docs/metadata entries need stronger separation from implemented exports. |
| Q1-P3-001 | Playground bundle size warning is a future optimization. |

## Manual-Review Checklist

The following could not be proven automatically in this audit:

- keyboard-only traversal through AppShell, SideNav, Tabs, Menu, Popover, Dialog, Drawer, ConfirmDialog, Autocomplete, MultiSelect, TransferList, Toast actions, and UniversalDataGrid;
- focus entry, focus trap, focus restoration, Escape handling, outside click, nested overlay order, scroll lock, and portal stacking in a real browser;
- pointer column resizing and pointer column reordering behavior;
- sticky header/sidebar behavior and independently scrollable regions on narrow and wide viewports;
- long labels, long cell values, clipping, focus ring visibility, and horizontal overflow behavior in real viewport sizes;
- light, dark, enterprise, compact, standard, and comfortable visual review, including contrast and reduced-motion behavior;
- screen-reader announcements for validation messages, toast announcements, grouped rows, selected rows, and grid headers;
- assistive-technology behavior for native date/datetime/number controls across browsers.

## Alpha-Release Recommendation

CI-004 audit coverage is complete and CI-006 resolved Q1-P1-001. No P0/P1 issues remain from this audit. P2/P3 findings should be recorded as known alpha limitations or fixed in follow-up documentation/test hardening tasks.

## Appendix A: Complete Named Export Inventory

### `@vyrnforge/ui-core`

```text
vyrnForgeUiCoreVersion
createVyrnForgeTheme
mergeVyrnForgeTheme
toVyrnForgeThemeStyle
vyrnForgeDarkTheme
vyrnForgeEnterpriseTheme
vyrnForgeLightTheme
getVyrnForgeThemePreset
VyrnForgeCssVar
VyrnForgeDensity
VyrnForgeTheme
VyrnForgeThemeName
VyrnForgeThemeVars
VyrnForgeVariant
```

### `@vyrnforge/ui-components`

```text
vyrnForgeUiComponentsVersion
Button
ButtonProps
ButtonSize
ButtonVariant
ButtonGroup
ButtonGroupProps
Icon
IconName
IconProps
IconSize
ClearButton
CloseButton
IconButton
MoreButton
RefreshButton
ActionIconButtonProps
IconButtonProps
IconButtonSize
IconButtonVariant
ToolbarButton
ToolbarButtonProps
ToolbarButtonSize
ToggleButton
ToggleButtonProps
ToggleButtonSize
ToggleButtonVariant
ToggleButtonGroup
ToggleButtonGroupProps
ToggleButtonGroupType
ToggleButtonGroupValue
SegmentedControl
SegmentedControlOption
SegmentedControlProps
SegmentedControlSize
Caption
CodeText
Heading
Label
Text
CaptionProps
CodeTextProps
HeadingProps
HeadingSize
LabelProps
TextProps
TextSize
TextTone
Badge
StatusBadge
BadgeProps
BadgeSize
BadgeTone
BadgeVariant
StatusBadgeProps
StatusBadgeStatus
Field
FieldChildren
FieldControlProps
FieldProps
TextInput
TextInputProps
TextInputSize
SearchInput
SearchInputProps
Select
SelectOption
SelectProps
Checkbox
CheckboxProps
Radio
RadioProps
RadioGroup
RadioGroupOption
RadioGroupOrientation
RadioGroupProps
Switch
SwitchProps
NumberInput
NumberInputMode
NumberInputProps
DateInput
DateInputProps
DateTimeInput
DateTimeInputProps
MultiSelect
MultiSelectOption
MultiSelectProps
Autocomplete
AutocompleteFilterFunction
AutocompleteOptionData
AutocompletePlacement
AutocompleteProps
TransferList
TransferListFilterFunction
TransferListOptionData
TransferListProps
Textarea
TextareaProps
ValidationMessage
ValidationMessageProps
ValidationMessageTone
Rating
RatingProps
Slider
SliderProps
EmptyState
EmptyStateProps
ErrorState
ErrorStateProps
Alert
InlineMessage
InlineMessageProps
InlineMessageVariant
Toast
ToastAction
ToastProvider
ToastViewport
useToast
ToastActionProps
ToastController
ToastOptions
ToastPosition
ToastProps
ToastProviderProps
ToastRecord
ToastTone
ToastViewportProps
LoadingState
LoadingStateProps
LoadingStateSize
Skeleton
SkeletonProps
Card
CardPadding
CardProps
CardVariant
Panel
PanelProps
Stack
StackAlign
StackGap
StackJustify
StackProps
Inline
InlineProps
Section
SectionProps
AppShell
AppShellHeaderPosition
AppShellProps
AppShellScrollMode
AppShellSidebarPosition
Page
PageDensity
PageMaxWidth
PageProps
PageHeader
PageHeaderProps
PageToolbar
PageToolbarDensity
PageToolbarProps
SideNav
SideNavItem
SideNavProps
TopNav
TopNavProps
Breadcrumbs
BreadcrumbItem
BreadcrumbsProps
Tabs
TabItem
TabsProps
TabsSize
TabsVariant
Popover
PopoverAlign
PopoverPlacement
PopoverProps
Menu
MenuItem
MenuProps
MenuSize
Dropdown
DropdownProps
Tooltip
TooltipPlacement
TooltipProps
Dialog
DialogProps
DialogSize
Drawer
DrawerProps
DrawerSide
DrawerSize
ConfirmDialog
ConfirmDialogProps
ConfirmDialogVariant
VyrnForgeComponentStatus
```

### `@vyrnforge/ui-data-grid`

```text
UniversalDataGrid
DataGridToolbar
DataGridSearch
DataGridFilterBar
DataGridColumnMenu
DataGridSkeletonRows
DataGridEmptyState
DataGridErrorState
DataGridPagination
createGridState
defaultDataGridState
gridStateActions
gridStateReducer
mergeGridState
selectGridQueryState
applySearch
applyFilters
applySorting
applyGrouping
buildGroupedRows
collapseAllGroups
createGroupId
expandAllGroups
flattenGroupedRows
getGroupLeafRowIds
getGroupLeafRows
normalizeGrouping
resolveGroupableColumns
toggleGroupExpanded
applyPagination
clampColumnWidth
defaultColumnMinWidth
defaultColumnWidth
isColumnResizable
resetAllColumnSizes
resetColumnSize
resolveColumnMaxWidth
resolveColumnMinWidth
resolveColumnSizing
resolveColumnWidth
setColumnSize
getColumnFilter
removeColumnFilter
upsertColumnFilter
defaultPersistKeys
filterColumnMenuColumns
hideOptionalColumns
moveColumnBefore
moveColumnOrder
pickPersistableGridState
resetGridViewState
resolveOrderedColumns
resolveVisibleColumns
showAllColumns
updateColumnVisibility
clearSelection
deselectRows
getRowIdValue
getSelectableRowIds
getSelectionStateForPage
isRowSelectable
isRowSelected
resolveSelectedRows
selectRows
toggleRowSelection
buildDataGridExportRequest
buildDataGridServerQuery
createLocalStorageGridPersistence
createDataGridTheme
mergeDataGridTheme
toDataGridThemeStyle
dataGridDarkTheme
dataGridEnterpriseTheme
dataGridLightTheme
useDataGridState
UseDataGridStateOptions
UseDataGridStateResult
GridStateAction
DataGridBulkAction
DataGridBulkActionContext
DataGridBulkActionVariant
DataGridDefaultExpandedGroups
DataGridDensity
DataGridDisplayRow
DataGridGroupHeaderContext
DataGridGroupIdContext
DataGridGroupPathItem
DataGridGroupRow
DataGridGroupingState
DataGridLeafRow
DataGridPaginationState
DataGridPersistKey
DataGridPersistedState
DataGridPersistenceAdapter
DataGridRowId
DataGridSelectionMode
DataGridSelectionScope
DataGridState
DataGridTheme
DataGridVariant
UniversalDataGridProps
DataGridAggregationContext
DataGridAggregationDef
DataGridAggregationType
DataGridColumnDef
DataGridColumnDataType
DataGridColumnSizingState
DataGridColumnVisibilityState
DataGridFilter
DataGridFilterOperator
DataGridSort
BuildDataGridExportRequestParams
DataGridExportColumn
DataGridExportFormat
DataGridExportRequest
DataGridExportScope
LocalStorageGridPersistenceOptions
BuildDataGridServerQueryParams
DataGridServerQuery
AdapterLocalStorageGridPersistenceOptions
DataGridPageSelectionState
DataGridRowIdGetter
DataGridRowSelectableGetter
DataGridCssVar
DataGridThemePreset
DataGridThemeVars
```

## Validation Record

These commands are the required CI-006 validation set. Results reflect the resolved hook contract:

| Command | Result |
| --- | --- |
| `git diff --check` | PASS |
| `npm ci` | PASS |
| `npm run lint --if-present` | PASS |
| `npm run typecheck` | PASS |
| `npm run test` | PASS |
| `npm run build:packages` | PASS |
| `npm run verify:packages` | PASS |
| `npm run verify:consumer` | PASS |
| `npm run build` | PASS |
| `npm run build:docs` | PASS |
| `npm run build:playground` | PASS |
| `npm run quality` | PASS |

Existing non-fatal notes observed during validation:

- `npm ci` reports one low-severity npm audit item.
- Vite reports the existing playground chunk-size warning after successful production builds.

## Integrity Statement

- No package was published.
- No version was changed.
- No broad runtime component remediation was performed.
- The only public API change is the documented pre-alpha hook disposition: one retained experimental hook with explicit types and four withdrawn internal root exports.
- No CSS prefix ownership was changed.
- No large dependency was added.
- No generated output is intended to be committed.

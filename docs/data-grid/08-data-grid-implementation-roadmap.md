# 08 — Data Grid Implementation Roadmap

## Current completed direction

The grid has been developed through native-first phases.

## Phase list

### P0 — Package skeleton

Create package build foundation.

### P1 — Base grid interactions

* native table rendering
* search
* sort
* pagination
* loading/empty/error states
* controlled/uncontrolled state

### P1.5 — Playground app

Validate package consumption from an example app.

### P1.6 — Visual system stabilization

Improve base styling, layout, density, loading, empty, error, header, footer, and toolbar.

### P2 — Column management and persistence

* show/hide columns
* column order
* column menu
* density selector
* reset view
* localStorage persistence adapter

### P2.5 — Theme system foundation

* split CSS files
* token architecture
* theme helpers
* themeVars support
* density and variant architecture

### P2.6 — Default light/dark polish

Make built-in light and dark themes production-usable.

### P3 — Column resizing and layout stability

* resizable columns
* min/max width
* horizontal overflow
* stable table layout
* column sizing persistence

### P3.5 — Progressive header and column controls

* hover/focus controls
* header filter popover
* header action menu
* compact column menu row actions

### P4 — Row selection and bulk action bar

* single/multiple selection
* select current page
* non-selectable rows
* row click selection
* bulk action bar

### P5 — Grouping and expand/collapse rows

* group by one column
* group by multiple columns
* group chips
* expand/collapse
* grouping with search/filter/sort/selection

## Remaining phases

### P6 — Server mode and lazy placeholder rows

Add server-compatible query emission:

* server-side pagination
* server-side search
* server-side filtering
* server-side sorting
* server-side grouping query state
* lazy placeholder rows
* fetching state
* refresh action
* last refreshed timestamp

### P7 — Export request contract

Do not generate files inside the grid package.

Generate export requests containing:

* tableId
* scope
* format
* visible columns
* search
* filters
* sort
* grouping
* selected rows

### P8 — Saved views manager

Support saved view presets:

* save current view
* rename view
* delete view
* set default view
* restore view
* adapter-based local/backend storage

### P9 — Advanced filter drawer

Support:

* multiple conditions
* AND/OR groups
* date ranges
* number ranges
* enum multi-select
* saved criteria

### P10 — Performance and optional virtualization

Support:

* row windowing
* memoization hardening
* large row stress tests
* render count optimization
* smooth resizing and scrolling

### P11 — Accessibility and QA hardening

Test:

* keyboard flows
* screen reader labels
* focus management
* menu behavior
* resize and reorder fallback
* reduced motion
* contrast

### P12 — Package release preparation

Prepare:

* CHANGELOG
* MIGRATION
* API docs
* npm pack test
* private registry publishing
* version tags

## Recommended phase order after P5

```txt
P5.5 UI Component System Inventory
P6 Server Mode + Lazy Placeholder Rows
P7 Export Request Contract
P8 Saved Views Manager
P9 Advanced Filter Drawer
P10 Performance / Virtualization
P11 QA / Accessibility Hardening
P12 Release Prep
```

> Archived: This document is historical and no longer canonical.
> Replacement: ../../packages/ui-data-grid.md

# 06 — Universal Data Grid Specification

## Purpose

UniversalDataGrid is the first strategic component in Dravyn UI.

It provides a reusable enterprise-grade data grid for resource management, reporting, admin pages, customer portals, operational workspaces, and data-heavy product screens.

## Design goals

The grid should be:

* native-first
* dependency-light
* controlled/uncontrolled
* themeable
* compact by default
* accessible
* extensible
* reusable across multiple products

## Core capabilities

### Base grid

* native table rendering
* columns and rows
* global search
* sorting
* pagination
* empty state
* loading state
* error state
* controlled/uncontrolled state

### Column management

* show/hide columns
* column order
* drag reorder in column menu
* direct header reorder
* column search inside menu
* density selector
* reset actions
* persistence adapter

### Header controls

* progressive header actions
* sort indicator
* filter indicator
* column filter popover
* header action menu
* resize handle
* reorder behavior

### Column resizing

* width/minWidth/maxWidth
* drag resize
* double-click reset size
* persistence
* horizontal overflow
* stable table layout

### Row selection

* single selection
* multiple selection
* select current page
* non-selectable rows
* row click selection
* bulk action bar

### Grouping

* group by one column
* group by multiple columns
* expand/collapse group rows
* group chips
* expand all/collapse all
* grouping with search/filter/sort/selection

## Future capabilities

### Server mode

* server-side search
* server-side filtering
* server-side sorting
* server-side pagination
* query emission
* lazy placeholder rows
* loading/fetching states

### Export contract

* build export request
* support current page, selected rows, filtered result, all matching query
* no Excel/PDF generation inside grid package by default

### Saved views

* save current grid state
* rename view
* delete view
* set default view
* backend or local adapter

### Advanced filters

* filter drawer
* multiple conditions
* AND/OR groups
* ranges
* enum multi-select
* saved criteria

### Performance

* large row optimization
* optional virtualization
* memoization
* stress testing

## Non-goals

The grid should not become:

* a spreadsheet clone
* a BI pivot engine
* a charting library
* a backend data layer
* a Redux-only component
* a MUI/TanStack wrapper
* a report generator by itself

## Public API direction

Example usage:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  getRowId={(row) => row.id}
  theme="enterprise"
  density="compact"
  variant="card"
  selectable
  selectionMode="multiple"
  enableGrouping
  persistenceAdapter={localPersistence}
  bulkActions={bulkActions}
/>
```

## Export relationship

The data grid should produce export requests, not final files.

The future exporter/reporting system can consume:

* visible columns
* filters
* search
* sort
* grouping
* selected rows
* export scope
* export format

This keeps the grid reusable and avoids turning it into a reporting engine.

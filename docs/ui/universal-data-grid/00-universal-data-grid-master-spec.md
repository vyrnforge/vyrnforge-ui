# Universal Data Grid Master Specification

## 1. Purpose

The Universal Data Grid is a reusable enterprise-grade data table system for React + Redux applications.

It is not a simple table component.

It is a shared data management foundation that should be reusable across products, modules, and projects, including:

- IAM
- ITAM
- ITSM
- Asset Management
- Admin Portals
- Customer Portals
- Data Platforms
- Report Preview Screens
- Export Builder Screens
- Operational Workspaces

The grid must support high-volume enterprise data workflows while remaining maintainable and easy to extend.

---

## 2. Design Intent

The grid should help users:

- Find records quickly
- Understand records clearly
- Filter and group information
- Customize columns
- Work with large datasets
- Preserve their table preferences
- Export or preview report data later

The grid should follow these principles:

- Data is a first-class citizen.
- Search and filtering must be visible and efficient.
- Customization should reduce repetitive work.
- Large datasets should be expected.
- Table behavior should be separated from visual rendering.
- Export should be designed as an extension, not hardcoded into the table.

---

## 3. Recommended Technical Direction

Use a headless grid architecture:

```text
TanStack Table = table behavior/state engine
TanStack Virtual = row virtualization/lazy rendering
MUI = visual shell and controls
Redux Toolkit = persistent table UI/query state
RTK Query = server data fetching when required
```

Avoid locking the Universal Data Grid to MUI X Pro/Premium-only features.

MUI Material components can still be used for:

- Toolbar
- Buttons
- Menus
- Icons
- Tooltips
- Drawer
- Skeleton
- Dialog
- Pagination UI
- Empty/Error states

---

## 4. Primary Component

Component name:

```ts
UniversalDataGrid
```

Primary usage:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  dataSource={dataSource}
/>
```

The caller should not need to wire low-level table behavior manually for standard list pages.

---

## 5. Supported Modes

### 5.1 Client Mode

Use when all rows are already available in memory.

Client mode supports:

- Local search
- Local filtering
- Local sorting
- Local grouping
- Local pagination
- Local row selection

Recommended for:

- Small datasets
- Static configuration lists
- Local mock/demo pages
- Already-loaded collections

Do not use client mode for very large enterprise datasets unless data volume is controlled.

---

### 5.2 Server Mode

Use when rows must be fetched from an API.

Server mode supports:

- Server-side search
- Server-side filtering
- Server-side sorting
- Server-side pagination or cursor loading
- Server-side grouping when required
- Lazy loading placeholders
- Refresh and retry behavior

Recommended for:

- Large datasets
- Multi-tenant datasets
- Audit logs
- Catalogs
- Operational records
- Anything that may grow heavily over time

---

## 6. Required Capabilities

### 6.1 Column Definition

Each column must support:

- `id`
- `field`
- `header`
- `description`
- `dataType`
- `width`
- `minWidth`
- `maxWidth`
- `resizable`
- `sortable`
- `filterable`
- `searchable`
- `groupable`
- `hideable`
- `required`
- `align`
- `renderCell`
- `formatValue`
- `exportValue`
- `filterOperators`
- `meta`

Supported data types:

```ts
string | number | date | datetime | boolean | enum | status | currency | percent | custom
```

---

### 6.2 Search

The grid must support global search across searchable columns.

Requirements:

- Search input visible in toolbar.
- Debounced input.
- Search applies to searchable columns only.
- Search state is stored per `tableId`.
- Server mode emits query state instead of filtering locally.

---

### 6.3 Filtering

The grid must support:

- Quick filters
- Column filters
- Advanced filter drawer
- Multiple conditions
- Operators based on data type
- Active filter chips
- Remove single filter
- Clear all filters

Filter operators should be type-aware.

Examples:

| Type | Operators |
|---|---|
| string | contains, equals, startsWith, endsWith, isEmpty, isNotEmpty |
| number | equals, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, between |
| date/datetime | on, before, after, between |
| boolean | isTrue, isFalse |
| enum/status | is, isAnyOf, isNot |

---

### 6.4 Sorting

The grid must support:

- Single-column sorting
- Multi-column sorting where enabled
- Sort reset
- Server-mode sort query emission

---

### 6.5 Grouping

The grid must support grouping by configured groupable columns.

Requirements:

- Group by one or more columns.
- Expand/collapse group rows.
- Group counts.
- Optional grouped summaries.
- Preserve expansion state where practical.
- Disable grouping for columns that should not be grouped.

Examples:

- Group users by status.
- Group assets by type.
- Group tickets by priority.
- Group reports by owner.
- Group logs by service.

---

### 6.6 Column Customization

The grid must support:

- Show columns
- Hide columns
- Reorder columns
- Resize columns
- Reset columns
- Required/non-hideable columns
- Persisted column preferences per `tableId`

Column customization must not break accessibility or export behavior.

---

### 6.7 Lazy Loading and Placeholder Rows

The grid must provide clear loading states:

- Initial loading state
- Skeleton rows
- Blank placeholder rows for lazy fetch
- Fetching-more state
- Refreshing state
- Empty state
- Filtered-empty state
- Error state

The table must never appear frozen or broken while loading.

---

### 6.8 Selection and Bulk Actions

The grid must support:

- Row selection
- Select all current page
- Optional select all matching query
- Selected count
- Bulk action bar
- Selection clearing

Bulk actions must clearly communicate scope and impact.

---

### 6.9 Pagination and Cursor Loading

The grid must support both:

- Page/pageSize pagination
- Cursor-based pagination

The data source determines which pagination mode is active.

---

### 6.10 Saved Views

Saved views should preserve:

- Search
- Filters
- Sorting
- Grouping
- Column visibility
- Column order
- Column sizing
- Density
- Page size

Saved views should be scoped by:

```text
tableId + optional userId + optional tenantId + optional moduleId
```

---

### 6.11 Export Extension

Export should be designed as a plugin contract.

Do not hardcode final export generation into the table.

The grid should only know how to build an export request using current table state.

Export scopes:

- Current page
- Selected rows
- Filtered result
- All records matching current query

Export formats:

- CSV
- XLSX
- PDF
- JSON

Future exporter should reuse:

- Visible columns
- Column labels
- Column order
- Column formatters
- Search
- Filters
- Sorting
- Grouping
- Selection

---

## 7. UI Composition

### 7.1 Toolbar

Toolbar should include:

- Optional table title
- Global search
- Filter button
- Group button/menu
- Column button
- Density button
- Refresh button
- Export button placeholder
- Optional primary action slot
- Optional custom action slot

---

### 7.2 Active Filter Bar

Should show:

- Active filter chips
- Active search text when useful
- Clear filters action
- Saved view indicator when applicable

---

### 7.3 Table Body

Should support:

- Sticky header
- Virtualized rows
- Group rows
- Data rows
- Skeleton rows
- Placeholder rows
- Empty state
- Error state

---

### 7.4 Footer

Footer should show:

- Result count
- Selected count
- Pagination controls
- Page size selector
- Last refreshed timestamp when available

---

## 8. Accessibility Requirements

The grid must support:

- Keyboard navigation for controls
- Visible focus states
- ARIA labels for toolbar buttons
- Screen-reader friendly loading state
- Screen-reader friendly error state
- Status labels that do not rely on color alone
- Meaningful button labels and tooltips

---

## 9. Performance Requirements

The grid must:

- Memoize column definitions.
- Memoize row models where possible.
- Debounce global search.
- Use virtualization for large row counts.
- Avoid storing huge datasets in Redux.
- Avoid recomputing filters/grouping unnecessarily.
- Avoid rerendering all cells for small UI changes.
- Support server-side query mode for large data.

---

## 10. Non-Goals for Initial Version

Do not build these in the first version unless required:

- Full Excel export engine
- Full PDF report designer
- Pivot table
- Chart builder
- Real-time collaborative editing
- Complex spreadsheet editing
- Formula engine
- Inline cell validation framework

These can be added later as plugins or separate modules.

---

## 11. Success Criteria

The grid is successful when:

- A module can render a full table using only `tableId`, `columns`, and `dataSource`.
- Users can search, filter, sort, group, resize columns, reorder columns, hide/show columns, and select rows.
- The grid supports both client and server data modes.
- Large datasets remain responsive.
- Preferences persist per table.
- Export request generation works without implementing final exporters.
- The component contains no domain-specific assumptions.
- It can be compiled and reused across multiple projects.

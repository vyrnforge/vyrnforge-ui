# @dravyn/ui-data-grid

Lightweight native-first React + TypeScript Universal Data Grid package foundation.

This package exposes generic contracts, pure core helpers, controlled/uncontrolled state hooks, native table rendering, column management, optional view-state persistence, and base CSS variables. Redux, MUI, TanStack, exporter engines, and domain-specific UI are intentionally not part of the package.

`@dravyn/ui-data-grid` now consumes shared Dravyn primitives from `@dravyn/ui-components` for common controls such as buttons, icon buttons, search inputs, selects, checkboxes, badges, menus, and feedback states. The grid remains a specialized data-management package: use `@dravyn/ui-components` for shared UI outside grids, and use `@dravyn/ui-data-grid` for grid-specific APIs, state, column behavior, selection, grouping, resizing, and persistence.

## CSS

Import the package CSS once in the consuming app:

```tsx
import "@dravyn/ui-data-grid/style.css";
```

The data-grid stylesheet includes the shared core/component layers for standalone use. When using the full Dravyn UI workspace, the recommended explicit import order is still:

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
```

`@dravyn/ui-data-grid` remains backward compatible with `--udg-*` variables. It also maps many grid defaults to shared `--dv-*` variables when `@dravyn/ui-core` CSS is present, so app-level Dravyn tokens can theme components and grid together.

Override shared `--dv-*` tokens when components and grid should move together:

```css
.my-app {
  --dv-primary: #003b71;
  --dv-radius-md: 10px;
}
```

Override `--udg-*` tokens when only the grid should change:

```css
.my-app .udg {
  --udg-header-bg: #f8fafc;
  --udg-row-height: 42px;
}
```

## Theme System

Built-in `light`, `dark`, `system`, and `enterprise` themes are production-ready starting points. Use them through props:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  theme="enterprise"
  density="compact"
  variant="card"
/>
```

Use `theme="light"` for a neutral SaaS grid, `theme="dark"` for calm dark slate surfaces, `theme="system"` to follow the user's color scheme, or `theme="enterprise"` for a slightly denser light enterprise preset.

Per-instance CSS variables can be passed with `themeVars`:

```tsx
import {
  UniversalDataGrid,
  createDataGridTheme
} from "@dravyn/ui-data-grid";

const customTheme = createDataGridTheme({
  "--udg-primary": "#003b71",
  "--udg-radius-md": "10px"
});

<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  theme="bank-jatim"
  themeVars={customTheme}
/>;
```

Recommended customization order:

1. Use built-in `theme`, `density`, and `variant`.
2. Use scoped CSS variable overrides.
3. Use `themeVars` for per-instance overrides.
4. Avoid editing package CSS directly.

## State And Adapters

The app owns backend rows, permissions, workflows, and business state. The grid owns local view state only when it is uncontrolled. Controlled integrations should pass `state` and observe `onStateChange`; the parent remains the source of truth.

Grid state organization:

- `state/` owns defaults, merge/reset logic, reducer actions, and selectors.
- `core/` owns pure grid algorithms.
- `hooks/` coordinates React interactions.
- `adapters/` owns persistence, server query, and export request boundaries.

Persistence is adapter-based and stores preferences only. Server integration should use query contracts and fetch in the app. Export integration should use request contracts and generate files outside the default grid package.

No global store is created inside `@dravyn/ui-data-grid`.

## Column Management

Columns can be hidden by default and protected from hiding:

```tsx
const columns = [
  { id: "name", header: "Name", accessorKey: "name", hideable: false },
  { id: "email", header: "Email", accessorKey: "email", hidden: true }
];
```

`UniversalDataGrid` stores visibility and order in `DataGridState`:

```tsx
<UniversalDataGrid tableId="users" columns={columns} rows={rows} />
```

The built-in column menu uses shared Dravyn search, checkbox, segmented control, badge, icon button, and menu primitives while keeping grid-specific behavior in the grid package. It focuses on search, visibility, density, and reset actions. Rows stay compact by default; move up/down and more actions appear on hover or keyboard focus. Users can reorder columns by dragging rows in the column menu or by dragging the small grip in a table header. The reset menu can reset order, sizes, column visibility/order/sizing, or the full view.

## Filtering

Global search scans searchable columns across the current grid. Column filters are supported in `DataGridState.filters` for controlled integrations and future filter UI surfaces, but the compact header does not render an inline filter popover.

```tsx
const columns = [
  { id: "name", header: "Name", accessorKey: "name", dataType: "string" },
  { id: "score", header: "Score", accessorKey: "score", dataType: "number" },
  { id: "enabled", header: "Enabled", accessorKey: "enabled", dataType: "boolean" }
];
```

Supported filter operators:

- text/status/enum/custom: `contains`, `equals`, `startsWith`, `endsWith`
- number/date/datetime: `equals`, `gt`, `gte`, `lt`, `lte`
- boolean: `equals`

Set `filterable: false` on a column to mark that column as unavailable for column-level filtering in custom integrations. Header controls appear on hover/focus and remain visible when a column is sorted. The header action menu provides sort, hide, reset size, and move left/right actions using shared Dravyn icon/menu primitives where they are safe for the native table interactions.

## Column Resizing

Columns are resizable by default. Use `width`, `minWidth`, `maxWidth`, and `resizable` on column definitions:

```tsx
const columns = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    width: 220,
    minWidth: 160,
    maxWidth: 360
  },
  {
    id: "id",
    header: "ID",
    accessorKey: "id",
    width: 72,
    resizable: false
  }
];
```

The current widths live in `DataGridState.columnSizing`:

```tsx
const [state, setState] = useState(
  createGridState({
    columnSizing: {
      name: 260
    }
  })
);

<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  state={state}
  onStateChange={setState}
/>;
```

Users can drag the header edge resize handle, use keyboard arrow keys on a focused handle, or double click the handle to reset one column size. Persisted preferences include `columnSizing` by default.

## Row Selection

Row selection is opt-in and works in controlled or uncontrolled mode:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  getRowId={(row) => row.id}
  selectable
  selectionMode="multiple"
  defaultSelectedRowIds={[1]}
  getRowSelectable={(row) => row.status !== "disabled"}
  bulkActions={[
    {
      id: "review",
      label: "Flag review",
      variant: "primary",
      onClick: ({ selectedRowIds }) => console.log(selectedRowIds)
    }
  ]}
/>
```

Use `selectedRowIds` and `onSelectedRowIdsChange` for controlled selection. Header selection applies only to selectable rows on the current displayed page. Selection is not persisted by the built-in persistence helper, and reset view clears selected rows back to `defaultSelectedRowIds` or an empty selection.

## Row Grouping

Grouping is opt-in with `enableGrouping`. It is client-side in this phase:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={[
    { id: "name", header: "Name", accessorKey: "name" },
    { id: "status", header: "Status", accessorKey: "status", groupable: true }
  ]}
  rows={rows}
  enableGrouping
  defaultGrouping={["status"]}
  defaultExpandedGroups="all"
/>
```

Use multiple column ids for nested grouping:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  enableGrouping
  defaultGrouping={["owner", "status"]}
/>
```

Controlled grouping is part of `DataGridState.grouping` and can also be observed with `onGroupingChange`. Header action menus include `Group by this column` for columns where `groupable !== false`. Active grouping is shown as removable chips, with clear, expand all, and collapse all actions.

Hidden columns can remain active grouping columns if their id is already in grouping state. Search, filters, and sorting apply to leaf rows before group rows are generated. Pagination is display-row pagination in this phase, so group headers count as rows on the current page. Selection still applies to leaf rows only.

Current limitations: server-side grouping, pivot behavior, and advanced aggregation are not implemented yet. Group rows include row counts; numeric aggregation contracts exist for later expansion.

## Persistence

Persistence is optional and stores preferences only, not row data:

```tsx
import {
  UniversalDataGrid,
  createLocalStorageGridPersistence
} from "@dravyn/ui-data-grid";

const persistenceAdapter = createLocalStorageGridPersistence({
  namespace: "my-app"
});

<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  persistState
  persistenceAdapter={persistenceAdapter}
/>;
```

Persisted preferences include search, filters, sort, page size, column visibility, column order, column sizing, grouping, and density. Expanded group ids are session-only for now. In controlled mode, the parent state remains the source of truth; persistence saves emitted state but does not take control away from the parent.

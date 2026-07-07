# Basic Playground

This Vite React app validates that `@dravyn/ui-data-grid` can be consumed from another workspace project.

## Run

From the repository root:

```bash
npm run dev:playground
```

Build the playground:

```bash
npm run build:playground
```

## What It Validates

- Local workspace package consumption with `@dravyn/ui-data-grid`.
- Package CSS loading through `@dravyn/ui-data-grid/style.css`.
- Uncontrolled grid state.
- Controlled grid state through React `useState` and `onStateChange`.
- Search, sorting, pagination, loading, empty, and error states.
- Column examples for string, number, date, boolean, status, and custom cells.
- Card and bordered variants.
- Compact, standard, and comfortable densities.
- Light, dark, enterprise, custom string, and system theme support.
- Production-ready default light and dark theme polish.
- Dedicated theme previews for light, dark, enterprise, and custom overrides.
- Column visibility, drag ordering, density changes, reset dropdown actions, and localStorage persistence.
- Column resizing, min/max width constraints, locked columns, horizontal overflow, and persisted sizes.
- Progressive header controls and header action menus.
- Row selection, page-level select all, row-click selection, disabled rows, controlled selected IDs, and bulk action bar callbacks.
- Row grouping, nested grouping, group chips, expand/collapse all, grouped rows with selection, and display-row pagination.

## Styling

Import the package CSS once in the consuming app entry file:

```tsx
import "@dravyn/ui-data-grid/style.css";
```

Visual props can be passed directly to `UniversalDataGrid`:

```tsx
<UniversalDataGrid
  density="compact"
  theme="system"
  variant="card"
  tableId="example"
  columns={columns}
  rows={rows}
/>
```

Recommended built-in themes:

- `theme="light"` for the default professional SaaS grid.
- `theme="dark"` for calm dark slate UI.
- `theme="system"` to follow `prefers-color-scheme`.
- `theme="enterprise"` for a polished light enterprise preset.

The default light and dark themes are intended to be production-ready starting points.

Create per-instance theme variables with `createDataGridTheme`:

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
  tableId="example"
  columns={columns}
  rows={rows}
  theme="bank-jatim"
  themeVars={customTheme}
/>
```

Column preferences can be persisted with the built-in localStorage adapter:

```tsx
import {
  UniversalDataGrid,
  createLocalStorageGridPersistence
} from "@dravyn/ui-data-grid";

const persistenceAdapter = createLocalStorageGridPersistence({
  namespace: "playground"
});

<UniversalDataGrid
  tableId="workspaces"
  columns={columns}
  rows={rows}
  persistState
  persistenceAdapter={persistenceAdapter}
/>;
```

Persistence stores view preferences only: search, filters, sort, page size, column visibility, column order, column sizing, grouping, and density. It does not store row data or expanded group ids. In controlled examples, `onStateChange` still makes React state the source of truth.

## Column Resizing

Columns can be reordered by dragging rows in the column menu or dragging the small grip in a table header. The column menu stays focused on visibility, density, search, and a compact reset dropdown.

Columns resize from native header-edge handles. Drag a handle, focus it and use ArrowLeft/ArrowRight, or double click it to reset that column. The reset dropdown includes order, size, column, and full-view reset actions.

## Header Controls

Header controls appear on hover or keyboard focus. They stay visible when a column is sorted.

- Click the header label to toggle sorting.
- Use `...` to open sort, hide, reset size, and move actions.
- Global search scans across searchable columns.
- Column menu row actions appear on hover/focus for keyboard-accessible move and more actions.

Column filters are still supported through `DataGridState.filters` for controlled integrations. The playground keeps the visible header UI focused on sorting, resizing, reordering, and column actions.

Filter operators are based on `dataType` when filters are supplied through state:

- string/status/enum/custom: `contains`, `equals`, `startsWith`, `endsWith`
- number/date/datetime: `equals`, `gt`, `gte`, `lt`, `lte`
- boolean: `equals`

Set `filterable: false` on a column to mark that column as unavailable for column-level filtering in custom integrations.

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

Controlled sizing is part of grid state:

```tsx
const [state, setState] = useState(
  createGridState({
    columnSizing: {
      name: 260
    }
  })
);

<UniversalDataGrid
  tableId="workspaces"
  columns={columns}
  rows={rows}
  state={state}
  onStateChange={setState}
/>;
```

When `persistState` is enabled, `columnSizing` is saved with the other view preferences. Reset view clears saved sizing through the persistence adapter.

## Row Selection

The uncontrolled example enables multiple row selection, row-click selection, and bulk action callbacks. Suspended rows are intentionally not selectable. The controlled example stores selected row IDs inside React grid state, so the JSON preview updates when rows are selected.

Header checkbox selection applies to the current displayed page only. Selection is not saved by the persistence adapter.

## Row Grouping

Grouping is enabled in the playground with `enableGrouping`. Example A groups by status, Example B uses controlled nested grouping by owner then status, and Example C combines grouping with selection in the dark theme.

Use grouping from props:

```tsx
<UniversalDataGrid
  tableId="workspaces"
  columns={columns}
  rows={rows}
  enableGrouping
  defaultGrouping={["status"]}
  defaultExpandedGroups="all"
/>
```

Users can group from the toolbar menu or the header action menu. Active grouping appears as chips with remove buttons. Expand all, collapse all, and clear grouping are native buttons.

Current behavior: search, filters, and sorting run before grouping. Pagination is display-row pagination, so group headers count in the page size. Selection applies to leaf rows only. Server-side grouping and advanced pivot/aggregation are intentionally not implemented yet.

CSS variables can be overridden from the consuming app:

```css
.my-page .udg {
  --udg-primary: #1d4ed8;
  --udg-radius-md: 8px;
}
```

Recommended customization hierarchy:

1. Use built-in `theme`, `density`, and `variant`.
2. Use scoped CSS variable overrides.
3. Use `themeVars` for per-instance overrides.
4. Avoid editing package CSS directly.

## Scope

This playground is for local development and package reuse validation only. It is not part of the distributable `@dravyn/ui-data-grid` package.

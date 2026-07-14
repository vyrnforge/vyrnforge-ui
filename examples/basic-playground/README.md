# Basic Playground

This Vite React app validates Dravyn UI package consumption from another workspace project. It is the interactive usage lab for core tokens, primitives, data-grid behavior, and product patterns.

## Playground And Docs App

The docs app is the source-of-truth reference for public APIs, architecture, and AI-readable metadata. The playground is the place to try working components in a live browser.

Each gallery page should use the shared playground helpers:

- `ComponentDemoPage` for the route header, import, usage guidance, API reference, accessibility, related components, and right-side outline.
- `LiveExample` for a live preview derived directly from editable JSX source.
- `PropsTable` only for compact, verified prop reference.
- `PageOutline` for the section IDs rendered on a reference page.

## Adding A Component Reference

Every implemented public component gets its own route. Category pages may introduce a group, but they must not replace component reference pages.

1. Add the component's route metadata in `src/app/routes.ts`, including its category, package, status, and path.
2. Create a `ComponentDemoPage` with only relevant sections. Use stable section IDs so the right-side `PageOutline` can link to them.
3. Add a `LiveExample` for every migrated example. Never pass a separately rendered preview: `initialCode` is the only source of the result.
4. Give the example a restricted `createLiveScope(...)` containing only the Dravyn primitives it needs. Do not expose application services, auth, storage, APIs, or other application internals.
5. Keep the import block read-only. `Copy full example` combines it with the current editable source; `Reset` restores `initialCode` and the original preview.
6. Let syntax and runtime errors remain scoped to the individual example. The evaluator is for trusted playground examples only and is not part of Dravyn's public runtime API.
7. Verify prop names and defaults against the public component type before adding rows to `PropsTable`.
8. Add related component route IDs and short relationship descriptions. Keep live source and visual intent synchronized in the same edit.

For adjacent selection controls, keep the public intent distinct: use `Switch` for persistent settings, `ToggleButton` for active tools or view modes, `ToggleButtonGroup` for joined tool choices, `SegmentedControl` for small stable exclusive choices, `RadioGroup` for spacious form options, and `Checkbox` for independent Boolean form values.

Use public Dravyn APIs and Dravyn UI primitives for the gallery surface. `react-live` is installed only in this private playground workspace to compile trusted editable examples. Playground CSS is only for reference layout, preview/code presentation, responsive behavior, and anchor spacing; do not duplicate package button, badge, input, card, tab, or alert styling in `playground.css`.

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

- Local workspace package consumption with `@dravyn/ui-core`, `@dravyn/ui-components`, and `@dravyn/ui-data-grid`.
- Recommended CSS import order: core, components, then data grid.
- Overview, Core, Components, Data Grid, and Patterns navigation using simple React state.
- Shared `--dv-*` tokens across buttons, inputs, states, and data-grid fallbacks.
- Backward-compatible grid-specific `--udg-*` override examples.
- Light, dark, enterprise, and system theme previews.
- Compact, standard, and comfortable density examples.
- Grid examples for basic usage, columns, filtering, selection, grouping, resizing, themes, and stress data.
- Pattern examples for resource lists, detail pages, settings, forms, and empty/error/loading states.

## Sections

- Overview: project purpose, packages, principles, and maturity.
- Core: tokens, theme modes, density, and CSS override layering.
- Components: buttons, typography, badges, inputs, feedback states, and layout guidance.
- Data Grid: all `UniversalDataGrid` examples, including columns, filters, selection, grouping, resizing, themes, and stress data.
- Patterns: realistic non-table enterprise UI composed from Dravyn primitives.

Component examples are intentionally separate from grid examples. Data-grid demos live under Data Grid so the playground can review Dravyn UI as a broader foundation without hiding the existing grid surface.

## Styling

Import the package CSS once in the consuming app entry file:

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
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

Recommended built-in grid themes:

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

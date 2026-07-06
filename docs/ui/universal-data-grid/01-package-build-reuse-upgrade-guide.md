# Package, Build, Reuse, and Upgrade Guide

## 1. Purpose

This guide explains how to compile the Universal Data Grid as a reusable package so it can be shared and upgraded across multiple projects.

The objective is to avoid copy-pasting the grid into every project.

Instead, the grid should become a versioned shared package.

---

## 2. Recommended Reuse Strategy

Use one of these strategies.

### Option A — Monorepo Workspace Package

Best if your projects live in one repository or closely related repositories.

Recommended structure:

```text
root/
  apps/
    iam-admin/
    itam-admin/
    itsm-admin/
  packages/
    ui-core/
    ui-data-grid/
    ui-icons/
    ui-theme/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

Package path:

```text
packages/ui-data-grid/
```

Import usage:

```ts
import { UniversalDataGrid } from "@your-org/ui-data-grid";
```

Pros:

- Easy local development.
- Easy shared versioning.
- Easy cross-project refactor.
- Better long-term maintainability.

Cons:

- Requires workspace setup.

---

### Option B — Private NPM Package

Best if projects are in separate repositories.

Package name example:

```text
@your-org/ui-data-grid
```

Publish to:

- GitHub Packages
- GitLab Package Registry
- Azure Artifacts
- Verdaccio private registry
- NPM private registry

Pros:

- Clean dependency management across independent repos.
- Version upgrades are explicit.
- Easy rollback.

Cons:

- Requires package publishing flow.

---

### Option C — Git Dependency

Acceptable for early development.

Example:

```json
{
  "dependencies": {
    "@your-org/ui-data-grid": "git+ssh://git@example.com/your-org/ui-data-grid.git#v0.1.0"
  }
}
```

Pros:

- Simple before private registry exists.

Cons:

- Less ideal for long-term versioning.
- Slower installs.
- Harder dependency governance.

---

### Recommendation

Start with:

```text
Option A: monorepo package
```

Then later publish the same package as:

```text
Option B: private NPM package
```

---

## 3. Package Structure

Recommended package structure:

```text
packages/ui-data-grid/
  src/
    components/
      UniversalDataGrid.tsx
      DataGridToolbar.tsx
      DataGridSearchBox.tsx
      DataGridFilterBar.tsx
      DataGridFilterDrawer.tsx
      DataGridColumnPanel.tsx
      DataGridDensityMenu.tsx
      DataGridBulkActionBar.tsx
      DataGridEmptyState.tsx
      DataGridErrorState.tsx
      DataGridSkeletonRows.tsx
      DataGridFooter.tsx
    hooks/
      useUniversalDataGrid.ts
      useDataGridColumns.ts
      useDataGridQueryState.ts
      useDataGridPersistence.ts
      useDataGridServerMode.ts
    store/
      dataGridSlice.ts
      dataGridSelectors.ts
    types/
      dataGrid.types.ts
      dataGridColumn.types.ts
      dataGridFilter.types.ts
      dataGridExport.types.ts
    adapters/
      createClientDataSource.ts
      createServerDataSource.ts
    exporters/
      exportRequestBuilder.ts
      exporterRegistry.ts
    utils/
      filterOperators.ts
      columnFormatters.ts
      rowGrouping.ts
      gridPersistenceKeys.ts
    index.ts
  package.json
  tsconfig.json
  tsup.config.ts
  README.md
```

---

## 4. Package Boundary Rules

The package must not depend on app-specific code.

Allowed:

- React
- TypeScript
- Redux Toolkit
- TanStack Table
- TanStack Virtual
- MUI Material
- MUI Icons
- Local package types

Not allowed:

- IAM-specific types
- ITAM-specific types
- Product-specific API clients
- Hardcoded routes
- Hardcoded tenant assumptions
- Hardcoded auth assumptions
- Hardcoded status values except generic status rendering support

---

## 5. Peer Dependencies

For cross-project reuse, define common framework libraries as peer dependencies.

Recommended `peerDependencies`:

```json
{
  "@emotion/react": ">=11",
  "@emotion/styled": ">=11",
  "@mui/icons-material": ">=5",
  "@mui/material": ">=5",
  "@reduxjs/toolkit": ">=2",
  "@tanstack/react-table": ">=8",
  "@tanstack/react-virtual": ">=3",
  "react": ">=18",
  "react-dom": ">=18",
  "react-redux": ">=9"
}
```

Recommended `devDependencies` should include the same packages for local build/test.

Avoid bundling React, MUI, Redux, or TanStack inside the package bundle.

---

## 6. Recommended Build Tool

Use `tsup` or Vite library mode.

### Recommended: tsup

Why:

- Simple TypeScript library compilation.
- Generates ESM and CJS outputs.
- Can emit declaration files.
- Easy external dependency configuration.

Install:

```bash
pnpm add -D tsup typescript
```

Build command:

```bash
pnpm --filter @your-org/ui-data-grid build
```

Example `tsup.config.ts`:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-redux",
    "@reduxjs/toolkit",
    "@tanstack/react-table",
    "@tanstack/react-virtual",
    "@mui/material",
    "@mui/icons-material",
    "@emotion/react",
    "@emotion/styled"
  ]
});
```

---

## 7. Example Package Manifest

```json
{
  "name": "@your-org/ui-data-grid",
  "version": "0.1.0",
  "private": false,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "clean": "rimraf dist",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "peerDependencies": {
    "@emotion/react": ">=11",
    "@emotion/styled": ">=11",
    "@mui/icons-material": ">=5",
    "@mui/material": ">=5",
    "@reduxjs/toolkit": ">=2",
    "@tanstack/react-table": ">=8",
    "@tanstack/react-virtual": ">=3",
    "react": ">=18",
    "react-dom": ">=18",
    "react-redux": ">=9"
  },
  "devDependencies": {
    "typescript": "latest",
    "tsup": "latest",
    "vitest": "latest"
  }
}
```

---

## 8. Public Exports

Only expose stable APIs.

Recommended `src/index.ts`:

```ts
export { UniversalDataGrid } from "./components/UniversalDataGrid";

export type {
  UniversalDataGridProps,
  DataGridColumnDef,
  DataGridDataSource,
  DataGridQueryState,
  DataGridExportRequest,
  DataGridSavedView,
  DataGridFilter,
  DataGridSort
} from "./types/dataGrid.types";

export {
  dataGridReducer,
  dataGridActions,
  selectDataGridState,
  selectDataGridQuery,
  selectDataGridView
} from "./store/dataGridSlice";

export { createClientDataSource } from "./adapters/createClientDataSource";
export { createServerDataSource } from "./adapters/createServerDataSource";
export { buildDataGridExportRequest } from "./exporters/exportRequestBuilder";
```

Do not expose internal components unless they are intentionally supported.

---

## 9. App Integration

Each consuming app must register the reducer.

Example:

```ts
import { configureStore } from "@reduxjs/toolkit";
import { dataGridReducer } from "@your-org/ui-data-grid";

export const store = configureStore({
  reducer: {
    dataGrid: dataGridReducer
  }
});
```

If a project already has a shared UI store module, register it there.

---

## 10. Versioning Strategy

Use semantic versioning.

```text
0.x.x = early development, breaking changes allowed
1.x.x = stable production API
patch = bug fixes
minor = additive features
major = breaking changes
```

Examples:

```text
0.1.0 initial internal version
0.2.0 server mode added
0.3.0 saved views added
1.0.0 stable contract
1.1.0 exporter adapter added
2.0.0 breaking state model change
```

---

## 11. Upgrade Strategy Across Projects

To make upgrades easy:

1. Keep public API small.
2. Avoid domain-specific props.
3. Keep feature behavior behind config.
4. Add migration notes for every release.
5. Use deprecation warnings before removing props.
6. Provide codemods only if breaking usage becomes common.
7. Maintain example pages.
8. Maintain Storybook stories.
9. Add compatibility tests.

---

## 12. Changelog Template

Create:

```text
packages/ui-data-grid/CHANGELOG.md
```

Template:

```md
# Changelog

## 0.2.0

### Added
- Server mode data source support.
- Lazy loading placeholder rows.

### Changed
- Improved column sizing persistence.

### Fixed
- Fixed filter chip clearing behavior.

### Migration
- No breaking changes.
```

---

## 13. Breaking Change Policy

A breaking change must include:

- Reason
- Impacted APIs
- Before/after example
- Migration steps
- Fallback strategy

Example:

```md
### Breaking Change: renamed `field` to `accessorKey`

Reason:
Align column model with TanStack naming.

Before:
```ts
{ field: "name", header: "Name" }
```

After:
```ts
{ accessorKey: "name", header: "Name" }
```

Migration:
Run codemod or rename column definitions manually.
```

---

## 14. Compatibility Matrix

Maintain a compatibility matrix.

```md
| ui-data-grid | React | Redux Toolkit | TanStack Table | MUI |
|---|---|---|---|---|
| 0.1.x | >=18 | >=2 | >=8 | >=5 |
| 1.0.x | >=18 | >=2 | >=8 | >=5 |
```

Do not upgrade major peer dependency versions casually.

---

## 15. Recommended Development Workflow

```bash
# install dependencies
pnpm install

# run package in watch mode
pnpm --filter @your-org/ui-data-grid build --watch

# run consuming app
pnpm --filter iam-admin dev

# run tests
pnpm --filter @your-org/ui-data-grid test

# typecheck
pnpm --filter @your-org/ui-data-grid typecheck

# build package
pnpm --filter @your-org/ui-data-grid build
```

---

## 16. Storybook Requirement

Storybook should include stories for:

- Basic table
- Loading table
- Empty table
- Error table
- Client mode filtering
- Server mode filtering
- Grouped table
- Column resize
- Column visibility
- Bulk selection
- Saved view example
- Export request example

Storybook becomes the visual regression and behavior reference across projects.

---

## 17. Testing Requirement

Minimum tests:

- Renders with basic columns and rows.
- Search updates query state.
- Filter updates query state.
- Sort updates query state.
- Column visibility persists.
- Column sizing persists.
- Grouping toggles correctly.
- Server mode emits query changes.
- Export request includes current grid state.
- Empty state appears correctly.
- Error state appears correctly.

---

## 18. Release Checklist

Before releasing a new version:

- Build passes.
- Typecheck passes.
- Unit tests pass.
- Storybook stories reviewed.
- Changelog updated.
- Migration notes added if needed.
- Public exports reviewed.
- Peer dependency changes reviewed.
- Example app tested.

---

## 19. Recommended First Version Scope

Version `0.1.0` should include:

- Client mode
- Server mode contract
- Search
- Basic filters
- Sorting
- Pagination
- Column visibility
- Column resizing
- Density
- Skeleton loading
- Empty/error states
- Redux state scoped by tableId
- Export request builder

Version `0.2.0` should include:

- Grouping
- Advanced filter drawer
- Saved views
- Bulk action bar

Version `0.3.0` should include:

- Column pinning
- Cursor loading
- Better virtualization
- Export backend adapter

Version `1.0.0` should be released only after at least two real modules use the grid successfully.

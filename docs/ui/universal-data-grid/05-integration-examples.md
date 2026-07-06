# Integration Examples

## 1. Install Package

If using monorepo workspace:

```bash
pnpm add @your-org/ui-data-grid --filter your-app-name
```

If using private registry:

```bash
pnpm add @your-org/ui-data-grid
```

Required peer dependencies in consuming app:

```bash
pnpm add react react-dom react-redux @reduxjs/toolkit @tanstack/react-table @tanstack/react-virtual @mui/material @mui/icons-material @emotion/react @emotion/styled
```

---

## 2. Register Reducer

```ts
import { configureStore } from "@reduxjs/toolkit";
import { dataGridReducer } from "@your-org/ui-data-grid";

export const store = configureStore({
  reducer: {
    dataGrid: dataGridReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 3. Client Mode Example

```tsx
import { UniversalDataGrid, createClientDataSource } from "@your-org/ui-data-grid";
import type { DataGridColumnDef } from "@your-org/ui-data-grid";

type UserRow = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "DISABLED" | "PENDING";
  role: string;
  createdAt: string;
};

const columns: DataGridColumnDef<UserRow>[] = [
  {
    id: "name",
    field: "name",
    header: "Name",
    dataType: "string",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: false,
    resizable: true
  },
  {
    id: "email",
    field: "email",
    header: "Email",
    dataType: "string",
    searchable: true,
    sortable: true,
    filterable: true,
    resizable: true
  },
  {
    id: "status",
    field: "status",
    header: "Status",
    dataType: "status",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    resizable: true,
    enumOptions: [
      { label: "Active", value: "ACTIVE" },
      { label: "Disabled", value: "DISABLED" },
      { label: "Pending", value: "PENDING" }
    ]
  },
  {
    id: "role",
    field: "role",
    header: "Role",
    dataType: "string",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    resizable: true
  },
  {
    id: "createdAt",
    field: "createdAt",
    header: "Created At",
    dataType: "datetime",
    sortable: true,
    filterable: true,
    resizable: true
  }
];

const rows: UserRow[] = [
  {
    id: "1",
    name: "Adi",
    email: "adi@example.com",
    status: "ACTIVE",
    role: "Admin",
    createdAt: "2026-07-06T09:00:00+07:00"
  }
];

export function UsersPage() {
  return (
    <UniversalDataGrid<UserRow>
      tableId="iam.users"
      title="Users"
      columns={columns}
      dataSource={createClientDataSource(rows)}
      getRowId={(row) => row.id}
      features={{
        search: true,
        filters: true,
        grouping: true,
        selection: true,
        export: true
      }}
      onExportRequest={(request) => {
        console.log("Export request", request);
      }}
    />
  );
}
```

---

## 4. Server Mode Example

```tsx
import { UniversalDataGrid, createServerDataSource } from "@your-org/ui-data-grid";
import type {
  DataGridColumnDef,
  DataGridLoadRowsRequest,
  DataGridLoadRowsResult
} from "@your-org/ui-data-grid";

type AssetRow = {
  id: string;
  assetCode: string;
  name: string;
  type: string;
  status: string;
  owner: string;
  updatedAt: string;
};

const columns: DataGridColumnDef<AssetRow>[] = [
  {
    id: "assetCode",
    field: "assetCode",
    header: "Asset Code",
    dataType: "string",
    searchable: true,
    sortable: true,
    filterable: true,
    resizable: true
  },
  {
    id: "name",
    field: "name",
    header: "Name",
    dataType: "string",
    searchable: true,
    sortable: true,
    filterable: true,
    resizable: true
  },
  {
    id: "type",
    field: "type",
    header: "Type",
    dataType: "enum",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    resizable: true
  },
  {
    id: "status",
    field: "status",
    header: "Status",
    dataType: "status",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    resizable: true
  },
  {
    id: "owner",
    field: "owner",
    header: "Owner",
    dataType: "string",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    resizable: true
  },
  {
    id: "updatedAt",
    field: "updatedAt",
    header: "Updated At",
    dataType: "datetime",
    sortable: true,
    filterable: true,
    resizable: true
  }
];

async function loadAssets(
  request: DataGridLoadRowsRequest
): Promise<DataGridLoadRowsResult<AssetRow>> {
  const response = await fetch("/api/assets/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      search: request.query.globalSearch,
      filters: request.query.filters,
      sort: request.query.sort,
      grouping: request.query.grouping,
      pagination: request.query.pagination,
      visibleColumns: request.visibleColumns
    }),
    signal: request.signal
  });

  if (!response.ok) {
    throw new Error("Failed to load assets");
  }

  const data = await response.json();

  return {
    rows: data.items,
    total: data.total,
    pageIndex: data.pageIndex,
    pageSize: data.pageSize,
    nextCursor: data.nextCursor,
    previousCursor: data.previousCursor,
    lastRefreshedAt: data.lastRefreshedAt
  };
}

export function AssetsPage() {
  return (
    <UniversalDataGrid<AssetRow>
      tableId="itam.assets"
      title="Assets"
      columns={columns}
      dataSource={createServerDataSource(loadAssets)}
      getRowId={(row) => row.id}
      features={{
        search: true,
        filters: true,
        advancedFilters: true,
        sorting: true,
        pagination: true,
        grouping: true,
        selection: true,
        bulkActions: true,
        export: true,
        savedViews: true
      }}
      onExportRequest={(request) => {
        console.log("Send this to backend export API", request);
      }}
    />
  );
}
```

---

## 5. Export Request Example

When user clicks Export, the grid should produce:

```json
{
  "tableId": "itam.assets",
  "format": "xlsx",
  "scope": "filtered_result",
  "query": {
    "globalSearch": "laptop",
    "filters": [
      {
        "id": "f1",
        "columnId": "status",
        "operator": "isAnyOf",
        "value": ["ACTIVE", "IN_REPAIR"]
      }
    ],
    "sort": [
      {
        "columnId": "updatedAt",
        "direction": "desc"
      }
    ],
    "grouping": ["type"],
    "pagination": {
      "type": "page",
      "pageIndex": 0,
      "pageSize": 25
    }
  },
  "columns": [
    {
      "id": "assetCode",
      "field": "assetCode",
      "header": "Asset Code",
      "dataType": "string",
      "order": 0,
      "visible": true
    },
    {
      "id": "name",
      "field": "name",
      "header": "Name",
      "dataType": "string",
      "order": 1,
      "visible": true
    }
  ],
  "selectedRowIds": [],
  "requestedAt": "2026-07-06T13:00:00+07:00"
}
```

---

## 6. Backend Export API Recommendation

Recommended endpoint:

```text
POST /api/exports/data-grid
```

Request body:

```json
{
  "tableId": "itam.assets",
  "format": "xlsx",
  "scope": "filtered_result",
  "query": {},
  "columns": []
}
```

Response:

```json
{
  "exportJobId": "exp_123",
  "status": "QUEUED"
}
```

Then poll:

```text
GET /api/exports/{exportJobId}
```

Response:

```json
{
  "exportJobId": "exp_123",
  "status": "COMPLETED",
  "downloadUrl": "/api/exports/exp_123/download"
}
```

---

## 7. Backend Search API Recommendation

For server-mode tables, prefer POST-based search endpoint.

```text
POST /api/{resource}/search
```

Example request:

```json
{
  "search": "john",
  "filters": [
    {
      "columnId": "status",
      "operator": "isAnyOf",
      "value": ["ACTIVE", "PENDING"]
    }
  ],
  "sort": [
    {
      "columnId": "createdAt",
      "direction": "desc"
    }
  ],
  "grouping": ["status"],
  "pagination": {
    "type": "page",
    "pageIndex": 0,
    "pageSize": 25
  }
}
```

Example response:

```json
{
  "items": [],
  "total": 0,
  "pageIndex": 0,
  "pageSize": 25,
  "lastRefreshedAt": "2026-07-06T13:00:00+07:00"
}
```

---

## 8. Migration From Local Component to Package

If you start inside one app under:

```text
src/shared/data-grid
```

Keep these rules:

- No app-specific imports.
- No route dependencies.
- No auth dependencies.
- No product-specific statuses.
- Public exports through `index.ts`.
- Types grouped under `types/`.
- Store grouped under `store/`.
- Data source contract generic.
- Export contract generic.

Then move to:

```text
packages/ui-data-grid/src
```

with minimal changes.

---

## 9. Recommended Adoption Plan

1. Implement grid in one project.
2. Use it on one simple admin list page.
3. Use it on one server-mode page.
4. Extract into package.
5. Use it in a second project/module.
6. Stabilize API.
7. Release version `1.0.0`.

---

## 10. Upgrade Checklist Per Consuming Project

When upgrading `@your-org/ui-data-grid`:

```text
[ ] Read changelog
[ ] Check compatibility matrix
[ ] Run install/update
[ ] Run typecheck
[ ] Run tests
[ ] Open Storybook/demo page
[ ] Open key consuming pages
[ ] Verify saved preferences still work
[ ] Verify export request still works
[ ] Verify server-mode query contract still works
[ ] Commit lockfile update
```

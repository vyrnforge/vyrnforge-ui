import { Badge, Button, Icon, ToolbarButton } from "@vyrnforge/ui-components";
import {
  createLocalStorageGridPersistence,
  type DataGridBulkAction,
  type DataGridColumnDef
} from "@vyrnforge/ui-data-grid";
import type { UserRecord } from "../../data/users";

export const userColumns: DataGridColumnDef<UserRecord>[] = [
  {
    id: "name",
    header: "User",
    accessorKey: "name",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    width: 220,
    cell: (_value, row) => (
      <span className="dv-playground-demo-user-cell">
        <strong>{row.name}</strong>
        <small>{row.email}</small>
      </span>
    )
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    width: 150
  },
  {
    id: "team",
    header: "Team",
    accessorKey: "team",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    width: 150
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    filterable: true,
    groupable: true,
    dataType: "status",
    width: 130,
    cell: (value) => <UserStatusBadge status={String(value)} />
  },
  {
    id: "region",
    header: "Region",
    accessorKey: "region",
    searchable: true,
    sortable: true,
    filterable: true,
    groupable: true,
    width: 130
  },
  {
    id: "score",
    header: "Score",
    accessorKey: "score",
    sortable: true,
    dataType: "number",
    align: "right",
    width: 110,
    cell: (value) => <span className="dv-playground-demo-score">{String(value)}</span>
  },
  {
    id: "enabled",
    header: "Enabled",
    accessorKey: "enabled",
    sortable: true,
    dataType: "boolean",
    align: "center",
    width: 120,
    cell: (value) => (
      <span className={value ? "dv-playground-demo-boolean dv-playground-demo-boolean-on" : "dv-playground-demo-boolean dv-playground-demo-boolean-off"}>
        {value ? "Enabled" : "Paused"}
      </span>
    )
  },
  {
    id: "createdAt",
    header: "Created",
    accessorKey: "createdAt",
    sortable: true,
    dataType: "date",
    width: 150,
    cell: (value) => formatDate(value)
  }
];

export const resizableUserColumns: DataGridColumnDef<UserRecord>[] = userColumns.map((column) => ({
  ...column,
  minWidth: column.id === "name" ? 180 : 100,
  resizable: true
}));

export const stressColumns: DataGridColumnDef<UserRecord>[] = [
  ...resizableUserColumns,
  {
    id: "contact",
    header: "Contact",
    accessorFn: (row) => `${row.name} / ${row.email}`,
    searchable: true,
    width: 260,
    resizable: true
  },
  {
    id: "health",
    header: "Health",
    accessorFn: (row) => (row.score >= 80 ? "Healthy" : row.score >= 60 ? "Watch" : "At risk"),
    sortable: true,
    filterable: true,
    width: 130,
    resizable: true
  }
];

export const persistenceAdapter = createLocalStorageGridPersistence({
  namespace: "vyrnforge-playground"
});

export const userBulkActions: DataGridBulkAction<UserRecord>[] = [
  {
    id: "enable",
    label: "Enable",
    variant: "primary",
    onClick: ({ selectedRows }) => {
      console.info("Enable selected users", selectedRows.map((row) => row.id));
    }
  },
  {
    id: "archive",
    label: "Archive",
    variant: "danger",
    onClick: ({ selectedRows }) => {
      console.info("Archive selected users", selectedRows.map((row) => row.id));
    }
  }
];

export function GridNote({ children }: { children: string }) {
  return <p className="dv-playground-note">{children}</p>;
}

export function SectionActions() {
  return (
    <div className="dv-playground-inline-actions">
      <Button leftSlot={<Icon name="Check" />} size="sm" variant="primary">Save view</Button>
      <ToolbarButton icon={<Icon name="Reset" />} label="Reset" tooltip="Reset view" />
    </div>
  );
}

function UserStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Active"
      ? "success"
      : status === "Pending"
        ? "warning"
        : status === "Suspended"
          ? "danger"
          : "neutral";

  return <Badge variant={variant}>{status}</Badge>;
}

function formatDate(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

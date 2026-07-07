import { useMemo, useState } from "react";
import {
  createLocalStorageGridPersistence,
  createGridState,
  createDataGridTheme,
  UniversalDataGrid,
  type DataGridBulkAction,
  type DataGridColumnDef,
  type DataGridState,
  type DataGridTheme,
  type DataGridThemeVars
} from "@dravyn/ui-data-grid";
import { demoRows, type DemoRow } from "./mockData";

const statusToneByStatus: Record<DemoRow["status"], string> = {
  Active: "success",
  Pending: "warning",
  Suspended: "danger",
  Archived: "neutral"
};

const statusClassName = (status: DemoRow["status"]) =>
  `udg-badge udg-badge--${statusToneByStatus[status]}`;

type ThemePreview = {
  id: string;
  label: string;
  description: string;
  theme: DataGridTheme;
  themeVars?: DataGridThemeVars;
  className?: string;
};

function StatusCell(value: unknown) {
  const status = String(value) as DemoRow["status"];
  return <span className={statusClassName(status)}>{status}</span>;
}

function BooleanCell(value: unknown) {
  return (
    <span className={`demo-boolean ${value ? "demo-boolean-on" : "demo-boolean-off"}`}>
      {value ? "Enabled" : "Disabled"}
    </span>
  );
}

function ScoreCell(value: unknown) {
  return <strong className="demo-score">{Number(value).toLocaleString()}</strong>;
}

function MoneyCell(value: unknown) {
  return (
    <strong className="demo-score">
      {new Intl.NumberFormat("en", {
        currency: "USD",
        maximumFractionDigits: 0,
        style: "currency"
      }).format(Number(value))}
    </strong>
  );
}

function DateCell(value: unknown) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(String(value)));
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const persistenceAdapter = useMemo(
    () => createLocalStorageGridPersistence({ namespace: "udg-playground" }),
    []
  );
  const customTheme = useMemo(
    () =>
      createDataGridTheme({
        "--udg-primary": "#1d4ed8",
        "--udg-primary-hover": "#1e40af",
        "--udg-primary-soft": "#dbeafe",
        "--udg-radius-md": "10px",
        "--udg-header-bg": "#eef4ff",
        "--udg-row-hover-bg": "#f5f8ff"
      }),
    []
  );
  const themePreviews = useMemo<ThemePreview[]>(
    () => [
      {
        id: "light",
        label: "Light Default",
        description: "Production-ready neutral slate and blue baseline.",
        theme: "light"
      },
      {
        id: "dark",
        label: "Dark Default",
        description: "Calm dark slate surfaces with readable contrast.",
        theme: "dark",
        className: "theme-preview-dark"
      },
      {
        id: "enterprise",
        label: "Enterprise",
        description: "Light-oriented enterprise preset for dense SaaS pages.",
        theme: "enterprise"
      },
      {
        id: "custom",
        label: "Custom Vars",
        description: "Scoped CSS variable overrides for app branding.",
        theme: "custom-preview",
        themeVars: customTheme,
        className: "theme-preview-custom"
      }
    ],
    [customTheme]
  );
  const [controlledState, setControlledState] = useState<DataGridState>(() =>
    createGridState({
      grouping: ["ownerName", "status"],
      density: "standard",
      pagination: {
        pageIndex: 0,
        pageSize: 5
      }
    })
  );
  const bulkActions = useMemo<DataGridBulkAction<DemoRow>[]>(
    () => [
      {
        id: "flag",
        label: "Flag review",
        variant: "primary",
        onClick: (context) => {
          console.info("Flag selected rows", context.selectedRowIds);
        }
      },
      {
        id: "disable",
        label: "Disable",
        variant: "danger",
        disabled: (context) => context.selectedRowIds.length === 0,
        onClick: (context) => {
          console.info("Disable selected rows", context.selectedRows);
        }
      }
    ],
    []
  );

  const baseColumns = useMemo<DataGridColumnDef<DemoRow>[]>(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        hideable: false,
        sortable: true,
        searchable: false,
        align: "right",
        width: 80,
        minWidth: 70
      },
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        hideable: false,
        sortable: true,
        searchable: true,
        width: 220,
        minWidth: 180
      },
      {
        id: "ownerName",
        header: "Owner",
        accessorFn: (row) => row.owner.name,
        sortable: true,
        searchable: true,
        width: 150,
        minWidth: 130
      },
      {
        id: "team",
        header: "Team",
        accessorFn: (row) => row.owner.team,
        sortable: true,
        searchable: true,
        width: 150,
        minWidth: 130
      },
      {
        id: "owner",
        header: "Owner / Team",
        accessorFn: (row) => `${row.owner.name} / ${row.owner.team}`,
        hidden: true,
        sortable: true,
        searchable: true,
        width: 260,
        minWidth: 220
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email",
        hidden: true,
        sortable: true,
        searchable: true,
        width: 240,
        minWidth: 200
      },
      {
        id: "domain",
        header: "Domain",
        accessorFn: (row) => String(row.email).split("@")[1],
        hidden: true,
        sortable: true,
        searchable: true,
        width: 170,
        minWidth: 150
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: StatusCell,
        sortable: true,
        searchable: true,
        align: "center",
        width: 140,
        minWidth: 130
      },
      {
        id: "enabled",
        header: "Enabled",
        accessorKey: "enabled",
        cell: BooleanCell,
        sortable: true,
        searchable: false,
        align: "center",
        width: 130,
        minWidth: 120
      },
      {
        id: "score",
        header: "Score",
        accessorKey: "score",
        cell: ScoreCell,
        sortable: true,
        searchable: false,
        align: "right",
        width: 110,
        minWidth: 100
      },
      {
        id: "createdAt",
        header: "Created",
        accessorKey: "createdAt",
        cell: DateCell,
        sortable: true,
        searchable: false,
        align: "center",
        width: 150,
        minWidth: 140
      },
      {
        id: "month",
        header: "Month",
        accessorFn: (row) => DateCell(row.createdAt).slice(3),
        hidden: true,
        sortable: true,
        searchable: false,
        width: 120,
        minWidth: 110
      },
      {
        id: "tier",
        header: "Tier",
        accessorFn: (row) => (row.score >= 80 ? "Gold" : row.score >= 60 ? "Silver" : "Bronze"),
        hidden: true,
        sortable: true,
        searchable: true,
        align: "center",
        width: 110,
        minWidth: 100
      }
    ],
    []
  );

  const typeDemoColumns = useMemo<DataGridColumnDef<DemoRow>[]>(
    () => [
      {
        id: "name",
        header: "String",
        accessorKey: "name",
        dataType: "string",
        width: 220,
        minWidth: 180,
        sortable: true
      },
      {
        id: "score",
        header: "Number",
        accessorKey: "score",
        dataType: "number",
        cell: ScoreCell,
        align: "right",
        width: 120,
        minWidth: 100,
        sortable: true
      },
      {
        id: "createdAt",
        header: "Date",
        accessorKey: "createdAt",
        dataType: "date",
        cell: DateCell,
        align: "center",
        width: 150,
        minWidth: 140,
        sortable: true
      },
      {
        id: "enabled",
        header: "Boolean",
        accessorKey: "enabled",
        dataType: "boolean",
        cell: BooleanCell,
        align: "center",
        width: 140,
        minWidth: 130,
        sortable: true
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        dataType: "status",
        cell: StatusCell,
        align: "center",
        width: 140,
        minWidth: 130,
        sortable: true
      },
      {
        id: "owner",
        header: "Custom Cell",
        accessorFn: (row) => row.owner.name,
        dataType: "custom",
        width: 220,
        minWidth: 180,
        cell: (_value, row) => (
          <span className="demo-user-cell">
            <strong>{row.owner.name}</strong>
            <small>{row.owner.team}</small>
          </span>
        )
      }
    ],
    []
  );

  const resizeColumns = useMemo<DataGridColumnDef<DemoRow>[]>(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        align: "right",
        hideable: false,
        resizable: false,
        width: 72,
        minWidth: 72
      },
      {
        id: "name",
        header: "Workspace",
        accessorKey: "name",
        sortable: true,
        width: 220,
        minWidth: 160,
        maxWidth: 360
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email",
        sortable: true,
        width: 260,
        minWidth: 180,
        maxWidth: 420
      },
      {
        id: "owner",
        header: "Owner",
        accessorFn: (row) => row.owner.name,
        width: 160,
        minWidth: 120,
        maxWidth: 260
      },
      {
        id: "team",
        header: "Team",
        accessorFn: (row) => row.owner.team,
        width: 150,
        minWidth: 120
      },
      {
        id: "region",
        header: "Region",
        accessorKey: "region",
        align: "center",
        width: 140,
        minWidth: 110,
        maxWidth: 190
      },
      {
        id: "plan",
        header: "Plan",
        accessorKey: "plan",
        width: 150,
        minWidth: 110
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: StatusCell,
        align: "center",
        width: 140,
        minWidth: 130
      },
      {
        id: "spend",
        header: "Spend",
        accessorKey: "spend",
        cell: MoneyCell,
        align: "right",
        width: 140,
        minWidth: 120,
        maxWidth: 220
      },
      {
        id: "score",
        header: "Score",
        accessorKey: "score",
        cell: ScoreCell,
        align: "right",
        width: 110,
        minWidth: 96,
        maxWidth: 160
      },
      {
        id: "createdAt",
        header: "Created",
        accessorKey: "createdAt",
        cell: DateCell,
        align: "center",
        width: 150,
        minWidth: 130
      },
      {
        id: "notes",
        header: "Operational Notes",
        accessorKey: "notes",
        width: 360,
        minWidth: 220,
        maxWidth: 620
      }
    ],
    []
  );

  const stateColumns = useMemo<DataGridColumnDef<DemoRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        hideable: false,
        width: 220,
        minWidth: 180
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: StatusCell,
        align: "center",
        width: 140,
        minWidth: 120
      }
    ],
    []
  );

  return (
    <main className="playground-shell">
      <header className="playground-header">
        <div>
          <h1>Universal Data Grid Playground</h1>
          <p>Native-first package reuse validation with workspace consumption.</p>
        </div>
      </header>

      <section className="playground-section">
        <div className="section-heading">
          <div>
            <h2>Example A: Uncontrolled Basic Grid</h2>
            <p>Search, sorting, pagination, loading, and error states.</p>
          </div>
          <div className="toolbar-actions">
            <label>
              <input
                type="checkbox"
                checked={loading}
                onChange={(event) => setLoading(event.currentTarget.checked)}
              />
              Loading
            </label>
            <label>
              <input
                type="checkbox"
                checked={showError}
                onChange={(event) => setShowError(event.currentTarget.checked)}
              />
              Error
            </label>
          </div>
        </div>
        <UniversalDataGrid
          tableId="playground.uncontrolled"
          title="Workspaces"
          columns={baseColumns}
          rows={demoRows}
          getRowId={(row) => row.id}
          selectable
          enableRowClickSelection
          getRowSelectable={(row) => row.status !== "Suspended"}
          bulkActions={bulkActions}
          enableGrouping
          defaultGrouping={["status"]}
          defaultExpandedGroups="all"
          loading={loading}
          error={showError ? "Example recoverable load error." : null}
          emptyMessage="No workspaces match the current view."
          defaultState={{
            density: "compact",
            pagination: {
              pageIndex: 0,
              pageSize: 10
            }
          }}
          persistenceAdapter={persistenceAdapter}
          persistState
          theme="enterprise"
          variant="card"
          maxHeight={520}
          onResetView={() => {
            setLoading(false);
            setShowError(false);
          }}
        />
      </section>

      <section className="playground-section">
        <div className="section-heading">
          <div>
            <h2>Example B: Controlled Grid</h2>
            <p>Grid state is stored in React and rendered below the table.</p>
          </div>
        </div>
        <UniversalDataGrid
          tableId="playground.controlled"
          columns={baseColumns}
          rows={demoRows.slice(0, 24)}
          getRowId={(row) => row.id}
          selectable
          selectionMode="multiple"
          bulkActions={bulkActions}
          enableGrouping
          defaultExpandedGroups="all"
          state={controlledState}
          onStateChange={setControlledState}
          theme="light"
          variant="bordered"
        />
        <pre className="state-preview">
          {JSON.stringify(controlledState, null, 2)}
        </pre>
      </section>

      <section className="playground-section">
        <div className="section-heading">
          <div>
            <h2>Example C: Column Type Demo</h2>
            <p>String, number, date, boolean, status, and custom rendering.</p>
          </div>
        </div>
        <UniversalDataGrid
          tableId="playground.column-types"
          columns={typeDemoColumns}
          rows={demoRows}
          getRowId={(row) => row.id}
          defaultState={{
            grouping: ["status"],
            density: "comfortable",
            pagination: {
              pageIndex: 0,
              pageSize: 10
            }
          }}
          selectable
          enableGrouping
          theme="dark"
          variant="card"
        />
      </section>

      <section className="playground-section">
        <div className="section-heading">
          <div>
            <h2>Example D: Theme Preview</h2>
            <p>Light, dark, enterprise, and custom variable overrides.</p>
          </div>
        </div>
        <div className="theme-preview-grid">
          {themePreviews.map((preview) => (
            <article
              className={`theme-preview-card ${
                preview.id === "dark" ? "theme-preview-card--dark" : ""
              }`}
              key={preview.id}
            >
              <div className="theme-preview-heading">
                <h3>{preview.label}</h3>
                <p>{preview.description}</p>
              </div>
              <UniversalDataGrid
                tableId={`playground.theme.${preview.id}`}
                title={`${preview.label} Grid`}
                columns={typeDemoColumns}
                rows={demoRows.slice(0, 12)}
                getRowId={(row) => row.id}
                className={preview.className}
                defaultState={{
                  density: "compact",
                  pagination: {
                    pageIndex: 0,
                    pageSize: 4
                  }
                }}
                emptyMessage="No theme preview records."
                theme={preview.theme}
                themeVars={preview.themeVars}
                variant="card"
              />
            </article>
          ))}
        </div>

        <div className="theme-state-grid">
          <UniversalDataGrid
            tableId="playground.state.loading"
            title="Loading State"
            columns={stateColumns}
            rows={[]}
            loading
            defaultState={{ density: "compact" }}
            theme="light"
            variant="bordered"
          />
          <UniversalDataGrid
            tableId="playground.state.empty"
            title="Empty State"
            columns={stateColumns}
            rows={[]}
            emptyMessage="No records are available for this example."
            defaultState={{ density: "compact" }}
            theme="enterprise"
            variant="bordered"
          />
          <UniversalDataGrid
            tableId="playground.state.error"
            title="Error State"
            columns={stateColumns}
            rows={[]}
            error="The demo request failed."
            defaultState={{ density: "compact" }}
            theme="dark"
            variant="bordered"
          />
        </div>
      </section>

      <section className="playground-section">
        <div className="section-heading">
          <div>
            <h2>Example E: Column Resizing</h2>
            <p>Drag header handles, use keyboard arrows, and reset sizes from the column menu.</p>
          </div>
        </div>
        <div className="resize-demo-grid">
          <UniversalDataGrid
            tableId="playground.resize.light"
            title="Resizable Columns"
            columns={resizeColumns}
            rows={demoRows}
            getRowId={(row) => row.id}
            defaultState={{
              density: "compact",
              pagination: {
                pageIndex: 0,
                pageSize: 8
              }
            }}
            persistenceAdapter={persistenceAdapter}
            persistState
            theme="light"
            variant="card"
            maxHeight={460}
          />
          <UniversalDataGrid
            tableId="playground.resize.dark"
            title="Dark Resize Check"
            columns={resizeColumns}
            rows={demoRows.slice(0, 18)}
            getRowId={(row) => row.id}
            defaultState={{
              density: "compact",
              pagination: {
                pageIndex: 0,
                pageSize: 6
              }
            }}
            theme="dark"
            variant="card"
            maxHeight={420}
          />
        </div>
      </section>
    </main>
  );
}

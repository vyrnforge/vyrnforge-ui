import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { userColumns } from "./gridShared";

const stateColumns = userColumns.slice(0, 5);

export function GridStatesPage() {
  return (
    <div className="dv-playground-grid three">
      <section className="dv-playground-card">
        <h2>Empty grid</h2>
        <UniversalDataGrid
          tableId="dv-playground-grid-empty-state"
          rows={[]}
          columns={stateColumns}
          getRowId={(row) => row.id}
          emptyMessage="No users match this workspace."
          variant="bordered"
        />
      </section>
      <section className="dv-playground-card">
        <h2>Error grid</h2>
        <UniversalDataGrid
          tableId="dv-playground-grid-error-state"
          rows={[]}
          columns={stateColumns}
          getRowId={(row) => row.id}
          error="The user directory could not be reached."
          variant="bordered"
        />
      </section>
      <section className="dv-playground-card">
        <h2>Loading grid</h2>
        <UniversalDataGrid
          tableId="dv-playground-grid-loading-state"
          rows={[]}
          columns={stateColumns}
          getRowId={(row) => row.id}
          loading
          variant="bordered"
        />
      </section>
    </div>
  );
}

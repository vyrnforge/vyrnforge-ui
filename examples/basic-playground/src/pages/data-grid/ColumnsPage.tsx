import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, persistenceAdapter, userColumns } from "./gridShared";

export function ColumnsPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <h2>Column visibility and ordering</h2>
          <GridNote>The grid keeps its own column management while inheriting shared visual tokens.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="vf-playground-column-management"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        defaultState={{
          columnVisibility: { email: false, createdAt: false },
          columnOrder: ["name", "status", "role", "team", "region", "score", "enabled", "createdAt"]
        }}
        persistenceAdapter={persistenceAdapter}
        persistState
        variant="bordered"
      />
    </section>
  );
}

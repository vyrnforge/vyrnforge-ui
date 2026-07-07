import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, persistenceAdapter, userColumns } from "./gridShared";

export function ColumnsPage() {
  return (
    <section className="playground-panel">
      <div className="section-heading">
        <div>
          <h2>Column visibility and ordering</h2>
          <GridNote>The grid keeps its own column management while inheriting shared visual tokens.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="playground-column-management"
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

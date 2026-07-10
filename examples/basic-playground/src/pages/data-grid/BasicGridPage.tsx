import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, SectionActions, persistenceAdapter, userColumns } from "./gridShared";

export function BasicGridPage() {
  return (
    <section className="dv-playground-panel">
      <div className="dv-playground-section-heading">
        <div>
          <h2>Basic user grid</h2>
          <GridNote>Search, sorting, pagination, density, and column controls use the current grid package.</GridNote>
        </div>
        <SectionActions />
      </div>
      <UniversalDataGrid
        tableId="dv-playground-basic-users"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        persistenceAdapter={persistenceAdapter}
        persistState
        variant="card"
      />
    </section>
  );
}

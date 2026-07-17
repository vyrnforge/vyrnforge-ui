import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, userColumns } from "./gridShared";

export function FilteringPage() {
  return (
    <section className="dv-playground-panel">
      <div className="dv-playground-section-heading">
        <div>
          <h2>Search and filters</h2>
          <GridNote>This view starts with APAC active users and leaves the toolbar editable.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="dv-playground-filtering"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        defaultState={{
          search: "APAC",
          filters: [
            { id: "status-active", columnId: "status", operator: "equals", value: "Active" }
          ],
          pagination: { pageIndex: 0, pageSize: 10 }
        }}
        variant="card"
      />
    </section>
  );
}

import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, userBulkActions, userColumns } from "./gridShared";

export function SelectionPage() {
  return (
    <section className="dv-playground-panel">
      <div className="dv-playground-section-heading">
        <div>
          <h2>Selection and bulk actions</h2>
          <GridNote>Suspended rows are visible but not selectable in this example.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="dv-playground-selection"
        rows={users.slice(0, 32)}
        columns={userColumns}
        getRowId={(row) => row.id}
        selectable
        selectionMode="multiple"
        getRowSelectable={(row) => row.status !== "Suspended"}
        bulkActions={userBulkActions}
        variant="bordered"
      />
    </section>
  );
}

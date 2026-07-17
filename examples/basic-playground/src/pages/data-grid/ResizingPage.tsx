import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, resizableUserColumns } from "./gridShared";

export function ResizingPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <h2>Resizable columns</h2>
          <GridNote>Columns define min widths and opt into the package's resize handling.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="vf-playground-resizing"
        rows={users}
        columns={resizableUserColumns}
        getRowId={(row) => row.id}
        defaultState={{
          columnSizing: { name: 260, role: 180, team: 180, status: 150 }
        }}
        maxHeight={560}
        variant="bordered"
      />
    </section>
  );
}

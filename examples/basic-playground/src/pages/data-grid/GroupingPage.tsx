import { Badge } from "@dravyn/ui-components";
import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, userColumns } from "./gridShared";

export function GroupingPage() {
  return (
    <section className="dv-playground-panel">
      <div className="dv-playground-section-heading">
        <div>
          <h2>Grouping</h2>
          <GridNote>Grouping starts by team and status using the grid's current grouping behavior.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="dv-playground-grouping"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        enableGrouping
        defaultGrouping={["team", "status"]}
        defaultExpandedGroups="all"
        renderGroupHeader={({ group }) => (
          <span className="dv-playground-group-header">
            <strong>{group.label}</strong>
            <Badge variant="neutral">{group.rowCount} rows</Badge>
          </span>
        )}
        variant="card"
      />
    </section>
  );
}

import { Badge } from "@dravyn/ui-components";
import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, userColumns } from "./gridShared";

export function GroupingPage() {
  return (
    <section className="playground-panel">
      <div className="section-heading">
        <div>
          <h2>Grouping</h2>
          <GridNote>Grouping starts by team and status using the grid's current grouping behavior.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="playground-grouping"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        enableGrouping
        defaultGrouping={["team", "status"]}
        defaultExpandedGroups="all"
        renderGroupHeader={({ group }) => (
          <span className="group-header">
            <strong>{group.label}</strong>
            <Badge variant="neutral">{group.rowCount} rows</Badge>
          </span>
        )}
        variant="card"
      />
    </section>
  );
}

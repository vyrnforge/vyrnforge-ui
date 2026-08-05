import { Badge } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, userColumns } from "./gridShared";

export function GroupingPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <h2>Grouping</h2>
          <GridNote>Grouping starts by team and status using the grid’s current grouping behavior.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="vf-playground-grouping"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        enableGrouping
        defaultGrouping={["team", "status"]}
        defaultExpandedGroups="all"
        renderGroupHeader={({ group }) => (
          <span className="vf-playground-group-header">
            <strong>{group.label}</strong>
            <Badge variant="neutral">{group.rowCount} rows</Badge>
          </span>
        )}
        variant="card"
      />
    </section>
  );
}

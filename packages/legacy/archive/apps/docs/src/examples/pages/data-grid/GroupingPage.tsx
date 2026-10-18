import { Badge, Inline, Section } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "./gridShared";

export function GroupingPage() {
  return (
    <Section
      description="Grouping starts by team and status using the grid’s current grouping behavior."
      title="Grouping"
    >
      <UniversalDataGrid
        tableId="vf-docs-grouping"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        enableGrouping
        defaultGrouping={["team", "status"]}
        defaultExpandedGroups="all"
        renderGroupHeader={({ group }) => (
          <Inline align="center" gap="sm">
            <strong>{group.label}</strong>
            <Badge variant="neutral">{group.rowCount} rows</Badge>
          </Inline>
        )}
        variant="card"
      />
    </Section>
  );
}

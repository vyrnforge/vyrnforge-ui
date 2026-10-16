import { Section } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "./gridShared";

export function FilteringPage() {
  return (
    <Section
      description="This view starts with APAC active users and leaves the toolbar editable."
      title="Search and filters"
    >
      <UniversalDataGrid
        tableId="vf-docs-filtering"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        defaultState={{
          search: "APAC",
          filters: [
            {
              id: "status-active",
              columnId: "status",
              operator: "equals",
              value: "Active",
            },
          ],
          pagination: { pageIndex: 0, pageSize: 10 },
        }}
        variant="card"
      />
    </Section>
  );
}

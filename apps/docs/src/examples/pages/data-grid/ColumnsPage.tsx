import { Section } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { persistenceAdapter, userColumns } from "./gridShared";

export function ColumnsPage() {
  return (
    <Section
      description="The grid keeps its own column management while inheriting shared visual tokens."
      title="Column visibility and ordering"
    >
      <UniversalDataGrid
        tableId="vf-docs-column-management"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        defaultState={{
          columnVisibility: { email: false, createdAt: false },
          columnOrder: [
            "name",
            "status",
            "role",
            "team",
            "region",
            "score",
            "enabled",
            "createdAt",
          ],
        }}
        persistenceAdapter={persistenceAdapter}
        persistState
        variant="bordered"
      />
    </Section>
  );
}

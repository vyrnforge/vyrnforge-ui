import { Panel } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../data/users";
import { persistenceAdapter, userColumns } from "./gridShared";

export function BasicGridPage() {
  return (
    <Panel title="Users">
      <UniversalDataGrid
        tableId="vf-docs-basic-users"
        rows={users}
        columns={userColumns}
        getRowId={(row) => row.id}
        persistenceAdapter={persistenceAdapter}
        persistState
        variant="card"
      />
    </Panel>
  );
}

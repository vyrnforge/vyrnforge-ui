import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";
import { users } from "../../data/users";
import { persistenceAdapter, userColumns } from "./gridShared";

export function BasicGridPage() {
  return (
    <DemoPage
      accessibility="Give the grid a meaningful surrounding heading and test keyboard access for sorting, column actions, and pagination."
      avoid="Avoid passing application fetching, mutations, or a global store into the grid package."
      description="A specialized data-management grid with local search, sorting, pagination, and persisted view preferences."
      importSnippet={'import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";'}
      packageName="@vyrnforge/ui-data-grid"
      relatedComponents={["PageToolbar", "SearchInput", "DataGrid state contracts"]}
      status="stable"
      title="Basic data grid"
      usage="Use UniversalDataGrid for structured, column-based data management. Keep row data and business workflows in the application."
    >
      <DemoSection description="Search, sorting, pagination, density, and column controls use the current data-grid package." title="Live preview">
        <DemoBlock
          defaultCodeVisible
          code={'<UniversalDataGrid\n  tableId="users"\n  columns={userColumns}\n  rows={users}\n  getRowId={(row) => row.id}\n  persistState\n  persistenceAdapter={persistenceAdapter}\n  variant="card"\n/>'}
          preview={<UniversalDataGrid tableId="dv-playground-basic-users" rows={users} columns={userColumns} getRowId={(row) => row.id} persistenceAdapter={persistenceAdapter} persistState variant="card" />}
          title="Users"
        />
      </DemoSection>
    </DemoPage>
  );
}

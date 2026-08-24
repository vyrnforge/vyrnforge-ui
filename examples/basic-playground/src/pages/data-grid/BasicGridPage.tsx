import { Panel } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { users } from "../../data/users";
import { persistenceAdapter, userColumns } from "./gridShared";

const importCode =
  'import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";';

export function BasicGridPage() {
  return (
    <ComponentDemoPage
      accessibility={[
        "Give the grid a meaningful surrounding heading and test keyboard access for sorting, column actions, and pagination.",
      ]}
      avoidWhen={[
        "Application fetching, mutations, and global state should remain outside the grid package.",
      ]}
      description="A specialized data-management grid with local search, sorting, pagination, and persisted view preferences."
      importCode={importCode}
      packageName="@vyrnforge/ui-data-grid"
      relatedComponents={[]}
      sections={[
        {
          id: "basic-usage",
          label: "Basic usage",
          title: "Basic usage",
          children: (
            <Panel title="Users">
              <UniversalDataGrid
                tableId="vf-playground-basic-users"
                rows={users}
                columns={userColumns}
                getRowId={(row) => row.id}
                persistenceAdapter={persistenceAdapter}
                persistState
                variant="card"
              />
            </Panel>
          ),
        },
      ]}
      title="UniversalDataGrid"
      useWhen={[
        "Use UniversalDataGrid for structured, column-based data management while the application owns row data and business workflows.",
      ]}
    />
  );
}

import { Card, Heading, Stack } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { userColumns } from "./gridShared";

const stateColumns = userColumns.slice(0, 5);

export function GridStatesPage() {
  return (
    <div className="vf-docs-example-grid vf-docs-example-grid--three">
      <Card padding="md" variant="bordered">
        <Stack gap="md">
          <Heading size="sm">Empty grid</Heading>
          <UniversalDataGrid
            tableId="vf-docs-grid-empty-state"
            rows={[]}
            columns={stateColumns}
            getRowId={(row) => row.id}
            emptyMessage="No users match this workspace."
            variant="bordered"
          />
        </Stack>
      </Card>
      <Card padding="md" variant="bordered">
        <Stack gap="md">
          <Heading size="sm">Error grid</Heading>
          <UniversalDataGrid
            tableId="vf-docs-grid-error-state"
            rows={[]}
            columns={stateColumns}
            getRowId={(row) => row.id}
            error="The user directory could not be reached."
            variant="bordered"
          />
        </Stack>
      </Card>
      <Card padding="md" variant="bordered">
        <Stack gap="md">
          <Heading size="sm">Loading grid</Heading>
          <UniversalDataGrid
            tableId="vf-docs-grid-loading-state"
            rows={[]}
            columns={stateColumns}
            getRowId={(row) => row.id}
            loading
            variant="bordered"
          />
        </Stack>
      </Card>
    </div>
  );
}

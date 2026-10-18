import { Section } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { resizableUserColumns } from "./gridShared";

export function ResizingPage() {
  return (
    <Section
      description="Columns define min widths and opt into the package’s resize handling."
      title="Resizable columns"
    >
      <UniversalDataGrid
        tableId="vf-docs-resizing"
        rows={users}
        columns={resizableUserColumns}
        getRowId={(row) => row.id}
        defaultState={{
          columnSizing: { name: 260, role: 180, team: 180, status: 150 },
        }}
        maxHeight={560}
        variant="bordered"
      />
    </Section>
  );
}

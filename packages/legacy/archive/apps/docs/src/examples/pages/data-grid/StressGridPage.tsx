import { Section } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { stressColumns } from "./gridShared";

const stressRows = Array.from({ length: 4 }, (_, round) =>
  users.map((user) => ({
    ...user,
    id: user.id + round * users.length,
    name: `${user.name} / batch ${round + 1}`,
  })),
).flat();

export function StressGridPage() {
  return (
    <Section
      description="Several hundred rows and wider columns exercise existing pagination and layout behavior."
      title="Stress grid"
    >
      <UniversalDataGrid
        tableId="vf-docs-stress"
        rows={stressRows}
        columns={stressColumns}
        getRowId={(row) => row.id}
        defaultState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
        maxHeight={620}
        variant="card"
      />
    </Section>
  );
}

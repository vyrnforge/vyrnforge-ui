import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import { users } from "../../data/users";
import { GridNote, stressColumns } from "./gridShared";

const stressRows = Array.from({ length: 4 }, (_, round) =>
  users.map((user) => ({
    ...user,
    id: user.id + round * users.length,
    name: `${user.name} / batch ${round + 1}`
  }))
).flat();

export function StressGridPage() {
  return (
    <section className="playground-panel">
      <div className="section-heading">
        <div>
          <h2>Stress grid</h2>
          <GridNote>Several hundred rows and wider columns exercise existing pagination and layout behavior.</GridNote>
        </div>
      </div>
      <UniversalDataGrid
        tableId="playground-stress"
        rows={stressRows}
        columns={stressColumns}
        getRowId={(row) => row.id}
        defaultState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
        maxHeight={620}
        variant="card"
      />
    </section>
  );
}

import { Badge, Button, Heading, Text } from "@dravyn/ui-components";
import { UniversalDataGrid } from "@dravyn/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "../data-grid/gridShared";

export function CssOverridePage() {
  return (
    <div className="dv-playground-page-stack">
      <section className="dv-playground-panel dv-playground-custom-dv-theme">
        <div className="dv-playground-card-heading">
          <Heading size="md">Global dv override</Heading>
          <Badge variant="info">components + grid</Badge>
        </div>
        <Text tone="muted">The scoped container changes shared tokens used by primitives and grid fallbacks.</Text>
        <div className="dv-playground-inline-actions">
          <Button variant="primary">Token primary</Button>
          <Button variant="subtle">Token subtle</Button>
        </div>
        <UniversalDataGrid
          tableId="override-dv-grid"
          rows={users.slice(0, 8)}
          columns={userColumns.slice(0, 5)}
          getRowId={(row) => row.id}
          density="compact"
          variant="bordered"
        />
      </section>

      <section className="dv-playground-panel dv-playground-grid-only-override">
        <div className="dv-playground-card-heading">
          <Heading size="md">Grid-only udg override</Heading>
          <Badge variant="neutral">grid only</Badge>
        </div>
        <Text tone="muted">The same component buttons stay unchanged while udg variables tune only the grid.</Text>
        <div className="dv-playground-inline-actions">
          <Button variant="primary">Shared button</Button>
          <Button variant="subtle">Shared secondary</Button>
        </div>
        <UniversalDataGrid
          tableId="override-udg-grid"
          rows={users.slice(0, 8)}
          columns={userColumns.slice(0, 5)}
          getRowId={(row) => row.id}
          density="compact"
          variant="bordered"
        />
      </section>

      <section className="dv-playground-panel dv-playground-local-scope-override">
        <div className="dv-playground-card-heading">
          <Heading size="md">Local scoped override</Heading>
          <Badge variant="success">scoped</Badge>
        </div>
        <Text tone="muted">This panel changes only the subtree it wraps, leaving the rest of the playground untouched.</Text>
        <div className="dv-playground-inline-actions">
          <Button variant="primary">Scoped primary</Button>
          <Button variant="subtle">Scoped subtle</Button>
        </div>
      </section>
    </div>
  );
}

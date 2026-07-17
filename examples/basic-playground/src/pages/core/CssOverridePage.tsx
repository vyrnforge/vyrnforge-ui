import { Badge, Button, Heading, Text } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "../data-grid/gridShared";

export function CssOverridePage() {
  return (
    <div className="vf-playground-page-stack">
      <section className="vf-playground-panel vf-playground-custom-vf-theme">
        <div className="vf-playground-card-heading">
          <Heading size="md">Global dv override</Heading>
          <Badge variant="info">components + grid</Badge>
        </div>
        <Text tone="muted">The scoped container changes shared tokens used by primitives and grid fallbacks.</Text>
        <div className="vf-playground-inline-actions">
          <Button variant="primary">Token primary</Button>
          <Button variant="subtle">Token subtle</Button>
        </div>
        <UniversalDataGrid
          tableId="override-vf-grid"
          rows={users.slice(0, 8)}
          columns={userColumns.slice(0, 5)}
          getRowId={(row) => row.id}
          density="compact"
          variant="bordered"
        />
      </section>

      <section className="vf-playground-panel vf-playground-grid-only-override">
        <div className="vf-playground-card-heading">
          <Heading size="md">Grid-only udg override</Heading>
          <Badge variant="neutral">grid only</Badge>
        </div>
        <Text tone="muted">The same component buttons stay unchanged while udg variables tune only the grid.</Text>
        <div className="vf-playground-inline-actions">
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

      <section className="vf-playground-panel vf-playground-local-scope-override">
        <div className="vf-playground-card-heading">
          <Heading size="md">Local scoped override</Heading>
          <Badge variant="success">scoped</Badge>
        </div>
        <Text tone="muted">This panel changes only the subtree it wraps, leaving the rest of the playground untouched.</Text>
        <div className="vf-playground-inline-actions">
          <Button variant="primary">Scoped primary</Button>
          <Button variant="subtle">Scoped subtle</Button>
        </div>
      </section>
    </div>
  );
}

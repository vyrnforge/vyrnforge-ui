import {
  Badge,
  Button,
  Card,
  Heading,
  Inline,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "../data-grid/gridShared";

export function CssOverridePage() {
  return (
    <Stack gap="lg">
      <Card
        className="vf-docs-example-custom-vf-theme"
        padding="md"
        variant="bordered"
      >
        <Stack gap="md">
          <Inline align="start" gap="sm" justify="between" wrap>
            <Heading size="md">Global vf override</Heading>
            <Badge variant="info">components + grid</Badge>
          </Inline>
          <Text tone="muted">
            The scoped container changes shared tokens used by primitives and grid
            fallbacks.
          </Text>
          <Inline gap="sm" wrap>
            <Button variant="primary">Token primary</Button>
            <Button variant="subtle">Token subtle</Button>
          </Inline>
          <UniversalDataGrid
            tableId="override-vf-grid"
            rows={users.slice(0, 8)}
            columns={userColumns.slice(0, 5)}
            getRowId={(row) => row.id}
            density="compact"
            variant="bordered"
          />
        </Stack>
      </Card>

      <Card
        className="vf-docs-example-grid-only-override"
        padding="md"
        variant="bordered"
      >
        <Stack gap="md">
          <Inline align="start" gap="sm" justify="between" wrap>
            <Heading size="md">Grid-only udg override</Heading>
            <Badge variant="neutral">grid only</Badge>
          </Inline>
          <Text tone="muted">
            The same component buttons stay unchanged while grid-specific udg
            variables tune only the grid.
          </Text>
          <Inline gap="sm" wrap>
            <Button variant="primary">Shared button</Button>
            <Button variant="subtle">Shared secondary</Button>
          </Inline>
          <UniversalDataGrid
            tableId="override-udg-grid"
            rows={users.slice(0, 8)}
            columns={userColumns.slice(0, 5)}
            getRowId={(row) => row.id}
            density="compact"
            variant="bordered"
          />
        </Stack>
      </Card>

      <Card
        className="vf-docs-example-local-scope-override"
        padding="md"
        variant="bordered"
      >
        <Stack gap="md">
          <Inline align="start" gap="sm" justify="between" wrap>
            <Heading size="md">Local scoped override</Heading>
            <Badge variant="success">scoped</Badge>
          </Inline>
          <Text tone="muted">
            This surface changes only the subtree it wraps, leaving the rest of
            Reference untouched.
          </Text>
          <Inline gap="sm" wrap>
            <Button variant="primary">Scoped primary</Button>
            <Button variant="subtle">Scoped subtle</Button>
          </Inline>
        </Stack>
      </Card>
    </Stack>
  );
}

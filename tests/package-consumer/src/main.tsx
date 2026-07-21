import React from "react";
import { createRoot } from "react-dom/client";

import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";

import {
  AppShell,
  Autocomplete,
  Button,
  Card,
  Field,
  Inline,
  Page,
  SideNav,
  Stack,
  Text,
  TextInput,
  TopNav
} from "@vyrnforge/ui-components";
import {
  createVyrnForgeTheme,
  toVyrnForgeThemeStyle
} from "@vyrnforge/ui-core";
import {
  UniversalDataGrid,
  useDataGridState,
  type DataGridColumnDef
} from "@vyrnforge/ui-data-grid";

import "./styles.css";

type Ticket = {
  id: string;
  owner: string;
  status: "Open" | "Review" | "Closed";
  priority: number;
};

const rows: Ticket[] = [
  { id: "TCK-1001", owner: "Access team", status: "Open", priority: 2 },
  { id: "TCK-1002", owner: "Workflow team", status: "Review", priority: 1 },
  { id: "TCK-1003", owner: "Operations team", status: "Closed", priority: 3 }
];

const columns: DataGridColumnDef<Ticket>[] = [
  { id: "id", header: "Ticket", accessorKey: "id", width: 120 },
  { id: "owner", header: "Owner", accessorKey: "owner", searchable: true },
  { id: "status", header: "Status", accessorKey: "status", dataType: "status" },
  { id: "priority", header: "Priority", accessorKey: "priority", dataType: "number", align: "right" }
];

const themeOverride = createVyrnForgeTheme({
  "--vf-primary": "#2563eb",
  "--vf-focus-ring": "0 0 0 3px rgba(37, 99, 235, 0.3)"
});

function VerificationContent() {
  const [gridState] = useDataGridState({
    defaultState: {
      density: "compact",
      pagination: { pageIndex: 0, pageSize: 25 }
    }
  });

  return (
    <Stack gap="lg">
      <Inline gap="sm">
        <Button variant="primary">Create ticket</Button>
        <Button variant="subtle">Review queue</Button>
      </Inline>

      <Card variant="bordered" padding="md">
        <Stack gap="md">
          <Field
            id="request-owner"
            label="Request owner"
            description="Public TextInput export consumed from the packed component package."
          >
            {(controlProps) => (
              <TextInput
                {...controlProps}
                defaultValue="Operations team"
                placeholder="Owner"
              />
            )}
          </Field>

          <Field label="Workflow" htmlFor="workflow-picker">
            <Autocomplete
              id="workflow-picker"
              ariaLabel="Workflow"
              defaultValue="access-review"
              options={[
                { value: "access-review", label: "Access review" },
                { value: "asset-check", label: "Asset check" },
                { value: "service-queue", label: "Service queue" }
              ]}
              clearable
              openOnFocus
            />
          </Field>
        </Stack>
      </Card>

      <UniversalDataGrid
        tableId="consumer-ticket-grid"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        title="Verification tickets"
        density={gridState.density}
        theme="light"
        variant="card"
        selectable
      />
    </Stack>
  );
}

function App() {
  return (
    <div style={toVyrnForgeThemeStyle(themeOverride)}>
      <div data-theme="light" data-density="standard" className="vf-consumer-theme-block">
        <AppShell
          header={<TopNav brand="Consumer Fixture" />}
          sidebar={
            <SideNav
              activeId="tickets"
              items={[
                { id: "tickets", label: "Tickets" },
                { id: "reports", label: "Reports" }
              ]}
            />
          }
          sidebarWidth={220}
          minHeight={640}
        >
          <Page
            title="Light verification"
            description="Packed VyrnForge packages rendered through public imports."
            density="standard"
            maxWidth="xl"
          >
            <VerificationContent />
          </Page>
        </AppShell>
      </div>

      <div data-theme="dark" data-density="compact" className="vf-consumer-theme-block">
        <Page
          title="Dark compact verification"
          description="The same public components render under dark theme and compact density."
          density="compact"
          maxWidth="xl"
        >
          <Text tone="muted">
            This block verifies CSS variables and focus styling in a second theme scope.
          </Text>
          <VerificationContent />
        </Page>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import { useState, type ReactNode } from "react";
import {
  Alert,
  AppShell,
  Autocomplete,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  ConfirmDialog,
  DateInput,
  DateTimeInput,
  Dialog,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  IconButton,
  Inline,
  LoadingState,
  Menu,
  NumberInput,
  Page,
  PageHeader,
  PageToolbar,
  Panel,
  Popover,
  RadioGroup,
  Rating,
  SearchInput,
  Section,
  Select,
  SegmentedControl,
  SideNav,
  Skeleton,
  Slider,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  ToastAction,
  ToastProvider,
  ToggleButton,
  ToggleButtonGroup,
  ToolbarButton,
  Tooltip,
  TopNav,
  TransferList,
  useToast
} from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "operator", label: "Operator" },
  { value: "viewer", label: "Viewer", disabled: true }
];

const transferOptions = [
  { value: "iam", label: "Identity", description: "Access requests." },
  { value: "atlas", label: "Atlas", description: "Document intelligence." },
  { value: "gateway", label: "Gateway", disabled: true },
  { value: "reports", label: "Reports" }
];

const gridRows = [
  { id: "ord-1", customer: "Mira Sutanto", status: "Ready", total: 4820 },
  { id: "ord-2", customer: "Daniel Prasetyo", status: "Pending", total: 2100 },
  { id: "ord-3", customer: "Sofia Hartono", status: "Blocked", total: 920 }
];

function MatrixSection({
  children,
  description,
  title
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Panel className="dv-playground-quality-section" title={title}>
      <Text tone="muted">{description}</Text>
      <div className="dv-playground-quality-surface">{children}</div>
    </Panel>
  );
}

function MatrixToastDemo() {
  const toast = useToast();

  return (
    <Inline gap="sm" wrap>
      <Button
        onClick={() =>
          toast.success({
            title: "Saved",
            description: "The quality matrix action completed."
          })
        }
        variant="primary"
      >
        Show success toast
      </Button>
      <Button
        onClick={() =>
          toast.error({
            action: <ToastAction altText="Retry quality check">Retry</ToastAction>,
            title: "Export failed",
            description: "The retry action stays keyboard accessible."
          })
        }
        variant="danger"
      >
        Show error toast
      </Button>
    </Inline>
  );
}

export function ComponentMatrixPage() {
  const [density, setDensity] = useState("standard");
  const [theme, setTheme] = useState("light");
  const [narrow, setNarrow] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="dv-playground-page-stack">
        <Panel>
          <div className="dv-playground-section-heading">
            <div>
              <h2>Component Quality Matrix</h2>
              <p className="dv-playground-note">
                Review representative component states against theme, density, focus, disabled,
                read-only, invalid, loading, long-label, and narrow-width cases.
              </p>
            </div>
            <Badge variant="info">Q1</Badge>
          </div>
          <div className="dv-playground-quality-controls">
            <SegmentedControl
              aria-label="Quality matrix theme"
              onChange={setTheme}
              options={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "Enterprise", value: "enterprise" }
              ]}
              value={theme}
            />
            <SegmentedControl
              aria-label="Quality matrix density"
              onChange={setDensity}
              options={[
                { label: "Compact", value: "compact" },
                { label: "Standard", value: "standard" },
                { label: "Comfortable", value: "comfortable" }
              ]}
              value={density}
            />
            <Switch
              checked={narrow}
              label="Narrow width"
              onCheckedChange={setNarrow}
            />
          </div>
        </Panel>

        <div
          className={narrow ? "dv-playground-quality-frame dv-playground-quality-frame--narrow" : "dv-playground-quality-frame"}
          data-density={density}
          data-theme={theme}
        >
          <MatrixSection
            description="Buttons, icon-only actions, grouped actions, toolbar commands, and selection-like action controls."
            title="Action Controls"
          >
            <Stack gap="md">
              <Inline gap="sm" wrap>
                <Button variant="primary">Save changes</Button>
                <Button variant="subtle">Cancel</Button>
                <Button loading variant="primary">Saving</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth variant="danger">Full-width destructive action with a long label</Button>
              </Inline>
              <Inline gap="sm" wrap>
                <IconButton aria-label="Refresh" tooltip="Refresh">
                  <Icon name="Refresh" />
                </IconButton>
                <IconButton aria-label="Delete record" tooltip="Delete record" variant="danger">
                  <Icon name="Delete" />
                </IconButton>
                <ToolbarButton active icon={<Icon name="Filter" />} label="Filters" />
                <ToolbarButton disabled icon={<Icon name="Settings" />} label="Policy locked" />
              </Inline>
              <ButtonGroup attached>
                <Button>Day</Button>
                <Button variant="primary">Week</Button>
                <Button>Month</Button>
              </ButtonGroup>
              <Inline gap="sm" wrap>
                <ToggleButton defaultPressed>Pin toolbar</ToggleButton>
                <ToggleButton disabled>Disabled tool</ToggleButton>
                <ToggleButtonGroup ariaLabel="Formatting" defaultValue={["bold"]} type="multiple">
                  <ToggleButton value="bold">Bold</ToggleButton>
                  <ToggleButton value="italic">Italic</ToggleButton>
                  <ToggleButton value="underline">Underline</ToggleButton>
                </ToggleButtonGroup>
              </Inline>
            </Stack>
          </MatrixSection>

          <MatrixSection
            description="Native-first form controls with invalid, disabled, read-only, required, and long-label states."
            title="Form Controls"
          >
            <div className="dv-playground-quality-grid">
              <Field id="quality-name" label="Workspace name" description="A normal labelled text field." required>
                {(controlProps) => <SearchInput {...controlProps} defaultValue="Operations" />}
              </Field>
              <Field id="quality-description" label="Long description" warning="Review before publishing.">
                {(controlProps) => <Textarea {...controlProps} defaultValue="This request has a deliberately longer value to inspect height, wrapping, and focus outline behavior." rows={4} />}
              </Field>
              <Field id="quality-role" label="Role" error="Choose an available role.">
                {(controlProps) => <Select {...controlProps} invalid options={roleOptions} />}
              </Field>
              <Field id="quality-limit" label="Approval limit">
                {(controlProps) => <NumberInput {...controlProps} defaultValue={12.5} mode="decimal" step={0.01} />}
              </Field>
              <DateInput aria-label="Start date" defaultValue="2026-07-16" />
              <DateTimeInput aria-label="Review time" defaultValue="2026-07-16T09:30" />
              <Checkbox defaultChecked label="I agree to the workspace access policy with a long label that wraps." />
              <Switch label="Require audit notes" defaultChecked description="Immediate setting." />
              <RadioGroup
                label="Review cadence"
                defaultValue="weekly"
                options={[
                  { label: "Daily", value: "daily" },
                  { label: "Weekly", value: "weekly" },
                  { label: "Annual", value: "annual", disabled: true }
                ]}
              />
              <Stack gap="sm">
                <Rating label="Quality score" defaultValue={4} />
                <Slider ariaLabel="Approval threshold" defaultValue={65} showValue />
              </Stack>
            </div>
          </MatrixSection>

          <MatrixSection
            description="Composite controls for known single-value search and bounded dual-list assignment."
            title="Composite Controls"
          >
            <div className="dv-playground-quality-grid">
              <Autocomplete
                defaultValue="operator"
                options={roleOptions}
                placeholder="Select a role"
              />
              <TransferList
                defaultValue={["atlas"]}
                options={transferOptions}
                searchable
                sourceTitle="Available apps"
                targetTitle="Assigned apps"
              />
            </div>
          </MatrixSection>

          <MatrixSection
            description="Persistent and transient feedback with status, loading, empty, error, skeleton, and toast states."
            title="Feedback"
          >
            <Stack gap="md">
              <Inline gap="sm" wrap>
                <Badge variant="success">Ready</Badge>
                <Badge variant="warning">Pending review</Badge>
                <Badge tone="solid" variant="danger">Blocked</Badge>
              </Inline>
              <Alert title="Policy warning" variant="warning">
                This persistent message should remain readable in every theme.
              </Alert>
              <div className="dv-playground-quality-grid">
                <EmptyState action={<Button>Create record</Button>} title="No records" />
                <ErrorState retryAction={<Button>Retry</Button>} title="Could not load records" />
                <LoadingState label="Loading records" />
                <Stack gap="sm">
                  <Skeleton />
                  <Skeleton width="70%" />
                  <Skeleton animated={false} width="45%" />
                </Stack>
              </div>
              <MatrixToastDemo />
            </Stack>
          </MatrixSection>

          <MatrixSection
            description="Navigation and layout primitives under long-label, active, nested, and constrained-width conditions."
            title="Navigation And Layout"
          >
            <Stack gap="md">
              <TopNav
                actions={<Button size="sm">Invite member</Button>}
                brand="Quality Workspace"
              />
              <Breadcrumbs
                items={[
                  { id: "home", href: "#overview", label: "Home" },
                  { id: "settings", href: "#settings", label: "Settings" },
                  { id: "quality", current: true, label: "Component Quality Matrix" }
                ]}
              />
              <Tabs
                defaultValue="overview"
                items={[
                  { id: "overview", label: "Overview", content: <Text>Overview panel.</Text> },
                  { id: "details", label: "Details", content: <Text>Details panel.</Text> },
                  { id: "disabled", disabled: true, label: "Disabled" }
                ]}
              />
              <div className="dv-playground-nav-demo-frame">
                <SideNav
                  activeId="orders"
                  items={[
                    { id: "overview", label: "Overview" },
                    { id: "orders", label: "Orders with a deliberately long navigation label" },
                    { id: "settings", label: "Settings" }
                  ]}
                />
              </div>
              <AppShell
                fullHeight={false}
                header={<TopNav brand="Shell" />}
                minHeight={320}
                scrollMode="content"
                sidebar={<SideNav activeId="orders" items={[{ id: "overview", label: "Overview" }, { id: "orders", label: "Orders" }]} />}
                sidebarWidth={180}
              >
                <Page>
                  <PageHeader
                    actions={<Button variant="primary">Save</Button>}
                    status={<Badge variant="info">Draft</Badge>}
                    title="Route title"
                  />
                  <PageToolbar>
                    <ToolbarButton icon={<Icon name="Search" />} label="Search" />
                    <ToolbarButton active icon={<Icon name="Filter" />} label="Filters" />
                  </PageToolbar>
                  <Section title="Section">
                    <Card>
                      <Text tone="muted">Constrained shell content surface.</Text>
                    </Card>
                  </Section>
                </Page>
              </AppShell>
            </Stack>
          </MatrixSection>

          <MatrixSection
            description="Overlay trigger, dismissal, focus, long content, destructive confirmation, and tooltip checks."
            title="Overlays"
          >
            <Inline gap="sm" wrap>
              <Popover trigger={<Button>Open popover</Button>}>
                <div className="dv-playground-overlay-demo-panel">
                  <Text>Popover content</Text>
                  <Button size="sm">Action</Button>
                </div>
              </Popover>
              <Menu
                items={[
                  { id: "edit", label: "Edit" },
                  { id: "archive", label: "Archive", disabled: true },
                  { id: "delete", label: "Delete", danger: true }
                ]}
                trigger={<Button>Open menu</Button>}
              />
              <Tooltip content="Tooltip remains supplemental">
                <IconButton aria-label="Refresh quality matrix">
                  <Icon name="Refresh" />
                </IconButton>
              </Tooltip>
              <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
              <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>Confirm delete</Button>
            </Inline>
            <Dialog
              description="Focus should remain inside while open and return to the trigger after close."
              onOpenChange={setDialogOpen}
              open={dialogOpen}
              title="Quality dialog"
            >
              <Stack gap="md">
                <Text>Dialog body with enough structure to test tab order.</Text>
                <Button onClick={() => setDialogOpen(false)}>Close from body</Button>
              </Stack>
            </Dialog>
            <Drawer
              description="Drawer body owns internal scrolling for longer content."
              onOpenChange={setDrawerOpen}
              open={drawerOpen}
              title="Quality drawer"
            >
              <Stack gap="md">
                {Array.from({ length: 8 }, (_, index) => (
                  <Panel key={index}>Scrollable drawer row {index + 1}</Panel>
                ))}
              </Stack>
            </Drawer>
            <ConfirmDialog
              confirmLabel="Delete record"
              onConfirm={() => setConfirmOpen(false)}
              onOpenChange={setConfirmOpen}
              open={confirmOpen}
              title="Delete this record?"
              variant="danger"
            />
          </MatrixSection>

          <MatrixSection
            description="Grid search, sort, pagination, status styling, and horizontal sizing in the same theme and density scope."
            title="Data Grid"
          >
            <UniversalDataGrid
              columns={[
                { id: "customer", accessorKey: "customer", header: "Customer", searchable: true, sortable: true },
                { id: "status", accessorKey: "status", header: "Status", sortable: true },
                { id: "total", accessorKey: "total", header: "Total", sortable: true }
              ]}
              getRowId={(row) => row.id}
              rows={gridRows}
              tableId="quality-matrix-grid"
              variant="card"
            />
          </MatrixSection>
        </div>
      </div>
    </ToastProvider>
  );
}

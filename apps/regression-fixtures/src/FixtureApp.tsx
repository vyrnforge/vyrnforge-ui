import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Button,
  Dialog,
  Drawer,
  Field,
  Menu,
  Popover,
  Select,
  Tabs,
  TextInput,
  Tooltip,
} from "@vyrnforge/ui-components";
import {
  UniversalDataGrid,
  type DataGridColumnDef,
} from "@vyrnforge/ui-data-grid";
import {
  fixtureDensities,
  fixtureThemes,
  resolveFixtureRoute,
  type FixtureCase,
  type FixtureDensity,
  type FixtureTheme,
} from "./fixtureRegistry";

type FixtureAppProps = {
  initialPathname?: string;
};

type FixtureRow = {
  id: string;
  owner: string;
  status: "Open" | "Review" | "Closed";
};

const fixtureRows: FixtureRow[] = [
  { id: "case-100", owner: "Access team", status: "Open" },
  { id: "case-200", owner: "Workflow team", status: "Review" },
  { id: "case-300", owner: "Operations team", status: "Closed" },
];

const fixtureColumns: DataGridColumnDef<FixtureRow>[] = [
  { id: "id", header: "Case", accessorKey: "id", width: 140 },
  { id: "owner", header: "Owner", accessorKey: "owner", width: 220 },
  { id: "status", header: "Status", accessorKey: "status", width: 140 },
];

const tabItems = [
  { id: "summary", label: "Summary", content: "Summary panel" },
  { id: "activity", label: "Activity", content: "Activity panel" },
];

function FixtureFrame({
  children,
  density,
  fixture,
  onDensityChange,
  onThemeChange,
  theme,
}: {
  children: ReactNode;
  density: FixtureDensity;
  fixture: FixtureCase;
  onDensityChange: (density: FixtureDensity) => void;
  onThemeChange: (theme: FixtureTheme) => void;
  theme: FixtureTheme;
}) {
  return (
    <main
      className="vf-fixture"
      data-density={density}
      data-theme={theme}
      data-vf-fixture={fixture.id}
      data-vf-fixture-ready="true"
      data-vf-fixture-region="fixture"
    >
      <header className="vf-fixture__header">
        <p className="vf-fixture__eyebrow">{fixture.category}</p>
        <h1>{fixture.title}</h1>
        <p>{fixture.purpose}</p>
      </header>
      <div className="vf-fixture__controls" data-vf-fixture-region="controls">
        <label>
          Theme
          <Select
            aria-label="Fixture theme"
            data-vf-fixture-action="theme"
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              onThemeChange(event.target.value as FixtureTheme)
            }
            options={fixtureThemes.map((value) => ({ label: value, value }))}
            value={theme}
          />
        </label>
        <label>
          Density
          <Select
            aria-label="Fixture density"
            data-vf-fixture-action="density"
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              onDensityChange(event.target.value as FixtureDensity)
            }
            options={fixtureDensities.map((value) => ({ label: value, value }))}
            value={density}
          />
        </label>
      </div>
      <section className="vf-fixture__content" data-vf-fixture-region="content">
        {children}
      </section>
    </main>
  );
}

function ButtonBasicFixture() {
  const [created, setCreated] = useState(false);

  return (
    <div className="vf-fixture__stack">
      <Button
        data-vf-fixture-action="primary"
        onClick={() => setCreated(true)}
        variant="primary"
      >
        Create case
      </Button>
      <output data-vf-fixture-region="result">
        {created ? "Case created" : "No action yet"}
      </output>
    </div>
  );
}

function ButtonDisabledFixture() {
  return (
    <Button disabled variant="primary">
      Create case
    </Button>
  );
}

function TextInputValidationFixture() {
  return (
    <Field error="A case title is required." label="Case title" required>
      {(controlProps) => (
        <TextInput {...controlProps} placeholder="Enter a case title" />
      )}
    </Field>
  );
}

function TabsFixture() {
  const [controlledTab, setControlledTab] = useState("summary");

  return (
    <div className="vf-fixture__stack">
      <Tabs
        items={tabItems}
        onValueChange={setControlledTab}
        value={controlledTab}
      />
      <Tabs defaultValue="activity" items={tabItems} />
    </div>
  );
}

function DialogFixture() {
  const [open, setOpen] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="vf-fixture__stack">
      <Button
        data-vf-fixture-action="open-dialog"
        onClick={() => setOpen(true)}
      >
        Open confirmation
      </Button>
      <output data-vf-fixture-region="overlay-state">
        Dialog {open ? "open" : "closed"}
      </output>
      <Dialog
        description="A fixed dialog for focus and dismissal checks."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              data-vf-fixture-action="confirm-dialog"
              onClick={() => setOpen(false)}
              ref={confirmRef}
              variant="primary"
            >
              Confirm update
            </Button>
          </>
        }
        initialFocusRef={confirmRef}
        onOpenChange={setOpen}
        open={open}
        title="Confirm case update"
      >
        Review the fixed fixture content before confirming.
      </Dialog>
    </div>
  );
}

function DrawerFixture() {
  const [open, setOpen] = useState(false);
  const ownerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="vf-fixture__stack">
      <Button
        data-vf-fixture-action="open-drawer"
        onClick={() => setOpen(true)}
      >
        Open filters
      </Button>
      <output data-vf-fixture-region="overlay-state">
        Drawer {open ? "open" : "closed"}
      </output>
      <Drawer
        description="Filter the deterministic fixture cases."
        footer={
          <Button onClick={() => setOpen(false)} variant="primary">
            Apply filters
          </Button>
        }
        initialFocusRef={ownerRef}
        onOpenChange={setOpen}
        open={open}
        title="Case filters"
      >
        <div className="vf-fixture__stack">
          <label>
            Owner
            <TextInput aria-label="Filter owner" ref={ownerRef} />
          </label>
          <Button>Reset filters</Button>
        </div>
      </Drawer>
    </div>
  );
}

function MenuFixture() {
  const [selection, setSelection] = useState("No action selected");

  return (
    <div className="vf-fixture__stack">
      <Menu
        items={[
          {
            id: "edit",
            label: "Edit case",
            onSelect: () => setSelection("Edit case selected"),
          },
          {
            id: "duplicate",
            label: "Duplicate case",
            disabled: true,
          },
          {
            id: "archive",
            label: "Archive case",
            selected: true,
            onSelect: () => setSelection("Archive case selected"),
          },
          {
            id: "delete",
            label: "Delete case",
            danger: true,
            onSelect: () => setSelection("Delete case selected"),
          },
        ]}
        trigger={
          <Button data-vf-fixture-action="open-menu">Open case actions</Button>
        }
      />
      <output data-vf-fixture-region="selection">{selection}</output>
    </div>
  );
}

function PopoverFixture() {
  return (
    <div className="vf-fixture__popover-surface">
      <Button data-vf-fixture-action="outside-popover">Outside action</Button>
      <div className="vf-fixture__popover-anchor">
        <Popover
          placement="bottom-end"
          trigger={
            <Button data-vf-fixture-action="open-popover">
              Open case context
            </Button>
          }
        >
          <div
            className="vf-fixture__popover-content"
            data-vf-fixture-region="popover-content"
          >
            <strong>Case context</strong>
            <p>Fixed contextual content for positioning checks.</p>
            <Button data-vf-fixture-action="popover-action">
              Apply context
            </Button>
          </div>
        </Popover>
      </div>
    </div>
  );
}

function TooltipFixture() {
  return (
    <div className="vf-fixture__tooltip-surface">
      <Tooltip
        content="Refresh the fixed case data"
        delayMs={0}
        placement="top"
      >
        <Button data-vf-fixture-action="tooltip-trigger">
          Refresh case data
        </Button>
      </Tooltip>
    </div>
  );
}

function DataGridSelectionFixture({
  density,
  theme,
}: {
  density: FixtureDensity;
  theme: FixtureTheme;
}) {
  const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>([
    "case-100",
  ]);

  return (
    <UniversalDataGrid
      columns={fixtureColumns}
      density={density}
      getRowId={(row) => row.id}
      onSelectedRowIdsChange={setSelectedRowIds}
      rows={fixtureRows}
      selectedRowIds={selectedRowIds}
      selectable
      tableId="vf-regression-grid-selection"
      theme={theme}
      title="Fixture cases"
      variant="bordered"
    />
  );
}

function DataGridEmptyFixture({
  density,
  theme,
}: {
  density: FixtureDensity;
  theme: FixtureTheme;
}) {
  return (
    <UniversalDataGrid
      columns={fixtureColumns}
      density={density}
      emptyMessage="No fixture cases match this view."
      getRowId={(row) => row.id}
      rows={[]}
      tableId="vf-regression-grid-empty"
      theme={theme}
      title="Fixture cases"
      variant="bordered"
    />
  );
}

function DataGridLoadingFixture({
  density,
  theme,
}: {
  density: FixtureDensity;
  theme: FixtureTheme;
}) {
  return (
    <UniversalDataGrid
      columns={fixtureColumns}
      density={density}
      getRowId={(row) => row.id}
      loading
      rows={[]}
      tableId="vf-regression-grid-loading"
      theme={theme}
      title="Fixture cases"
      variant="bordered"
    />
  );
}

function FixtureContent({
  density,
  fixture,
  theme,
}: {
  density: FixtureDensity;
  fixture: FixtureCase;
  theme: FixtureTheme;
}) {
  switch (fixture.id) {
    case "button-basic":
      return <ButtonBasicFixture />;
    case "button-disabled":
      return <ButtonDisabledFixture />;
    case "text-input-validation":
      return <TextInputValidationFixture />;
    case "tabs-controlled-uncontrolled":
      return <TabsFixture />;
    case "dialog-focus":
      return <DialogFixture />;
    case "drawer-focus":
      return <DrawerFixture />;
    case "menu-keyboard":
      return <MenuFixture />;
    case "popover-position":
      return <PopoverFixture />;
    case "tooltip-focus-hover":
      return <TooltipFixture />;
    case "data-grid-selection":
      return <DataGridSelectionFixture density={density} theme={theme} />;
    case "data-grid-empty":
      return <DataGridEmptyFixture density={density} theme={theme} />;
    case "data-grid-loading":
      return <DataGridLoadingFixture density={density} theme={theme} />;
  }
}

function FixtureRoute({ fixture }: { fixture: FixtureCase }) {
  const [theme, setTheme] = useState<FixtureTheme>("light");
  const [density, setDensity] = useState<FixtureDensity>("standard");

  return (
    <FixtureFrame
      density={density}
      fixture={fixture}
      onDensityChange={setDensity}
      onThemeChange={setTheme}
      theme={theme}
    >
      <FixtureContent density={density} fixture={fixture} theme={theme} />
    </FixtureFrame>
  );
}

function FixtureNotFound({ pathname }: { pathname: string }) {
  return (
    <main
      className="vf-fixture"
      data-vf-fixture-ready="true"
      data-vf-fixture-region="not-found"
    >
      <h1>Fixture not found</h1>
      <p>Unknown fixture route: {pathname}</p>
    </main>
  );
}

export function FixtureApp({
  initialPathname = window.location.pathname,
}: FixtureAppProps) {
  const fixture = resolveFixtureRoute(initialPathname);

  return fixture ? (
    <FixtureRoute fixture={fixture} />
  ) : (
    <FixtureNotFound pathname={initialPathname} />
  );
}

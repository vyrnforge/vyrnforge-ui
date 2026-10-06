import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Dialog,
  EmptyState,
  ErrorState,
  Heading,
  Icon,
  IconButton,
  Inline,
  InlineMessage,
  LoadingState,
  Panel,
  Progress,
  RadioGroup,
  SearchInput,
  Section,
  Select,
  Skeleton,
  Slider,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  ToggleButton,
  ToggleButtonGroup,
} from "@vyrnforge/ui-components";

type SpecimenState = {
  checked: boolean;
  dialogOpen: boolean;
  setChecked: (checked: boolean) => void;
  setDialogOpen: (open: boolean) => void;
  setTab: (tab: string) => void;
  setToggle: (toggle: string) => void;
  tab: string;
  toggle: string;
};

type SpecimenRenderer = (state: SpecimenState) => ReactNode;

const frameworkOptions = [
  { label: "React", value: "react" },
  { label: "Angular", value: "angular" },
  { label: "Vue", value: "vue" },
];

const tabItems = [
  {
    id: "overview",
    label: "Overview",
    content: "Overview content",
  },
  {
    id: "activity",
    label: "Activity",
    content: "Activity content",
  },
  {
    id: "settings",
    label: "Settings",
    content: "Settings content",
  },
];

function SpecimenGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Stack gap="sm">
      <Text size="sm" tone="muted">
        {label}
      </Text>
      <div className="vf-docs-specimen-row">{children}</div>
    </Stack>
  );
}

function UnsupportedSpecimen({
  componentId,
  relatedPatterns,
}: {
  componentId: string;
  relatedPatterns: string[];
}) {
  return (
    <div className="vf-docs-component-specimen__unsupported">
      <Text tone="muted">
        {relatedPatterns.length > 0
          ? "This component is best understood inside a real application composition."
          : "This component does not yet have a standalone specimen."}
      </Text>
      {relatedPatterns.length > 0 ? (
        <div>
          {relatedPatterns.map((pattern) => (
            <a href={`#/pattern-reference/${pattern}`} key={pattern}>
              Open {pattern.replace(/-/gu, " ")}
            </a>
          ))}
        </div>
      ) : (
        <code>{componentId}</code>
      )}
    </div>
  );
}

const renderButton: SpecimenRenderer = () => (
  <Stack gap="sm">
    <SpecimenGroup label="Variants">
      <Button variant="primary">Primary</Button>
      <Button>Default</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </SpecimenGroup>
    <SpecimenGroup label="Sizes">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </SpecimenGroup>
    <SpecimenGroup label="States">
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
    </SpecimenGroup>
  </Stack>
);

const renderTextInput: SpecimenRenderer = () => (
  <Stack gap="sm">
    <SpecimenGroup label="Sizes">
      <TextInput
        aria-label="Small project name"
        defaultValue="Small"
        size="sm"
      />
      <TextInput
        aria-label="Medium project name"
        defaultValue="Medium"
        size="md"
      />
      <TextInput
        aria-label="Large project name"
        defaultValue="Large"
        size="lg"
      />
    </SpecimenGroup>
    <SpecimenGroup label="States">
      <TextInput aria-label="Project name" defaultValue="VyrnForge" />
      <TextInput
        aria-label="Invalid project name"
        defaultValue="Needs review"
        invalid
      />
      <TextInput
        aria-label="Disabled project name"
        defaultValue="Unavailable"
        disabled
      />
    </SpecimenGroup>
  </Stack>
);

const renderSelect: SpecimenRenderer = () => (
  <Stack gap="sm">
    <SpecimenGroup label="Sizes">
      <Select
        aria-label="Small framework"
        defaultValue="react"
        options={frameworkOptions}
        size="sm"
      />
      <Select
        aria-label="Medium framework"
        defaultValue="react"
        options={frameworkOptions}
        size="md"
      />
      <Select
        aria-label="Large framework"
        defaultValue="react"
        options={frameworkOptions}
        size="lg"
      />
    </SpecimenGroup>
    <SpecimenGroup label="States">
      <Select
        aria-label="Framework"
        defaultValue="react"
        options={frameworkOptions}
      />
      <Select
        aria-label="Invalid framework"
        defaultValue="react"
        invalid
        options={frameworkOptions}
      />
      <Select
        aria-label="Disabled framework"
        defaultValue="react"
        disabled
        options={frameworkOptions}
      />
    </SpecimenGroup>
  </Stack>
);

const renderBadge: SpecimenRenderer = () => (
  <div className="vf-docs-specimen-row">
    <Badge variant="success">Healthy</Badge>
    <Badge variant="warning">Review</Badge>
    <Badge variant="danger">Blocked</Badge>
    <Badge variant="info">In progress</Badge>
    <Badge variant="neutral">Neutral</Badge>
  </div>
);

const renderToggleGroup: SpecimenRenderer = ({ setToggle, toggle }) => (
  <ToggleButtonGroup
    type="single"
    value={toggle}
    onValueChange={(value) => {
      if (typeof value === "string") setToggle(value);
    }}
  >
    <ToggleButton value="list">List</ToggleButton>
    <ToggleButton value="grid">Grid</ToggleButton>
  </ToggleButtonGroup>
);

const renderMessage: SpecimenRenderer = () => (
  <Stack gap="sm">
    <InlineMessage title="Deployment ready" variant="success">
      The new configuration can be promoted.
    </InlineMessage>
    <InlineMessage title="Review required" variant="warning">
      Two fields still need an owner.
    </InlineMessage>
    <InlineMessage title="Deployment blocked" variant="danger">
      Resolve the failed checks before promoting.
    </InlineMessage>
    <InlineMessage title="Deployment queued" variant="info">
      The deployment will start when capacity is available.
    </InlineMessage>
    <InlineMessage title="Workspace note" variant="neutral">
      This message carries supporting context without status emphasis.
    </InlineMessage>
  </Stack>
);

const renderTabs: SpecimenRenderer = ({ setTab, tab }) => (
  <Stack gap="sm">
    <SpecimenGroup label="Line · medium">
      <div data-testid="tabs-interactive">
        <Tabs items={tabItems} onValueChange={setTab} value={tab} />
      </div>
    </SpecimenGroup>
    <SpecimenGroup label="Contained · small">
      <Tabs
        defaultValue="overview"
        items={tabItems}
        size="sm"
        variant="contained"
      />
    </SpecimenGroup>
    <SpecimenGroup label="Pills · medium">
      <Tabs defaultValue="overview" items={tabItems} variant="pills" />
    </SpecimenGroup>
  </Stack>
);

const renderPanel: SpecimenRenderer = () => (
  <Panel description="Current operational status" title="Queue health">
    <Text>4 critical · 8 standard · 2 awaiting review</Text>
  </Panel>
);

const renderCard: SpecimenRenderer = () => (
  <Inline gap="sm" wrap>
    <Card padding="md" variant="plain">
      <Text>Plain</Text>
    </Card>
    <Card padding="md" variant="bordered">
      <Text>Bordered</Text>
    </Card>
    <Card padding="md" variant="elevated">
      <Text>Elevated</Text>
    </Card>
  </Inline>
);

const renderStack: SpecimenRenderer = () => (
  <Stack gap="sm">
    <Badge variant="neutral">First</Badge>
    <Badge variant="info">Second</Badge>
    <Badge variant="success">Third</Badge>
  </Stack>
);

const renderInline: SpecimenRenderer = () => (
  <Inline gap="sm" wrap>
    <Badge variant="neutral">Alpha</Badge>
    <Badge variant="info">Beta</Badge>
    <Badge variant="success">Gamma</Badge>
  </Inline>
);

const renderSection: SpecimenRenderer = () => (
  <Section
    actions={<Button size="sm">Manage</Button>}
    description="Reusable layout for titled application regions."
    title="Operational summary"
  >
    <Text>Section content remains semantically grouped and composable.</Text>
  </Section>
);

// Renderer dispatch stays in the React documentation host. Which controls,
// states, variants, and evidence are documentable is derived from canonical
// VyrnForge metadata rather than this implementation registry.
const specimenRenderers: Record<string, SpecimenRenderer> = {
  button: renderButton,
  "button-group": () => (
    <ButtonGroup>
      <Button>Previous</Button>
      <Button variant="primary">Next</Button>
    </ButtonGroup>
  ),
  "icon-button": () => (
    <div className="vf-docs-specimen-row">
      <IconButton aria-label="Settings">
        <Icon name="Settings" />
      </IconButton>
      <IconButton aria-label="Refresh">
        <Icon name="Refresh" />
      </IconButton>
      <IconButton aria-label="More actions">
        <Icon name="MoreHorizontal" />
      </IconButton>
    </div>
  ),
  badge: renderBadge,
  "status-badge": renderBadge,
  "text-input": renderTextInput,
  "search-input": () => (
    <SearchInput aria-label="Search" placeholder="Search components" />
  ),
  select: renderSelect,
  textarea: () => (
    <Textarea
      aria-label="Description"
      defaultValue="Reusable UI foundation for enterprise applications."
    />
  ),
  switch: ({ checked, setChecked }) => (
    <Switch
      checked={checked}
      description="Notify owners when workflow state changes."
      label="Enable notifications"
      onCheckedChange={setChecked}
    />
  ),
  checkbox: () => <Checkbox defaultChecked label="Include archived records" />,
  "radio-group": () => (
    <RadioGroup
      defaultValue="comfortable"
      label="Density"
      options={[
        { label: "Comfortable", value: "comfortable" },
        { label: "Compact", value: "compact" },
      ]}
    />
  ),
  slider: () => <Slider aria-label="Volume" defaultValue={60} />,
  "toggle-button": ({ checked, setChecked }) => (
    <ToggleButton pressed={checked} onPressedChange={setChecked}>
      Pin
    </ToggleButton>
  ),
  "toggle-button-group": renderToggleGroup,
  "segmented-control": renderToggleGroup,
  tabs: renderTabs,
  dialog: ({ dialogOpen, setDialogOpen }) => (
    <div className="vf-docs-specimen-row">
      <Button onClick={() => setDialogOpen(true)} variant="primary">
        Open dialog
      </Button>
      <Dialog
        description="Review the pending configuration before continuing."
        footer={<Button onClick={() => setDialogOpen(false)}>Close</Button>}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Review deployment"
      >
        <Text>The dialog uses the public VyrnForge overlay contract.</Text>
      </Dialog>
    </div>
  ),
  "inline-message": renderMessage,
  alert: renderMessage,
  progress: () => <Progress aria-label="Upload progress" value={68} />,
  skeleton: () => (
    <Stack gap="sm">
      <Skeleton height={18} width="45%" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={14} width="65%" />
    </Stack>
  ),
  "empty-state": () => (
    <EmptyState
      action={<Button variant="primary">Create resource</Button>}
      description="Create the first resource to start this workspace."
      title="No resources yet"
    />
  ),
  "error-state": () => (
    <ErrorState
      action={<Button>Retry</Button>}
      description="Try again or check the service status."
      title="Could not load resources"
    />
  ),
  "loading-state": () => <LoadingState label="Loading resources" />,
  panel: renderPanel,
  card: renderCard,
  stack: renderStack,
  inline: renderInline,
  section: renderSection,
};

export function ReferenceComponentSpecimen({
  componentId,
  relatedPatterns,
}: {
  componentId: string;
  relatedPatterns: string[];
}) {
  const [checked, setChecked] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [toggle, setToggle] = useState("list");
  const renderer = specimenRenderers[componentId];
  const specimen = renderer ? (
    renderer({
      checked,
      dialogOpen,
      setChecked,
      setDialogOpen,
      setTab,
      setToggle,
      tab,
      toggle,
    })
  ) : (
    <UnsupportedSpecimen
      componentId={componentId}
      relatedPatterns={relatedPatterns}
    />
  );

  return (
    <section className="vf-docs-component-specimen">
      <div className="vf-docs-component-specimen__heading">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Live specimen
          </Text>
          <Heading level={3} size="md">
            See the component before reading its contract.
          </Heading>
        </div>
      </div>
      <div className="vf-docs-component-specimen__stage">{specimen}</div>
    </section>
  );
}

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

function ButtonExampleGroup({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="vf-docs-button-example-group">
      <div className="vf-docs-button-example-group__heading">
        <Heading level={4} size="sm">
          {title}
        </Heading>
        <Text size="sm" tone="muted">
          {description}
        </Text>
      </div>
      {children}
    </section>
  );
}

const renderButton: SpecimenRenderer = () => (
  <Stack gap="lg">
    <ButtonExampleGroup
      description="Choose emphasis based on the importance and risk of the action."
      title="Variants"
    >
      <Inline gap="sm" wrap>
        <Button variant="primary">Primary</Button>
        <Button>Default</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </Inline>
    </ButtonExampleGroup>

    <ButtonExampleGroup
      description="Use the supported scale to match the density of the surrounding controls."
      title="Sizes"
    >
      <Inline align="center" gap="sm" wrap>
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Inline>
    </ButtonExampleGroup>

    <ButtonExampleGroup
      description="Disabled blocks interaction. Loading also exposes the shared busy state while work is in progress."
      title="Disabled and loading"
    >
      <Inline gap="sm" wrap>
        <Button disabled>Disabled</Button>
        <Button loading variant="primary">
          Saving
        </Button>
      </Inline>
    </ButtonExampleGroup>

    <ButtonExampleGroup
      description="Expand a prominent action to the available inline space when the layout calls for it."
      title="Full width"
    >
      <Button fullWidth variant="primary">
        Continue
      </Button>
    </ButtonExampleGroup>

    <ButtonExampleGroup
      description="Keep visible labels for important actions while composing leading or trailing icon content."
      title="Icons and labels"
    >
      <Inline gap="sm" wrap>
        <Button leadingIcon={<Icon name="Settings" />}>Settings</Button>
        <Button trailingIcon={<Icon name="Refresh" />} variant="subtle">
          Refresh
        </Button>
      </Inline>
    </ButtonExampleGroup>

    <ButtonExampleGroup
      description="Use explicit button types when the action participates in a form workflow."
      title="Form actions"
    >
      <Inline gap="sm" wrap>
        <Button type="submit" value="save" variant="primary">
          Save changes
        </Button>
        <Button type="reset">Reset</Button>
      </Inline>
    </ButtonExampleGroup>
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
  "text-input": () => (
    <TextInput aria-label="Project name" defaultValue="VyrnForge" />
  ),
  "search-input": () => (
    <SearchInput aria-label="Search" placeholder="Search components" />
  ),
  select: () => (
    <Select
      aria-label="Framework"
      defaultValue="react"
      options={[
        { label: "React", value: "react" },
        { label: "Angular", value: "angular" },
        { label: "Vue", value: "vue" },
      ]}
    />
  ),
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
  tabs: ({ setTab, tab }) => (
    <Tabs
      items={[
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
      ]}
      onValueChange={setTab}
      value={tab}
    />
  ),
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

import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  EmptyState,
  ErrorState,
  Heading,
  Icon,
  IconButton,
  InlineMessage,
  LoadingState,
  Panel,
  Progress,
  RadioGroup,
  SearchInput,
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
              Open {pattern.replaceAll("-", " ")}
            </a>
          ))}
        </div>
      ) : (
        <code>{componentId}</code>
      )}
    </div>
  );
}

export function ReferenceComponentSpecimen({
  componentId,
  relatedPatterns,
}: {
  componentId: string;
  relatedPatterns: string[];
}) {
  const [checked, setChecked] = useState(true);
  const [tab, setTab] = useState("overview");
  const [toggle, setToggle] = useState("list");

  let specimen: ReactNode;

  switch (componentId) {
    case "button":
      specimen = (
        <div className="vf-docs-specimen-row">
          <Button variant="primary">Primary</Button>
          <Button>Default</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      );
      break;
    case "button-group":
      specimen = (
        <ButtonGroup>
          <Button>Previous</Button>
          <Button variant="primary">Next</Button>
        </ButtonGroup>
      );
      break;
    case "icon-button":
      specimen = (
        <div className="vf-docs-specimen-row">
          <IconButton aria-label="Settings"><Icon name="Settings" /></IconButton>
          <IconButton aria-label="Refresh"><Icon name="Refresh" /></IconButton>
          <IconButton aria-label="More actions"><Icon name="More" /></IconButton>
        </div>
      );
      break;
    case "badge":
    case "status-badge":
      specimen = (
        <div className="vf-docs-specimen-row">
          <Badge variant="success">Healthy</Badge>
          <Badge variant="warning">Review</Badge>
          <Badge variant="danger">Blocked</Badge>
          <Badge variant="info">In progress</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      );
      break;
    case "text-input":
      specimen = <TextInput aria-label="Project name" defaultValue="VyrnForge" />;
      break;
    case "search-input":
      specimen = <SearchInput aria-label="Search" placeholder="Search components" />;
      break;
    case "select":
      specimen = (
        <Select
          aria-label="Framework"
          defaultValue="react"
          options={[
            { label: "React", value: "react" },
            { label: "Angular", value: "angular" },
            { label: "Vue", value: "vue" },
          ]}
        />
      );
      break;
    case "textarea":
      specimen = (
        <Textarea
          aria-label="Description"
          defaultValue="Reusable UI foundation for enterprise applications."
        />
      );
      break;
    case "switch":
      specimen = (
        <Switch
          checked={checked}
          label="Enable notifications"
          description="Notify owners when workflow state changes."
          onCheckedChange={setChecked}
        />
      );
      break;
    case "checkbox":
      specimen = (
        <Checkbox defaultChecked label="Include archived records" />
      );
      break;
    case "radio-group":
      specimen = (
        <RadioGroup
          defaultValue="comfortable"
          label="Density"
          options={[
            { label: "Comfortable", value: "comfortable" },
            { label: "Compact", value: "compact" },
          ]}
        />
      );
      break;
    case "slider":
      specimen = <Slider aria-label="Volume" defaultValue={60} />;
      break;
    case "toggle-button":
      specimen = (
        <ToggleButton
          pressed={checked}
          onPressedChange={setChecked}
        >
          Pin
        </ToggleButton>
      );
      break;
    case "toggle-button-group":
    case "segmented-control":
      specimen = (
        <ToggleButtonGroup
          value={toggle}
          onValueChange={(value) => {
            if (typeof value === "string") setToggle(value);
          }}
          type="single"
        >
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
        </ToggleButtonGroup>
      );
      break;
    case "tabs":
      specimen = (
        <Tabs
          items={[
            { id: "overview", label: "Overview", content: "Overview content" },
            { id: "activity", label: "Activity", content: "Activity content" },
            { id: "settings", label: "Settings", content: "Settings content" },
          ]}
          onValueChange={setTab}
          value={tab}
        />
      );
      break;
    case "inline-message":
    case "alert":
      specimen = (
        <Stack gap="sm">
          <InlineMessage title="Deployment ready" variant="success">
            The new configuration can be promoted.
          </InlineMessage>
          <InlineMessage title="Review required" variant="warning">
            Two fields still need an owner.
          </InlineMessage>
        </Stack>
      );
      break;
    case "progress":
      specimen = <Progress aria-label="Upload progress" value={68} />;
      break;
    case "skeleton":
      specimen = (
        <Stack gap="sm">
          <Skeleton height={18} width="45%" />
          <Skeleton height={14} width="80%" />
          <Skeleton height={14} width="65%" />
        </Stack>
      );
      break;
    case "empty-state":
      specimen = (
        <EmptyState
          title="No resources yet"
          description="Create the first resource to start this workspace."
          action={<Button variant="primary">Create resource</Button>}
        />
      );
      break;
    case "error-state":
      specimen = (
        <ErrorState
          title="Could not load resources"
          description="Try again or check the service status."
          action={<Button>Retry</Button>}
        />
      );
      break;
    case "loading-state":
      specimen = <LoadingState label="Loading resources" />;
      break;
    case "panel":
    case "card":
      specimen = (
        <Panel title="Queue health" description="Current operational status">
          <Text>4 critical · 8 standard · 2 awaiting review</Text>
        </Panel>
      );
      break;
    default:
      specimen = (
        <UnsupportedSpecimen
          componentId={componentId}
          relatedPatterns={relatedPatterns}
        />
      );
  }

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

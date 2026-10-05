import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
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
import {
  getComponentDocumentation,
  getComponentReferenceRecord,
  getContractEnumValues,
  type ComponentDocumentationControl,
  type ComponentReferenceRecord,
} from "./referenceData";

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
          : "No canonical standalone specimen is declared for this component yet."}
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

function initialControlValue(
  component: ComponentReferenceRecord,
  control: ComponentDocumentationControl,
) {
  const property = component.contract?.properties.find(
    (entry) => entry.name === control.property,
  );
  if (control.kind === "boolean") {
    return typeof property?.default === "boolean" ? property.default : false;
  }
  const values = getContractEnumValues(component, control.property);
  if (typeof property?.default === "string" && values.includes(property.default)) {
    return property.default;
  }
  return values[0] ?? "";
}

function SpecimenControls({
  component,
  controls,
  values,
  onChange,
}: {
  component: ComponentReferenceRecord;
  controls: ComponentDocumentationControl[];
  values: Record<string, boolean | string>;
  onChange: (property: string, value: boolean | string) => void;
}) {
  if (controls.length === 0) return null;

  return (
    <div className="vf-docs-component-specimen__controls" aria-label="Specimen controls">
      <Text size="sm" tone="muted">
        Controls are declared by documentation metadata; selectable values come
        from the canonical public component contract.
      </Text>
      <div className="vf-docs-specimen-form">
        {controls.map((control) => {
          if (control.kind === "boolean") {
            return (
              <Switch
                checked={Boolean(values[control.property])}
                key={control.property}
                label={control.label}
                onCheckedChange={(checked) => onChange(control.property, checked)}
              />
            );
          }
          const enumValues = getContractEnumValues(component, control.property);
          if (enumValues.length === 0) return null;
          return (
            <Select
              aria-label={control.label}
              key={control.property}
              onChange={(event) =>
                onChange(control.property, event.currentTarget.value)
              }
              options={enumValues.map((value) => ({ label: value, value }))}
              value={String(values[control.property] ?? enumValues[0])}
            />
          );
        })}
      </div>
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
  const component = getComponentReferenceRecord(componentId);
  const documentation = getComponentDocumentation(componentId);
  const [checked, setChecked] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [toggle, setToggle] = useState("list");
  const [controlOverrides, setControlOverrides] = useState<
    Record<string, boolean | string>
  >({});

  const controlValues = useMemo(() => {
    if (!component || !documentation) return {};
    return Object.fromEntries(
      documentation.controls.map((control) => [
        control.property,
        controlOverrides[control.property] ??
          initialControlValue(component, control),
      ]),
    );
  }, [component, documentation, controlOverrides]);

  const renderer = documentation?.specimen.renderer;
  let specimen: ReactNode;

  switch (renderer) {
    case "button": {
      const variant = controlValues.variant as ComponentProps<
        typeof Button
      >["variant"];
      const size = controlValues.size as ComponentProps<typeof Button>["size"];
      specimen = (
        <div className="vf-docs-specimen-stack">
          <Button
            disabled={Boolean(controlValues.disabled)}
            loading={Boolean(controlValues.loading)}
            size={size}
            variant={variant}
          >
            Interactive button
          </Button>
          <div className="vf-docs-specimen-row" aria-label="Button variants">
            <Button variant="primary">Primary</Button>
            <Button>Default</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>
      );
      break;
    }
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
      specimen = (
        <TextInput
          aria-label="Project name"
          defaultValue="VyrnForge"
          disabled={Boolean(controlValues.disabled)}
          invalid={Boolean(controlValues.invalid)}
          readOnly={Boolean(controlValues.readOnly)}
          required={Boolean(controlValues.required)}
          size={controlValues.size as ComponentProps<typeof TextInput>["size"]}
        />
      );
      break;
    case "search-input":
      specimen = (
        <SearchInput aria-label="Search" placeholder="Search components" />
      );
      break;
    case "select":
      specimen = (
        <Select
          aria-label="Framework"
          defaultValue="react"
          disabled={Boolean(controlValues.disabled)}
          invalid={Boolean(controlValues.invalid)}
          options={[
            { label: "React", value: "react" },
            { label: "Angular", value: "angular" },
            { label: "Vue", value: "vue" },
          ]}
          required={Boolean(controlValues.required)}
          size={controlValues.size as ComponentProps<typeof Select>["size"]}
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
          description="Notify owners when workflow state changes."
          label="Enable notifications"
          onCheckedChange={setChecked}
        />
      );
      break;
    case "checkbox":
      specimen = <Checkbox defaultChecked label="Include archived records" />;
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
        <ToggleButton pressed={checked} onPressedChange={setChecked}>
          Pin
        </ToggleButton>
      );
      break;
    case "toggle-button-group":
    case "segmented-control":
      specimen = (
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
      break;
    case "tabs":
      specimen = (
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
          size={controlValues.size as ComponentProps<typeof Tabs>["size"]}
          value={tab}
          variant={controlValues.variant as ComponentProps<typeof Tabs>["variant"]}
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
          action={<Button variant="primary">Create resource</Button>}
          description="Create the first resource to start this workspace."
          title="No resources yet"
        />
      );
      break;
    case "error-state":
      specimen = (
        <ErrorState
          action={<Button>Retry</Button>}
          description="Try again or check the service status."
          title="Could not load resources"
        />
      );
      break;
    case "loading-state":
      specimen = <LoadingState label="Loading resources" />;
      break;
    case "panel":
    case "card":
      specimen = (
        <Panel description="Current operational status" title="Queue health">
          <Text>4 critical · 8 standard · 2 awaiting review</Text>
        </Panel>
      );
      break;
    case "dialog":
      specimen = (
        <div>
          <Button onClick={() => setDialogOpen(true)}>Open dialog specimen</Button>
          <Dialog
            closeOnEscape={Boolean(controlValues.closeOnEscape)}
            closeOnOverlayClick={Boolean(controlValues.closeOnOverlayClick)}
            description="This specimen uses the public Dialog contract."
            footer={<Button onClick={() => setDialogOpen(false)}>Done</Button>}
            onOpenChange={setDialogOpen}
            open={dialogOpen}
            size={controlValues.size as ComponentProps<typeof Dialog>["size"]}
            title="Review changes"
          >
            Confirm that the configuration is ready to publish.
          </Dialog>
        </div>
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
      {component && documentation ? (
        <SpecimenControls
          component={component}
          controls={documentation.controls}
          onChange={(property, value) =>
            setControlOverrides((current) => ({ ...current, [property]: value }))
          }
          values={controlValues}
        />
      ) : null}
    </section>
  );
}

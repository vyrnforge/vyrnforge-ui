import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { createLiveScope, LiveExample } from "../../components/live";

function live(
  id: string,
  title: string,
  initialCode: string,
  scope: Record<string, unknown>,
  imports: string,
  description?: string,
  editorHeight = 220
) {
  return (
    <LiveExample
      description={description}
      editorHeight={editorHeight}
      id={id}
      imports={imports}
      initialCode={initialCode.trim()}
      minPreviewHeight={360}
      scope={scope}
      title={title}
    />
  );
}

const applicationOptions = `[
  {
    value: "iam",
    label: "Identity and Access Management",
    description: "Authentication, roles, and resource access.",
    keywords: ["identity", "roles", "security"]
  },
  {
    value: "atlas",
    label: "Atlas Intelligence Platform",
    description: "Trusted data and document intelligence.",
    keywords: ["data", "documents"]
  },
  {
    value: "gateway",
    label: "Gateway UI",
    description: "Gateway configuration and service routing.",
    keywords: ["routing", "services"]
  },
  {
    value: "reports",
    label: "Reporting Portal",
    description: "Operational and executive reporting.",
    keywords: ["analytics", "reports"]
  }
]`;

const fieldOptions = `[
  { value: "orderId", label: "Order ID", description: "Stable transaction identifier.", keywords: ["id"] },
  { value: "customer", label: "Customer", description: "Customer display name.", keywords: ["account"] },
  { value: "status", label: "Status", description: "Current workflow state." },
  { value: "margin", label: "Margin", description: "Financial margin percentage.", keywords: ["finance"] },
  { value: "region", label: "Region", description: "Commercial region." }
]`;

export function TransferListPage() {
  const baseScope = createLiveScope("TransferList");
  const richScope = createLiveScope("TransferList", "Badge", "Button", "Caption", "Field", "Stack", "Text");

  return (
    <ComponentDemoPage
      accessibility={[
        "TransferList uses labelled groups, native checkboxes, and native buttons instead of listbox semantics.",
        "Tab reaches search fields, row checkboxes, select-visible controls, and transfer buttons in DOM order.",
        "Descriptions are associated with option checkboxes when present, and form values are submitted as repeated hidden inputs."
      ]}
      avoidWhen={[
        "The collection has thousands of items, server pagination, or backend-owned searching.",
        "Assignments need hierarchy, inherited permissions, approval impact preview, or audit confirmation.",
        "Users primarily complete the flow on narrow mobile screens."
      ]}
      description="An experimental dual-list assignment component for moving a moderate known collection between available and assigned states."
      importCode={'import { TransferList } from "@vyrnforge/ui-components";'}
      packageName="@vyrnforge/ui-components"
      props={[
        { name: "options", type: "readonly TransferListOptionData[]", required: true, description: "Known option contract with value, plain-text label, optional description, disabled state, and keywords." },
        { name: "value | defaultValue", type: "readonly string[]", defaultValue: "[]", description: "Controlled or initial assigned target values. Unknown and duplicate values are normalized visually." },
        { name: "onValueChange", type: "(value, options) => void", description: "Called with ordered assigned values and their option objects." },
        { name: "searchable", type: "boolean", defaultValue: "false", description: "Adds independent local search fields to both panels." },
        { name: "filterOptions", type: "TransferListFilterFunction", description: "Application-owned filtering for bounded local collections." },
        { name: "moveAll", type: "boolean", defaultValue: "true", description: "Shows Move all actions for enabled options." },
        { name: "clearSelectionAfterMove", type: "boolean", defaultValue: "true", description: "Clears transferred transient selections after movement." },
        { name: "renderOption", type: "(option, state) => ReactNode", description: "Customizes visual option content while TransferList owns labels, checkbox state, and accessibility." },
        { name: "name", type: "string", description: "Renders repeated hidden inputs for assigned values." }
      ]}
      relatedComponents={[
        { id: "checkbox", name: "Checkbox", description: "Independent Boolean selection." },
        { id: "multi-select", name: "MultiSelect", description: "Compact small-set multiple selection." },
        { id: "autocomplete", name: "Autocomplete", description: "Searchable single-value selection." },
        { id: "select", name: "Select", description: "Small single-value option sets." },
        { id: "grid-basic", name: "UniversalDataGrid", description: "Large or server-managed resource collections." }
      ]}
      sections={[
        {
          id: "basic-usage",
          label: "Basic usage",
          title: "Basic usage",
          children: live("transfer-list-basic", "Application assignment", `function Example() {
  const [assigned, setAssigned] = React.useState(["atlas"]);

  return (
    <TransferList
      options={${applicationOptions}}
      value={assigned}
      onValueChange={setAssigned}
      sourceTitle="Available applications"
      targetTitle="Assigned applications"
    />
  );
}

render(<Example />);`, baseScope, 'import { TransferList } from "@vyrnforge/ui-components";')
        },
        {
          id: "controlled-value",
          label: "Controlled value",
          title: "Controlled value",
          children: live("transfer-list-controlled", "Controlled assigned values", `function Example() {
  const [assigned, setAssigned] = React.useState(["iam", "reports"]);

  return (
    <Stack gap="sm">
      <TransferList
        options={${applicationOptions}}
        value={assigned}
        onValueChange={setAssigned}
        sourceTitle="Available apps"
        targetTitle="Granted apps"
      />
      <Text tone="muted">Assigned values: {assigned.join(", ") || "None"}</Text>
    </Stack>
  );
}

render(<Example />);`, richScope, 'import { Stack, Text, TransferList } from "@vyrnforge/ui-components";')
        },
        {
          id: "searchable-panels",
          label: "Searchable panels",
          title: "Searchable panels",
          children: live("transfer-list-searchable", "Independent panel search", `<TransferList
  defaultValue={["atlas"]}
  options={${applicationOptions}}
  searchable
  sourceSearchPlaceholder="Search available apps"
  targetSearchPlaceholder="Search assigned apps"
  sourceTitle="Available applications"
  targetTitle="Assigned applications"
/>`, baseScope, 'import { TransferList } from "@vyrnforge/ui-components";')
        },
        {
          id: "select-visible",
          label: "Select visible",
          title: "Select visible",
          children: live("transfer-list-select-visible", "Filter-aware select visible", `<TransferList
  defaultValue={["reports"]}
  options={${fieldOptions}}
  searchable
  sourceDescription="Select visible affects only the currently filtered enabled rows."
  sourceTitle="Available report fields"
  targetTitle="Selected report fields"
/>`, baseScope, 'import { TransferList } from "@vyrnforge/ui-components";')
        },
        {
          id: "disabled-options",
          label: "Disabled options",
          title: "Disabled options",
          children: live("transfer-list-disabled-option", "Locked assignments", `<TransferList
  defaultValue={["atlas", "gateway"]}
  options={[
    { value: "iam", label: "Identity and Access Management", description: "Can be assigned by workspace owners." },
    { value: "atlas", label: "Atlas Intelligence Platform", description: "Currently assigned." },
    { value: "gateway", label: "Gateway UI", description: "Managed by platform policy.", disabled: true },
    { value: "reports", label: "Reporting Portal", description: "Available for assignment." }
  ]}
  sourceTitle="Available applications"
  targetTitle="Assigned applications"
/>`, baseScope, 'import { TransferList } from "@vyrnforge/ui-components";')
        },
        {
          id: "disabled-read-only",
          label: "Disabled and read-only",
          title: "Disabled and read-only",
          children: live("transfer-list-disabled-readonly", "Non-editable states", `<Stack gap="md">
  <TransferList
    disabled
    defaultValue={["atlas"]}
    options={${applicationOptions}}
    sourceTitle="Disabled available"
    targetTitle="Disabled assigned"
  />
  <TransferList
    readOnly
    defaultValue={["iam", "reports"]}
    options={${applicationOptions}}
    sourceTitle="Read-only available"
    targetTitle="Read-only assigned"
  />
</Stack>`, richScope, 'import { Stack, TransferList } from "@vyrnforge/ui-components";', undefined, 260)
        },
        {
          id: "custom-option-rendering",
          label: "Custom rendering",
          title: "Custom option rendering",
          children: live("transfer-list-render-option", "Metadata-rich rows", `<TransferList
  defaultValue={["atlas"]}
  options={${applicationOptions}}
  renderOption={(option, state) => (
    <Stack gap="xs">
      <Text as="span" tone={state.selected ? "strong" : "default"}>{option.label}</Text>
      {option.description && <Caption>{option.description}</Caption>}
      {state.disabled && <Badge size="sm" variant="warning">Locked</Badge>}
    </Stack>
  )}
  sourceTitle="Available applications"
  targetTitle="Assigned applications"
/>`, richScope, 'import { Badge, Caption, Stack, Text, TransferList } from "@vyrnforge/ui-components";')
        },
        {
          id: "form-submission",
          label: "Form submission",
          title: "Form submission",
          children: live("transfer-list-form", "Repeated hidden inputs", `<form onSubmit={(event) => event.preventDefault()}>
  <Field label="Applications" description="Assigned values submit as repeated applicationIds fields.">
    <TransferList
      name="applicationIds"
      defaultValue={["iam", "atlas"]}
      options={${applicationOptions}}
      sourceTitle="Available applications"
      targetTitle="Assigned applications"
    />
  </Field>
  <Button type="submit" variant="primary">Submit assignment</Button>
</form>`, richScope, 'import { Button, Field, TransferList } from "@vyrnforge/ui-components";')
        },
        {
          id: "responsive-behavior",
          label: "Responsive behavior",
          title: "Responsive behavior",
          children: live("transfer-list-responsive", "Stacked layout", `<div style={{ maxWidth: 520 }}>
  <TransferList
    defaultValue={["status", "region"]}
    options={${fieldOptions}}
    searchable
    sourceTitle="Available fields"
    targetTitle="Report fields"
  />
</div>`, baseScope, 'import { TransferList } from "@vyrnforge/ui-components";', "The component stacks panels when its viewport is narrow, and each panel keeps its own scroll container.")
        }
      ]}
      status="experimental"
      title="Transfer List"
      useWhen={[
        "Users choose a subset from a bounded known collection.",
        "Available and assigned states should stay visible at the same time.",
        "Movement is reversible and item metadata is simple."
      ]}
    />
  );
}

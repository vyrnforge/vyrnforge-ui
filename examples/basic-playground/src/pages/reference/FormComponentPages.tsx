import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { createLiveScope, LiveExample } from "../../components/live";

function live(
  id: string,
  title: string,
  initialCode: string,
  scope: Record<string, unknown>,
  imports: string,
  description?: string
) {
  return (
    <LiveExample
      description={description}
      id={id}
      imports={imports}
      initialCode={initialCode.trim()}
      scope={scope}
      title={title}
    />
  );
}

const formImport = 'import { Field, TextInput } from "@vyrnforge/ui-components";';

export function FieldReferencePage() {
  const scope = createLiveScope("Field", "Stack", "TextInput");

  return <ComponentDemoPage
    accessibility={[
      "Use the Field render function when Field should generate the control id and ARIA relationships.",
      "For static children, pair htmlFor with the child control id."
    ]}
    avoidWhen={["A radio collection already has a RadioGroup legend.", "A compact inline checkbox owns its own label."]}
    description="Label, description, required-state, and validation composition for native VyrnForge controls."
    importCode={formImport}
    packageName="@vyrnforge/ui-components"
    props={[
      { name: "label", type: "ReactNode", description: "Visible control label." },
      { name: "id", type: "string", description: "Control id supplied to a Field render function." },
      { name: "htmlFor", type: "string", description: "Control id for a static child." },
      { name: "description", type: "ReactNode", description: "Supplementary help associated with the control." },
      { name: "error | warning | success", type: "ReactNode", description: "Validation message and tone." },
      { name: "orientation", type: '"vertical" | "horizontal"', defaultValue: '"vertical"', description: "Label and control layout." }
    ]}
    relatedComponents={[]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("field-basic-live", "Generated control relationship", `<Field id="workspace-name" label="Workspace name" required description="Used in the workspace URL.">
  {(controlProps) => <TextInput {...controlProps} defaultValue="Operations" />}
</Field>`, scope, formImport) },
      { id: "validation", label: "Validation", title: "Validation", children: live("field-validation-live", "Associated error message", `<Field id="workspace-slug" label="Workspace slug" error="Use at least three lowercase characters." required>
  {(controlProps) => <TextInput {...controlProps} defaultValue="op" />}
</Field>`, scope, formImport) },
      { id: "horizontal-layout", label: "Horizontal layout", title: "Horizontal layout", children: live("field-horizontal-live", "Settings form layout", `<Stack gap="md">
  <Field id="owner" label="Owner" orientation="horizontal" description="Shown on requests.">
    {(controlProps) => <TextInput {...controlProps} defaultValue="Finance Operations" />}
  </Field>
  <Field htmlFor="region" label="Region" orientation="horizontal">
    <TextInput id="region" defaultValue="APAC" />
  </Field>
</Stack>`, scope, 'import { Field, Stack, TextInput } from "@vyrnforge/ui-components";') }
    ]}
    status="experimental"
    title="Field"
    useWhen={["Building standard create, edit, settings, and configuration fields.", "A control needs clear associated help or validation."]}
  />;
}

export function ValidationMessagePage() {
  const scope = createLiveScope("Inline", "ValidationMessage");
  return <ComponentDemoPage accessibility={["Error tone uses an alert role by default.", "Info, warning, and success messages do not interrupt screen readers."]} avoidWhen={["The message is page-level feedback; use Alert or ErrorState."]} description="A concise field-level validation or informational message with semantic tones." importCode={'import { ValidationMessage } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "tone", type: '"error" | "warning" | "success" | "info"', defaultValue: '"error"', description: "Message meaning and accessible urgency." }, { name: "id", type: "string", description: "Id that a control can reference with aria-describedby." }, { name: "role", type: "string", description: "Override the default alert role only when necessary." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("validation-message-basic-live", "Error message", '<ValidationMessage tone="error">Email is required.</ValidationMessage>', scope, 'import { ValidationMessage } from "@vyrnforge/ui-components";') }, { id: "variants", label: "Variants", title: "Variants", children: live("validation-message-variants-live", "Validation outcomes", `<Inline gap="md" wrap>
  <ValidationMessage tone="warning">Review before publishing.</ValidationMessage>
  <ValidationMessage tone="success">Changes are ready to save.</ValidationMessage>
  <ValidationMessage tone="info">This setting applies to new requests.</ValidationMessage>
</Inline>`, scope, 'import { Inline, ValidationMessage } from "@vyrnforge/ui-components";') }]} status="experimental" title="ValidationMessage" useWhen={["Explaining an individual validation state.", "Providing compact field-adjacent guidance."]} />;
}

export function RadioPage() {
  const scope = createLiveScope("Radio", "Stack");
  return <ComponentDemoPage accessibility={["Give an individual radio a visible label or aria-label.", "Group mutually exclusive options with RadioGroup."]} avoidWhen={["A binary setting; use Checkbox or Switch.", "A grouped choice; use RadioGroup."]} description="A native radio input for simple, explicitly named single-choice options." importCode={'import { Radio } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "checked | defaultChecked", type: "boolean", description: "Controlled or initial selected state." }, { name: "name", type: "string", description: "Native radio group name." }, { name: "label", type: "ReactNode", description: "Visible option label." }, { name: "description", type: "ReactNode", description: "Optional supporting text." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("radio-basic-live", "Standalone option", '<Radio defaultChecked label="Monthly billing" name="billing" value="monthly" />', scope, 'import { Radio } from "@vyrnforge/ui-components";') }, { id: "states", label: "States", title: "States", children: live("radio-states-live", "Disabled and invalid", `<Stack gap="sm">
  <Radio label="Disabled option" disabled name="availability" value="disabled" />
  <Radio label="Required selection" invalid required name="availability" value="required" />
</Stack>`, scope, 'import { Radio, Stack } from "@vyrnforge/ui-components";') }]} status="experimental" title="Radio" useWhen={["Composing a small native choice set manually.", "A RadioGroup is not needed because the surrounding fieldset is already present."]} />;
}

export function RadioGroupPage() {
  const scope = createLiveScope("RadioGroup", "Stack");
  return <ComponentDemoPage accessibility={["RadioGroup uses a fieldset and legend for its choice set.", "Native arrow-key behavior remains available within the group."]} avoidWhen={["A long option list; use Select.", "Independent multiple selections; use Checkbox."]} description="A fieldset-based native radio group with controlled or uncontrolled value support." importCode={'import { RadioGroup } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "options", type: "RadioGroupOption[]", required: true, description: "Value, label, description, and disabled state." }, { name: "value | defaultValue", type: "string", description: "Controlled or initial selection." }, { name: "onValueChange", type: "(value: string) => void", description: "Selection callback." }, { name: "orientation", type: '"vertical" | "horizontal"', defaultValue: '"vertical"', description: "Option layout." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("radio-group-basic-live", "Delivery choice", '<RadioGroup label="Delivery method" defaultValue="standard" name="delivery" options={[{ label: "Standard", value: "standard" }, { label: "Express", value: "express" }]} />', scope, 'import { RadioGroup } from "@vyrnforge/ui-components";') }, { id: "validation", label: "Validation", title: "Validation", children: live("radio-group-validation-live", "Required horizontal selection", `<Stack gap="md">
  <RadioGroup label="Review cycle" orientation="horizontal" required options={[{ label: "Monthly", value: "monthly" }, { label: "Quarterly", value: "quarterly" }, { label: "Annual", value: "annual", disabled: true }]} />
  <RadioGroup label="Escalation" error="Choose an escalation level." options={[{ label: "Standard", value: "standard" }, { label: "High", value: "high" }]} />
</Stack>`, scope, 'import { RadioGroup, Stack } from "@vyrnforge/ui-components";') }]} status="experimental" title="RadioGroup" useWhen={["One option must be selected from a small named set.", "The form needs a visible group label and validation text."]} />;
}

export function SwitchPage() {
  const scope = createLiveScope("Stack", "Switch");
  return <ComponentDemoPage accessibility={["Switch uses a native checkbox with role=switch and keyboard support.", "The on and off labels make state clear without relying only on color."]} avoidWhen={["Acknowledging a policy; use Checkbox.", "Selecting one option from a set; use RadioGroup."]} description="A native checkbox-based switch for immediate settings and preferences." importCode={'import { Switch } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "checked | defaultChecked", type: "boolean", description: "Controlled or initial enabled state." }, { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Boolean state callback." }, { name: "label", type: "ReactNode", description: "Visible setting label." }, { name: "description", type: "ReactNode", description: "Supporting setting detail." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("switch-basic-live", "Preference", '<Switch defaultChecked label="Enable workflow alerts" description="Notify request owners when status changes." />', scope, 'import { Switch } from "@vyrnforge/ui-components";') }, { id: "states", label: "States", title: "States", children: live("switch-states-live", "Controlled and unavailable settings", `function Example() {
  const [enabled, setEnabled] = React.useState(true);
  return <Stack gap="sm"><Switch checked={enabled} label="Require audit notes" onCheckedChange={setEnabled} /><Switch disabled label="Managed by organization policy" /><Switch invalid label="Review this setting" /></Stack>;
}

render(<Example />);`, scope, 'import { Stack, Switch } from "@vyrnforge/ui-components";') }]} status="experimental" title="Switch" useWhen={["Changing an immediate, independent setting.", "The setting is understandable in both on and off states."]} />;
}

function nativeInputPage(
  title: string,
  description: string,
  component: "NumberInput" | "DateInput" | "DateTimeInput",
  basicCode: string,
  stateCode: string,
  props: Array<{ name: string; type: string; description: string; defaultValue?: string }>
) {
  const scope = createLiveScope("Field", "NumberInput", "Stack", "DateInput", "DateTimeInput");
  const imports = `import { ${component}, Field, Stack } from "@vyrnforge/ui-components";`;
  return <ComponentDemoPage accessibility={["Provide a visible Field label or aria-label.", "Native constraints such as required, min, max, and readOnly stay available."]} avoidWhen={["The value needs custom formatting or masking."]} description={description} importCode={imports} packageName="@vyrnforge/ui-components" props={props} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live(`${component.toLowerCase()}-basic-live`, "Native input", basicCode, scope, imports) }, { id: "states", label: "States", title: "States", children: live(`${component.toLowerCase()}-states-live`, "Required, invalid, and unavailable", stateCode, scope, imports) }]} status="experimental" title={title} useWhen={["A standard native input covers the workflow.", "The application benefits from browser-native editing and validation behavior."]} />;
}

export function NumberInputPage() {
  return nativeInputPage("NumberInput", "A native number input with integer and decimal input modes.", "NumberInput", `<Field id="risk-score" label="Risk score" description="Scores over 70 require review.">
  {(controlProps) => <NumberInput {...controlProps} defaultValue={74} max={100} min={0} mode="integer" />}
</Field>`, `<Stack gap="sm">
  <NumberInput aria-label="Discount rate" defaultValue={12.5} min={0} mode="decimal" step={0.01} />
  <NumberInput aria-label="Required count" invalid required placeholder="Enter a count" />
  <NumberInput aria-label="Locked count" disabled defaultValue={25} />
</Stack>`, [{ name: "mode", type: '"integer" | "decimal"', defaultValue: '"integer"', description: "Keyboard and input-mode preference." }, { name: "min | max | step", type: "number", description: "Native numeric constraints." }, { name: "value | defaultValue", type: "number | string", description: "Controlled or initial value." }, { name: "invalid", type: "boolean", description: "Invalid visual and ARIA state." }]);
}

export function DateInputPage() {
  return nativeInputPage("DateInput", "A native date input for local calendar dates without a date-picker dependency.", "DateInput", `<Field id="needed-by" label="Needed by" required>
  {(controlProps) => <DateInput {...controlProps} defaultValue="2026-07-17" min="2026-07-01" />}
</Field>`, `<Stack gap="sm">
  <DateInput aria-label="Start date" defaultValue="2026-07-10" />
  <DateInput aria-label="Required completion date" invalid required />
  <DateInput aria-label="Locked date" disabled defaultValue="2026-07-21" />
</Stack>`, [{ name: "min | max", type: "string", description: "Native ISO date constraints." }, { name: "value | defaultValue", type: "string", description: "Controlled or initial YYYY-MM-DD value." }, { name: "readOnly | disabled", type: "boolean", description: "Native availability controls." }, { name: "invalid", type: "boolean", description: "Invalid visual and ARIA state." }]);
}

export function DateTimeInputPage() {
  return nativeInputPage("DateTimeInput", "A native datetime-local input for local scheduling without timezone or calendar dependencies.", "DateTimeInput", `<Field id="review-at" label="Review meeting" description="Times use the viewer's local time.">
  {(controlProps) => <DateTimeInput {...controlProps} defaultValue="2026-07-17T10:30" />}
</Field>`, `<Stack gap="sm">
  <DateTimeInput aria-label="Start meeting" defaultValue="2026-07-10T09:30" />
  <DateTimeInput aria-label="Required meeting" invalid required />
  <DateTimeInput aria-label="Locked meeting" disabled defaultValue="2026-07-21T16:00" />
</Stack>`, [{ name: "min | max", type: "string", description: "Native datetime-local constraints." }, { name: "value | defaultValue", type: "string", description: "Controlled or initial local datetime value." }, { name: "readOnly | disabled", type: "boolean", description: "Native availability controls." }, { name: "invalid", type: "boolean", description: "Invalid visual and ARIA state." }]);
}

export function TextInputReferencePage() {
  const scope = createLiveScope("Field", "Stack", "TextInput");
  return <ComponentDemoPage accessibility={["Provide Field label or aria-label.", "Pair invalid state with clear associated validation text."]} avoidWhen={["The value is a search query; use SearchInput.", "The value spans multiple lines; use Textarea."]} description="A native text input with shared VyrnForge sizes, focus styling, and Field support." importCode={formImport} packageName="@vyrnforge/ui-components" props={[{ name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Control density." }, { name: "invalid", type: "boolean", description: "Invalid visual and ARIA state." }, { name: "readOnly | disabled | required", type: "boolean", description: "Native input states." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("text-input-field-live", "Label and description", `<Field id="workspace-name" label="Workspace name" description="Used in the workspace URL." required>
  {(controlProps) => <TextInput {...controlProps} defaultValue="Operations" />}
</Field>`, scope, formImport) }, { id: "states", label: "States", title: "States", children: live("text-input-states-live", "Invalid, read-only, and disabled", `<Stack gap="sm">
  <TextInput aria-label="Invalid workspace name" invalid defaultValue="Op" />
  <TextInput aria-label="Read only workspace name" readOnly defaultValue="Operations" />
  <TextInput aria-label="Disabled workspace name" disabled defaultValue="Managed by policy" />
</Stack>`, scope, 'import { Stack, TextInput } from "@vyrnforge/ui-components";') }]} status="experimental" title="TextInput" useWhen={["Capturing a short text value.", "The application needs native onChange behavior."]} />;
}

export function TextareaPage() {
  const scope = createLiveScope("Field", "Stack", "Textarea");
  return <ComponentDemoPage accessibility={["Provide Field label or aria-label.", "Textarea keeps native keyboard and resize behavior."]} avoidWhen={["The value is a short single-line field; use TextInput."]} description="A native multiline text control with shared VyrnForge styling and validation states." importCode={'import { Field, Textarea } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "rows", type: "number", description: "Native visible line count." }, { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Control density." }, { name: "invalid", type: "boolean", description: "Invalid visual and ARIA state." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("textarea-basic-live", "Justification", `<Field id="justification" label="Justification" description="Explain the business reason for this request.">
  {(controlProps) => <Textarea {...controlProps} defaultValue="Access is needed for month-end reconciliation." rows={4} />}
</Field>`, scope, 'import { Field, Textarea } from "@vyrnforge/ui-components";') }, { id: "states", label: "States", title: "States", children: live("textarea-states-live", "Required and unavailable", `<Stack gap="sm">
  <Textarea aria-label="Required justification" invalid required placeholder="Add a business reason" rows={3} />
  <Textarea aria-label="Read only note" readOnly defaultValue="Recorded by policy." rows={3} />
</Stack>`, scope, 'import { Stack, Textarea } from "@vyrnforge/ui-components";') }]} status="experimental" title="Textarea" useWhen={["Capturing longer explanations, notes, or justifications."]} />;
}

export function SelectReferencePage() {
  const scope = createLiveScope("Field", "Select", "Stack");
  return <ComponentDemoPage accessibility={["Associate Select with Field or aria-label.", "Native select provides its own keyboard behavior."]} avoidWhen={["The list is large or dynamic.", "Multiple selections are required."]} description="A native select for short, stable option sets with shared size and validation styling." importCode={'import { Field, Select } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "options", type: "SelectOption[]", description: "Option label, value, and disabled state." }, { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Control density." }, { name: "invalid", type: "boolean", description: "Invalid visual and ARIA state." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("select-field-live", "Default region", `<Field id="region" label="Default region" required>
  {(controlProps) => <Select {...controlProps} defaultValue="apac" options={[{ label: "APAC", value: "apac" }, { label: "EMEA", value: "emea" }, { label: "AMER", value: "amer" }]} />}
</Field>`, scope, 'import { Field, Select } from "@vyrnforge/ui-components";') }, { id: "states", label: "States", title: "States", children: live("select-states-live", "Invalid and disabled options", `<Stack gap="sm">
  <Select aria-label="Plan" invalid required options={[{ label: "Choose a plan", value: "" }]} />
  <Select aria-label="Plan options" options={[{ label: "Starter", value: "starter" }, { label: "Enterprise", value: "enterprise", disabled: true }]} />
  <Select aria-label="Disabled region" disabled options={[{ label: "APAC", value: "apac" }]} />
</Stack>`, scope, 'import { Select, Stack } from "@vyrnforge/ui-components";') }]} status="experimental" title="Select" useWhen={["Choosing one option from a short stable list."]} />;
}

export function CheckboxReferencePage() {
  const scope = createLiveScope("Checkbox", "Field", "Stack");
  return <ComponentDemoPage accessibility={["A label is preferred unless surrounding text already names the control.", "Use invalid state with nearby validation guidance."]} avoidWhen={["Choosing one exclusive option; use RadioGroup.", "Toggling an immediate setting; use Switch."]} description="A native checkbox for acknowledgements and independent choices." importCode={'import { Checkbox } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "checked | defaultChecked", type: "boolean", description: "Controlled or initial state." }, { name: "label", type: "ReactNode", description: "Visible checkbox label." }, { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Control density." }, { name: "invalid", type: "boolean", description: "Invalid visual and ARIA state." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("checkbox-basic-live", "Acknowledgement", '<Checkbox defaultChecked label="I agree to the workspace policy" />', scope, 'import { Checkbox } from "@vyrnforge/ui-components";') }, { id: "validation", label: "Validation", title: "Validation", children: live("checkbox-states-live", "Required, invalid, and disabled", `<Stack gap="sm">
  <Checkbox invalid label="I acknowledge the data policy" required />
  <Checkbox disabled label="Managed by organization policy" />
  <Field label="Optional acknowledgement" orientation="horizontal"><Checkbox aria-label="Optional acknowledgement" /></Field>
</Stack>`, scope, 'import { Checkbox, Field, Stack } from "@vyrnforge/ui-components";') }]} status="experimental" title="Checkbox" useWhen={["Acknowledging a statement.", "Selecting several independent options."]} />;
}

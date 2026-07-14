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
  return <LiveExample description={description} id={id} imports={imports} initialCode={initialCode.trim()} scope={scope} title={title} />;
}

export function RatingPage() {
  const scope = createLiveScope("Rating", "Stack");
  return <ComponentDemoPage
    accessibility={["Editable ratings use native radio behavior with an accessible name for each value.", "Read-only ratings expose a concise text equivalent and do not behave like editable controls."]}
    avoidWhen={["A continuous range is needed; use Slider.", "A form choice needs longer labels or descriptions; use RadioGroup."]}
    description="A discrete whole-number rating control for qualitative scoring and review workflows."
    importCode={'import { Rating } from "@dravyn/ui-components";'}
    packageName="@dravyn/ui-components"
    props={[{ name: "value | defaultValue", type: "number", description: "Controlled or initial whole-number score." }, { name: "max", type: "number", defaultValue: "5", description: "Number of available rating values." }, { name: "allowClear", type: "boolean", defaultValue: "false", description: "Allows a selected value to be cleared." }, { name: "readOnly | disabled", type: "boolean", description: "Non-editable or unavailable state." }]}
    relatedComponents={[{ id: "radio-group", name: "RadioGroup", description: "Spacious form choices with labels and descriptions." }, { id: "slider", name: "Slider", description: "Bounded continuous numeric input." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("rating-basic-live", "Service rating", '<Rating defaultValue={3} label="Service rating" />', scope, 'import { Rating } from "@dravyn/ui-components";') },
      { id: "controlled-usage", label: "Controlled usage", title: "Controlled usage", children: live("rating-controlled-live", "Application-owned score", `function Example() {
  const [value, setValue] = React.useState(4);
  return <Rating label="Quality score" onValueChange={setValue} value={value} />;
}

render(<Example />);`, scope, 'import { Rating } from "@dravyn/ui-components";') },
      { id: "states", label: "States", title: "States", children: live("rating-states-live", "Read-only, disabled, custom maximum, and clear", `<Stack gap="md">
  <Rating label="Read-only rating" readOnly value={4} />
  <Rating disabled label="Unavailable rating" defaultValue={2} />
  <Rating label="Ten-point review" max={10} defaultValue={7} />
  <Rating allowClear label="Clearable rating" defaultValue={3} />
</Stack>`, scope, 'import { Rating, Stack } from "@dravyn/ui-components";') }
    ]}
    status="experimental"
    title="Rating"
    useWhen={["Capturing a small discrete score such as quality, satisfaction, or review rating.", "Each rating value has a clear shared meaning."]}
  />;
}

export function SliderPage() {
  const scope = createLiveScope("Field", "Slider", "Stack");
  return <ComponentDemoPage
    accessibility={["Slider uses a native range input and keeps browser keyboard behavior.", "Provide a Field label or ariaLabel that describes the numeric meaning, not only its range."]}
    avoidWhen={["The value needs text entry or fine-grained formatting; use NumberInput.", "A discrete qualitative score is clearer; use Rating."]}
    description="A native bounded range input for numeric settings with optional visible value text."
    importCode={'import { Slider } from "@dravyn/ui-components";'}
    packageName="@dravyn/ui-components"
    props={[{ name: "value | defaultValue", type: "number", description: "Controlled or initial numeric value." }, { name: "min | max | step", type: "number", description: "Native range constraints." }, { name: "showValue", type: "boolean", defaultValue: "false", description: "Displays the current value beside the label." }, { name: "formatValue", type: "(value: number) => ReactNode", description: "Formats the visible value." }]}
    relatedComponents={[{ id: "number-input", name: "NumberInput", description: "Direct numeric text entry." }, { id: "rating", name: "Rating", description: "Discrete qualitative score." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("slider-basic-live", "Threshold", '<Slider ariaLabel="Approval threshold" defaultValue={65} label="Approval threshold" showValue />', scope, 'import { Slider } from "@dravyn/ui-components";') },
      { id: "controlled-usage", label: "Controlled usage", title: "Controlled usage", children: live("slider-controlled-live", "Application-owned range", `function Example() {
  const [value, setValue] = React.useState(25);
  return <Slider ariaLabel="Allocation" max={50} min={0} onValueChange={setValue} showValue step={5} value={value} />;
}

render(<Example />);`, scope, 'import { Slider } from "@dravyn/ui-components";') },
      { id: "states", label: "States", title: "States", children: live("slider-states-live", "Formatting, disabled, and Field composition", `<Stack gap="md">
  <Slider ariaLabel="Refresh interval" defaultValue={30} formatValue={(value) => value + " minutes"} max={120} min={15} showValue step={15} />
  <Slider ariaLabel="Locked capacity" disabled defaultValue={80} showValue />
  <Field id="risk-tolerance" label="Risk tolerance" description="Adjust how much operational variance is allowed.">
    {(controlProps) => <Slider {...controlProps} defaultValue={40} showValue />}
  </Field>
</Stack>`, scope, 'import { Field, Slider, Stack } from "@dravyn/ui-components";') }
    ]}
    status="experimental"
    title="Slider"
    useWhen={["Selecting a bounded numeric setting with a useful visible range.", "Keyboard and pointer range interaction fit the workflow."]}
  />;
}

export function ToggleButtonPage() {
  const scope = createLiveScope("Icon", "Inline", "ToggleButton");
  return <ComponentDemoPage
    accessibility={["ToggleButton is a native button with aria-pressed.", "Icon-only usage requires aria-label; a visible label is preferred when space allows."]}
    avoidWhen={["Enabling a persistent setting; use Switch.", "Navigating to another route; use a navigation component."]}
    description="A pressable tool or view-mode action with controlled and uncontrolled pressed state."
    importCode={'import { ToggleButton } from "@dravyn/ui-components";'}
    packageName="@dravyn/ui-components"
    props={[{ name: "pressed | defaultPressed", type: "boolean", description: "Controlled or initial pressed state." }, { name: "onPressedChange", type: "(pressed: boolean) => void", description: "Pressed-state callback." }, { name: "variant", type: '"default" | "quiet" | "outline"', defaultValue: '"default"', description: "Visual treatment." }, { name: "icon", type: "ReactNode", description: "Leading icon." }]}
    relatedComponents={[{ id: "switch", name: "Switch", description: "Persistent settings." }, { id: "button", name: "Button", description: "One-off business actions." }, { id: "icon-button", name: "IconButton", description: "Familiar icon-only utilities." }, { id: "segmented-control", name: "SegmentedControl", description: "Small continuously visible exclusive choices." }, { id: "toggle-button-group", name: "ToggleButtonGroup", description: "Related tool or mode choices." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("toggle-button-basic-live", "Pin tool", '<ToggleButton defaultPressed>Pin column</ToggleButton>', scope, 'import { ToggleButton } from "@dravyn/ui-components";') },
      { id: "controlled-usage", label: "Controlled usage", title: "Controlled usage", children: live("toggle-button-controlled-live", "Application-owned tool", `function Example() {
  const [pressed, setPressed] = React.useState(false);
  return <ToggleButton onPressedChange={setPressed} pressed={pressed}>Show archived</ToggleButton>;
}

render(<Example />);`, scope, 'import { ToggleButton } from "@dravyn/ui-components";') },
      { id: "states", label: "States", title: "States", children: live("toggle-button-states-live", "Icons, utility action, and disabled state", `<Inline gap="sm" wrap>
  <ToggleButton icon={<Icon name="Columns" />}>Columns</ToggleButton>
  <ToggleButton aria-label="Show filters" icon={<Icon name="Filter" />} variant="quiet" />
  <ToggleButton disabled>Managed by policy</ToggleButton>
  <ToggleButton defaultPressed icon={<Icon name="Eye" />}>Compact view</ToggleButton>
</Inline>`, scope, 'import { Icon, Inline, ToggleButton } from "@dravyn/ui-components";') }
    ]}
    status="experimental"
    title="ToggleButton"
    useWhen={["Activating a temporary tool, formatting command, or view option.", "The pressed state is meaningful and visible in the current surface."]}
  />;
}

export function ToggleButtonGroupPage() {
  const scope = createLiveScope("Icon", "ToggleButton", "ToggleButtonGroup");
  return <ComponentDemoPage
    accessibility={["ToggleButtonGroup keeps each child as a native button and supports arrow-key focus movement.", "Children should be ToggleButton components with unique value props; arbitrary children are not modified."]}
    avoidWhen={["The choice set needs long labels or descriptions; use RadioGroup.", "The group is a persistent Boolean setting; use Switch or Checkbox."]}
    description="A joined group of ToggleButton controls for exclusive or multiple tool and mode choices."
    importCode={'import { ToggleButton, ToggleButtonGroup } from "@dravyn/ui-components";'}
    packageName="@dravyn/ui-components"
    props={[{ name: "type", type: '"single" | "multiple"', defaultValue: '"single"', description: "Exclusive or independent selection behavior." }, { name: "value | defaultValue", type: "string | string[]", description: "Controlled or initial selected values." }, { name: "onValueChange", type: "(value: string | string[]) => void", description: "Selection callback." }, { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Joined button direction." }]}
    relatedComponents={[{ id: "toggle-button", name: "ToggleButton", description: "Individual pressed tool control." }, { id: "segmented-control", name: "SegmentedControl", description: "Small stable exclusive choices." }, { id: "radio-group", name: "RadioGroup", description: "Form choice groups." }, { id: "button-group", name: "ButtonGroup", description: "Related actions without selection state." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("toggle-group-basic-live", "Exclusive view choice", `<ToggleButtonGroup ariaLabel="View mode" defaultValue="table">
  <ToggleButton value="table">Table</ToggleButton>
  <ToggleButton value="board">Board</ToggleButton>
  <ToggleButton value="calendar">Calendar</ToggleButton>
</ToggleButtonGroup>`, scope, 'import { ToggleButton, ToggleButtonGroup } from "@dravyn/ui-components";') },
      { id: "controlled-usage", label: "Controlled usage", title: "Controlled usage", children: live("toggle-group-controlled-live", "Application-owned formatting tools", `function Example() {
  const [value, setValue] = React.useState(["bold"]);
  return <ToggleButtonGroup ariaLabel="Formatting" onValueChange={setValue} type="multiple" value={value}><ToggleButton value="bold">Bold</ToggleButton><ToggleButton value="italic">Italic</ToggleButton><ToggleButton value="underline">Underline</ToggleButton></ToggleButtonGroup>;
}

render(<Example />);`, scope, 'import { ToggleButton, ToggleButtonGroup } from "@dravyn/ui-components";') },
      { id: "states", label: "States", title: "States", children: live("toggle-group-states-live", "Vertical, disabled, and compact toolbar composition", `<ToggleButtonGroup ariaLabel="Display options" orientation="vertical" size="sm" type="multiple" defaultValue={["density"]}>
  <ToggleButton value="density">Compact density</ToggleButton>
  <ToggleButton value="wrap">Wrap labels</ToggleButton>
  <ToggleButton value="export" disabled>Export mode</ToggleButton>
</ToggleButtonGroup>

<ToggleButtonGroup ariaLabel="Grid tools" disabled><ToggleButton value="columns" icon={<Icon name="Columns" />}>Columns</ToggleButton><ToggleButton value="filters" icon={<Icon name="Filter" />}>Filters</ToggleButton></ToggleButtonGroup>`, scope, 'import { Icon, ToggleButton, ToggleButtonGroup } from "@dravyn/ui-components";') }
    ]}
    status="experimental"
    title="ToggleButtonGroup"
    useWhen={["Grouping related tools or view modes in a dense work surface.", "Exclusive or multi-select pressed state belongs to a compact group."]}
  />;
}

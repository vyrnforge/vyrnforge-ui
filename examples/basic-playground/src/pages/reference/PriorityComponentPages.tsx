import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { createLiveScope, LiveExample } from "../../components/live";

const componentImports = 'import { Button } from "@vyrnforge/ui-components";';

function live(
  id: string,
  title: string,
  initialCode: string,
  scope: Record<string, unknown>,
  imports?: string,
  description?: string
) {
  return <LiveExample description={description} id={id} imports={imports} initialCode={initialCode.trim()} scope={scope} title={title} />;
}

export function ButtonPage() {
  const scope = createLiveScope("Button", "Icon", "Inline", "Stack");
  return <ComponentDemoPage
    accessibility={["Use visible text for business actions.", "Keep disabled state understandable from surrounding context."]}
    avoidWhen={["The action is icon-only; use IconButton.", "Selecting one option from a set; use SegmentedControl or RadioGroup."]}
    description="A labelled native button for clear business actions and form commands."
    importCode={componentImports}
    packageName="@vyrnforge/ui-components"
    props={[{ name: "variant", type: '"default" | "primary" | "danger" | "ghost" | "subtle"', defaultValue: '"default"', description: "Visual action emphasis." }, { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Control size." }, { name: "loading", type: "boolean", defaultValue: "false", description: "Busy state that prevents repeat actions." }, { name: "fullWidth", type: "boolean", defaultValue: "false", description: "Stretches to the container width." }, { name: "leftSlot", type: "ReactNode", description: "Leading visual content." }, { name: "rightSlot", type: "ReactNode", description: "Trailing visual content." }]}
    relatedComponents={[{ id: "icon-button", name: "IconButton", description: "Compact icon-only utility actions." }, { id: "button-group", name: "ButtonGroup", description: "Visually groups related actions." }, { id: "toolbar-button", name: "ToolbarButton", description: "Dense labelled toolbar actions." }, { id: "segmented-control", name: "SegmentedControl", description: "Mutually exclusive modes." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("button-basic-live", "Basic button", '<Button variant="primary">Save changes</Button>', scope, componentImports) },
      { id: "variants", label: "Variants", title: "Variants", children: live("button-variants-live", "Action emphasis", `<Inline gap="sm" wrap>
  <Button variant="primary">Save</Button>
  <Button variant="subtle">Cancel</Button>
  <Button variant="ghost">Preview</Button>
  <Button variant="danger">Delete</Button>
</Inline>`, scope, 'import { Button, Inline } from "@vyrnforge/ui-components";') },
      { id: "sizes", label: "Sizes", title: "Sizes", children: live("button-sizes-live", "Button sizes", `<Inline gap="sm" align="center">
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</Inline>`, scope, 'import { Button, Inline } from "@vyrnforge/ui-components";') },
      { id: "states", label: "States", title: "States", children: live("button-states-live", "Disabled and loading", `<Inline gap="sm">
  <Button disabled>Disabled</Button>
  <Button loading variant="primary">Saving</Button>
</Inline>`, scope, 'import { Button, Inline } from "@vyrnforge/ui-components";') },
      { id: "composition", label: "Composition", title: "Composition", children: live("button-composition-live", "Icons, form actions, and full width", `<Stack gap="md">
  <Inline gap="sm">
    <Button leftSlot={<Icon name="Plus" />} variant="primary">Create workspace</Button>
    <Button rightSlot={<Icon name="ChevronRight" />}>Continue</Button>
  </Inline>
  <Inline gap="sm" justify="end">
    <Button variant="subtle">Cancel</Button>
    <Button variant="primary">Save changes</Button>
  </Inline>
  <Button fullWidth variant="primary">Publish changes</Button>
</Stack>`, scope, 'import { Button, Icon, Inline, Stack } from "@vyrnforge/ui-components";') }
    ]}
    status="stable"
    title="Button"
    useWhen={["Triggering a visible business action.", "Submitting or cancelling a form.", "Executing a clearly labelled operation."]}
  />;
}

export function IconButtonPage() {
  const scope = createLiveScope("Icon", "IconButton", "Inline", "ToolbarButton");
  return <ComponentDemoPage
    accessibility={["aria-label is required because the control has no visible text.", "A tooltip supplements but never replaces the accessible name."]}
    avoidWhen={["The action needs a visible label; use Button.", "The icon is unfamiliar or ambiguous."]}
    description="A compact, icon-only native button for familiar utility actions."
    importCode={'import { Icon, IconButton } from "@vyrnforge/ui-components";'}
    packageName="@vyrnforge/ui-components"
    props={[{ name: "aria-label", type: "string", required: true, description: "Accessible action name." }, { name: "variant", type: '"default" | "primary" | "danger" | "ghost" | "subtle"', defaultValue: '"default"', description: "Visual emphasis." }, { name: "size", type: '"xs" | "sm" | "md" | "lg"', defaultValue: '"md"', description: "Square control size." }, { name: "tooltip", type: "ReactNode", description: "Hover and focus hint." }, { name: "loading", type: "boolean", defaultValue: "false", description: "Busy state." }]}
    relatedComponents={[{ id: "button", name: "Button", description: "Visible business actions." }, { id: "toolbar-button", name: "ToolbarButton", description: "Compact labelled toolbar commands." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("icon-button-basic-live", "Accessible utility action", '<IconButton aria-label="Refresh orders" tooltip="Refresh orders"><Icon name="Refresh" /></IconButton>', scope, 'import { Icon, IconButton } from "@vyrnforge/ui-components";') },
      { id: "sizes", label: "Sizes", title: "Sizes", children: live("icon-button-sizes-live", "Size variants", `<Inline gap="sm" align="center">
  <IconButton aria-label="Add small" size="xs"><Icon name="Plus" /></IconButton>
  <IconButton aria-label="Add medium" size="md"><Icon name="Plus" /></IconButton>
  <IconButton aria-label="Add large" size="lg"><Icon name="Plus" /></IconButton>
</Inline>`, scope, 'import { Icon, IconButton, Inline } from "@vyrnforge/ui-components";') },
      { id: "states", label: "States and toolbar", title: "States and toolbar", children: live("icon-button-states-live", "Disabled, destructive, and toolbar composition", `<Inline gap="sm">
  <IconButton aria-label="Disabled settings" disabled><Icon name="Settings" /></IconButton>
  <IconButton aria-label="Delete record" tooltip="Delete record" variant="danger"><Icon name="Delete" /></IconButton>
  <ToolbarButton icon={<Icon name="Refresh" />} label="Refresh" />
</Inline>`, scope, 'import { Icon, IconButton, Inline, ToolbarButton } from "@vyrnforge/ui-components";') }
    ]}
    status="stable"
    title="IconButton"
    useWhen={["Repeating a familiar utility action in a compact area.", "A nearby toolbar gives clear context for the icon."]}
  />;
}

export function ButtonGroupPage() {
  const scope = createLiveScope("Button", "ButtonGroup");
  return <ComponentDemoPage
    accessibility={["Keep grouped actions related and preserve a logical tab order.", "Do not use grouping alone to imply a selected value."]}
    avoidWhen={["Actions are unrelated.", "The user must choose exactly one option; use SegmentedControl or RadioGroup."]}
    description="A layout wrapper that visually groups adjacent, related buttons."
    importCode={'import { Button, ButtonGroup } from "@vyrnforge/ui-components";'}
    packageName="@vyrnforge/ui-components"
    props={[{ name: "attached", type: "boolean", defaultValue: "false", description: "Joins adjacent borders." }, { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Group direction." }, { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Shared visual size." }]}
    relatedComponents={[{ id: "button", name: "Button", description: "The individual action control." }, { id: "segmented-control", name: "SegmentedControl", description: "Selection semantics for one active mode." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("button-group-basic-live", "Attached related actions", `<ButtonGroup attached>
  <Button>Day</Button>
  <Button variant="primary">Week</Button>
  <Button>Month</Button>
</ButtonGroup>`, scope, 'import { Button, ButtonGroup } from "@vyrnforge/ui-components";') },
      { id: "states", label: "States", title: "States", children: live("button-group-states-live", "Primary, secondary, and disabled actions", `<ButtonGroup orientation="vertical">
  <Button variant="primary">Publish</Button>
  <Button>Save draft</Button>
  <Button disabled>Archive</Button>
</ButtonGroup>`, scope, 'import { Button, ButtonGroup } from "@vyrnforge/ui-components";') }
    ]}
    status="experimental"
    title="ButtonGroup"
    useWhen={["Actions are adjacent and clearly related.", "A compact action cluster benefits from shared framing."]}
  />;
}

export function ToolbarButtonPage() {
  const scope = createLiveScope("Icon", "Inline", "ToolbarButton");
  return <ComponentDemoPage
    accessibility={["Icon-only ToolbarButton use requires aria-label.", "Keep labels concise in dense toolbars."]}
    avoidWhen={["The command is a primary page action; use Button.", "A familiar icon alone is clearer and space is limited; use IconButton."]}
    description="A dense button for repeated toolbar commands with an optional icon and label."
    importCode={'import { Icon, ToolbarButton } from "@vyrnforge/ui-components";'}
    packageName="@vyrnforge/ui-components"
    props={[{ name: "label", type: "ReactNode", description: "Visible label; omit only with aria-label." }, { name: "aria-label", type: "string", description: "Required when label is omitted." }, { name: "icon", type: "ReactNode", description: "Leading command icon." }, { name: "active", type: "boolean", defaultValue: "false", description: "Visual active state." }, { name: "pressed", type: "boolean", description: "Explicit pressed state." }]}
    relatedComponents={[{ id: "button", name: "Button", description: "Primary business actions." }, { id: "icon-button", name: "IconButton", description: "Icon-only utilities." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("toolbar-button-basic-live", "Labelled toolbar action", '<ToolbarButton icon={<Icon name="Refresh" />} label="Refresh" />', scope, 'import { Icon, ToolbarButton } from "@vyrnforge/ui-components";') },
      { id: "composition", label: "Composition", title: "Composition", children: live("toolbar-button-composition-live", "Compact toolbar", `<Inline gap="sm">
  <ToolbarButton icon={<Icon name="Search" />} label="Search" />
  <ToolbarButton active icon={<Icon name="Filter" />} label="Filters" />
  <ToolbarButton aria-label="More actions" icon={<Icon name="MoreHorizontal" />} tooltip="More actions" />
</Inline>`, scope, 'import { Icon, Inline, ToolbarButton } from "@vyrnforge/ui-components";') }
    ]}
    status="stable"
    title="ToolbarButton"
    useWhen={["A repeated command belongs in a dense toolbar.", "A short visible label improves scanability."]}
  />;
}

export function SegmentedControlPage() {
  const scope = createLiveScope("Icon", "SegmentedControl");
  return <ComponentDemoPage accessibility={["Give the option set a clear aria-label.", "Each option must name its resulting mode."]} avoidWhen={["The set is long; use Select.", "The choices navigate to unrelated routes; use navigation controls."]} description="A compact, mutually exclusive mode selector for small option sets." importCode={'import { SegmentedControl } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "options", type: "SegmentedControlOption[]", required: true, description: "Option labels, values, and icons." }, { name: "value", type: "string", description: "Controlled selected value." }, { name: "onChange", type: "(value: string) => void", description: "Selection callback." }]} relatedComponents={[{ id: "button-group", name: "ButtonGroup", description: "Groups actions without selection semantics." }, { id: "tabs", name: "Tabs", description: "Related content panels." }, { id: "select", name: "Select", description: "Longer option sets." }]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("segmented-control-basic-live", "View mode", `function Example() {
  const [value, setValue] = React.useState("table");
  return <SegmentedControl aria-label="View mode" value={value} onChange={setValue} options={[{ label: "Table", value: "table", icon: <Icon name="Columns" /> }, { label: "List", value: "list", icon: <Icon name="DragHandle" /> }]} />;
}

render(<Example />);`, scope, 'import { Icon, SegmentedControl } from "@vyrnforge/ui-components";') }]} status="stable" title="SegmentedControl" useWhen={["Selecting one mode from a small set.", "The choice changes the current surface in place."]} />;
}

export function TextInputPage() {
  const scope = createLiveScope("Field", "Stack", "TextInput");
  return <ComponentDemoPage accessibility={["Provide a visible Field label or aria-label.", "Pair invalid state with clear validation text."]} avoidWhen={["The value is a search query; use SearchInput.", "The value spans multiple lines; use Textarea."]} description="A native text input with VyrnForge sizing and validation styling." importCode={'import { Field, TextInput } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "invalid", type: "boolean", defaultValue: "false", description: "Invalid visual state." }, { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Input size." }, { name: "value", type: "string", description: "Controlled native value." }, { name: "defaultValue", type: "string", description: "Initial uncontrolled value." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("text-input-basic-live", "Workspace name", '<Field htmlFor="workspace-name" label="Workspace name"><TextInput id="workspace-name" defaultValue="Operations" /></Field>', scope, 'import { Field, TextInput } from "@vyrnforge/ui-components";') }, { id: "states", label: "States", title: "States", children: live("text-input-states-live", "Invalid and disabled", `<Stack gap="sm">
  <TextInput aria-label="Invalid workspace name" invalid defaultValue="Short" />
  <TextInput aria-label="Disabled workspace name" disabled defaultValue="Managed by policy" />
</Stack>`, scope, 'import { Stack, TextInput } from "@vyrnforge/ui-components";') }]} status="experimental" title="TextInput" useWhen={["Capturing a short text value.", "The application needs native onChange behavior."]} />;
}

export function SelectPage() {
  const scope = createLiveScope("Select", "Stack");
  return <ComponentDemoPage accessibility={["Associate the select with a visible label or aria-label.", "Keep option labels concise."]} avoidWhen={["The option list is large or asynchronous.", "The user chooses multiple values; use MultiSelect."]} description="A native select with shared VyrnForge styling for compact option sets." importCode={'import { Select } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "options", type: "SelectOption[]", description: "Option labels, values, and disabled state." }, { name: "invalid", type: "boolean", defaultValue: "false", description: "Invalid visual state." }, { name: "value", type: "string", description: "Controlled selected value." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("select-basic-live", "Region selection", '<Select aria-label="Region" defaultValue="apac" options={[{ label: "APAC", value: "apac" }, { label: "EMEA", value: "emea" }, { label: "AMER", value: "amer" }]} />', scope, 'import { Select } from "@vyrnforge/ui-components";') }, { id: "states", label: "States", title: "States", children: live("select-states-live", "Invalid and unavailable options", `<Stack gap="sm">
  <Select aria-label="Plan" invalid options={[{ label: "Choose a plan", value: "" }]} />
  <Select aria-label="Plan options" options={[{ label: "Starter", value: "starter" }, { label: "Enterprise", value: "enterprise", disabled: true }]} />
</Stack>`, scope, 'import { Select, Stack } from "@vyrnforge/ui-components";') }]} status="experimental" title="Select" useWhen={["Choosing one option from a short stable list.", "Native select behavior fits the workflow."]} />;
}

export function CheckboxPage() {
  const scope = createLiveScope("Checkbox", "Stack");
  return <ComponentDemoPage accessibility={["The label must explain the checked state.", "Use error copy near invalid choices."]} avoidWhen={["Choosing one exclusive option; use RadioGroup.", "Toggling an immediate setting; use Switch."]} description="A native checkbox for acknowledgements, permissions, and independent choices." importCode={'import { Checkbox } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "label", type: "ReactNode", description: "Visible checkbox label." }, { name: "invalid", type: "boolean", defaultValue: "false", description: "Invalid visual state." }, { name: "checked", type: "boolean", description: "Controlled checked state." }, { name: "defaultChecked", type: "boolean", description: "Initial uncontrolled state." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("checkbox-basic-live", "Acknowledgement", '<Checkbox defaultChecked label="I agree to the workspace policy" />', scope, 'import { Checkbox } from "@vyrnforge/ui-components";') }, { id: "states", label: "States", title: "States", children: live("checkbox-states-live", "Controlled, disabled, and invalid", `function Example() {
  const [enabled, setEnabled] = React.useState(true);
  return <Stack gap="sm"><Checkbox checked={enabled} label="Enable provisioning" onChange={(event) => setEnabled(event.currentTarget.checked)} /><Checkbox disabled label="Managed by organization policy" /><Checkbox invalid label="Review the required acknowledgement" /></Stack>;
}

render(<Example />);`, scope, 'import { Checkbox, Stack } from "@vyrnforge/ui-components";') }]} status="experimental" title="Checkbox" useWhen={["Acknowledging a statement.", "Selecting several independent options."]} />;
}

export function BadgePage() {
  const scope = createLiveScope("Badge", "Inline");
  return <ComponentDemoPage accessibility={["Use a meaningful label; color alone cannot communicate important state."]} avoidWhen={["Displaying a primary action.", "Showing a sentence or long content."]} description="A compact label for status, metadata, and categorization." importCode={'import { Badge } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "variant", type: '"neutral" | "success" | "warning" | "danger" | "info"', defaultValue: '"neutral"', description: "Semantic color." }, { name: "tone", type: '"subtle" | "solid"', defaultValue: '"subtle"', description: "Surface emphasis." }, { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Badge size." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("badge-basic-live", "Status label", '<Badge variant="success">Ready</Badge>', scope, 'import { Badge } from "@vyrnforge/ui-components";') }, { id: "variants", label: "Variants", title: "Variants", children: live("badge-variants-live", "Semantic variants", `<Inline gap="sm" wrap>
  <Badge>Neutral</Badge>
  <Badge variant="success">Success</Badge>
  <Badge variant="warning">Pending</Badge>
  <Badge tone="solid" variant="danger">Blocked</Badge>
</Inline>`, scope, 'import { Badge, Inline } from "@vyrnforge/ui-components";') }]} status="stable" title="Badge" useWhen={["Showing short, scannable status or metadata.", "Adding secondary context beside a name or heading."]} />;
}

export function AppShellPage() {
  const scope = createLiveScope("AppShell", "Panel", "SideNav", "Text", "TopNav");
  return <ComponentDemoPage accessibility={["Provide meaningful header and sidebar content.", "Use only one route-level main landmark."]} avoidWhen={["A small embedded layout does not need persistent navigation.", "A Panel is sufficient for a framed task surface."]} description="An application-level layout with explicit scroll ownership and persistent regions." importCode={'import { AppShell, SideNav, TopNav } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "scrollMode", type: '"page" | "content" | "split"', defaultValue: '"page"', description: "Shell scrolling strategy." }, { name: "headerPosition", type: '"static" | "sticky" | "fixed"', defaultValue: '"static"', description: "Header position." }, { name: "sidebarPosition", type: '"static" | "sticky" | "fixed"', defaultValue: '"static"', description: "Sidebar position." }, { name: "sidebarWidth", type: "number | string", defaultValue: "280", description: "Expanded sidebar width." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("app-shell-basic-live", "Persistent application layout", `<AppShell fullHeight={false} minHeight={320} header={<TopNav brand="Operations" />} headerPosition="sticky" sidebar={<SideNav activeId="orders" items={[{ id: "overview", label: "Overview" }, { id: "orders", label: "Orders" }]} />} sidebarPosition="sticky" sidebarWidth={180} scrollMode="content">
  <Panel title="Route content"><Text tone="muted">The header and sidebar remain visible while this content area scrolls.</Text></Panel>
</AppShell>`, scope, 'import { AppShell, Panel, SideNav, Text, TopNav } from "@vyrnforge/ui-components";') }]} status="experimental" title="AppShell" useWhen={["Building an admin portal or workspace with persistent navigation.", "The app needs predictable content scrolling."]} />;
}

export function TabsPage() {
  const scope = createLiveScope("Tabs", "Text");
  return <ComponentDemoPage accessibility={["Tabs support arrow, Home, and End keyboard navigation.", "Each tab label should identify its panel clearly."]} avoidWhen={["Switching simple modes without panels; use SegmentedControl.", "Navigating to unrelated routes; use SideNav or TopNav."]} description="Controlled or uncontrolled navigation between related content panels." importCode={'import { Tabs } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components" props={[{ name: "items", type: "TabItem[]", required: true, description: "Tab labels, content, and disabled state." }, { name: "value", type: "string", description: "Controlled selected tab." }, { name: "defaultValue", type: "string", description: "Initial uncontrolled tab." }, { name: "onValueChange", type: "(value: string) => void", description: "Selection callback." }, { name: "variant", type: '"line" | "contained" | "pills"', defaultValue: '"line"', description: "Visual treatment." }]} relatedComponents={[{ id: "segmented-control", name: "SegmentedControl", description: "Small mutually exclusive modes." }]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("tabs-basic-live", "Related content panels", `function Example() {
  const [value, setValue] = React.useState("activity");
  return <Tabs value={value} onValueChange={setValue} items={[{ id: "activity", label: "Activity", content: <Text>Recent activity.</Text> }, { id: "details", label: "Details", content: <Text>Workspace details.</Text> }]} />;
}

render(<Example />);`, scope, 'import { Tabs, Text } from "@vyrnforge/ui-components";') }, { id: "variants", label: "Variants", title: "Variants", children: live("tabs-variants-live", "Pills variant", '<Tabs defaultValue="summary" size="sm" variant="pills" items={[{ id: "summary", label: "Summary", content: <Text>Summary content.</Text> }, { id: "history", label: "History", content: <Text>History content.</Text> }]} />', scope, 'import { Tabs, Text } from "@vyrnforge/ui-components";') }]} status="experimental" title="Tabs" useWhen={["Switching related content panels on one route.", "The panel set is limited and labels are short."]} />;
}

export function BasicGridReferencePage() {
  const scope = createLiveScope("UniversalDataGrid");
  return <ComponentDemoPage accessibility={["Give the grid a surrounding heading that describes the data.", "Test sorting and other grid controls with keyboard access."]} avoidWhen={["Rendering a simple key/value record.", "Owning fetching, mutations, or global state inside the grid."]} description="A specialized enterprise grid for structured data management. Application code owns rows and business workflows." importCode={'import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";'} packageName="@vyrnforge/ui-data-grid" props={[{ name: "columns", type: "DataGridColumnDef<T>[]", required: true, description: "Column definitions." }, { name: "rows", type: "T[]", required: true, description: "Application-owned row data." }, { name: "tableId", type: "string", required: true, description: "Stable grid identifier." }, { name: "state", type: "DataGridState", description: "Optional controlled state." }, { name: "onStateChange", type: "(state: DataGridState) => void", description: "Controlled-state callback." }]} relatedComponents={[]} sections={[{ id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("grid-basic-live", "Small application-owned dataset", `<UniversalDataGrid
  tableId="users"
  columns={[
    { id: "name", header: "Name", accessorKey: "name", sortable: true, searchable: true },
    { id: "status", header: "Status", accessorKey: "status", sortable: true }
  ]}
  rows={[
    { id: "u-1", name: "Mira Sutanto", status: "Active" },
    { id: "u-2", name: "Daniel Prasetyo", status: "Pending" }
  ]}
  getRowId={(row) => row.id}
  variant="card"
/>`, scope, 'import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";', "Edit the columns or rows to see the grid update without changing application state.") }]} status="stable" title="UniversalDataGrid" useWhen={["Managing structured records with columns, search, sorting, and grid controls.", "The application owns data and connects server or persistence adapters at its boundary."]} />;
}

import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { createLiveScope, LiveExample } from "../../components/live";

function live(id: string, title: string, code: string, scope: Record<string, unknown>, imports: string, description?: string) {
  return <LiveExample description={description} id={id} imports={imports} initialCode={code.trim()} scope={scope} title={title} />;
}

const overlayScope = createLiveScope("Button", "ConfirmDialog", "Dialog", "Drawer", "Dropdown", "Icon", "IconButton", "Inline", "Menu", "Popover", "Stack", "Text", "TextInput", "Tooltip");

export function PopoverPage() {
  return <ComponentDemoPage
    accessibility={["Popover restores focus to its trigger when it closes.", "Keep non-modal popovers focused on their current task; only use modal for a contained interaction."]}
    avoidWhen={["Choosing a form value; use Select or a future Autocomplete.", "Presenting action commands; use Menu."]}
    description="Generic trigger-controlled floating content with shared portal, dismissal, positioning, and optional modal focus behavior."
    importCode={'import { Popover } from "@vyrnforge/ui-components";'}
    packageName="@vyrnforge/ui-components"
    props={[{ name: "open | defaultOpen", type: "boolean", description: "Controlled or initial visibility." }, { name: "placement | offset", type: "placement | number", description: "Anchored position and spacing." }, { name: "matchTriggerWidth", type: "boolean", description: "Makes the floating panel match the trigger width." }, { name: "modal", type: "boolean", defaultValue: "false", description: "Traps focus and treats the content as a dialog." }]}
    relatedComponents={[{ id: "dropdown", name: "Dropdown", description: "Generic content composition with the same floating behavior." }, { id: "menu", name: "Menu", description: "Action-oriented menu semantics." }, { id: "tooltip", name: "Tooltip", description: "Non-interactive contextual description." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("popover-basic", "Basic popover", `<Popover trigger={<Button>View details</Button>}><Stack gap="sm"><Text weight="strong">Quarterly review</Text><Text tone="muted">Reports are ready for approval.</Text></Stack></Popover>`, overlayScope, 'import { Button, Popover, Stack, Text } from "@vyrnforge/ui-components";') },
      { id: "placements", label: "Placements", title: "Placements", children: live("popover-placements", "Placement and matching width", `<Inline gap="sm" wrap><Popover placement="top" trigger={<Button variant="secondary">Top</Button>}>Top placement</Popover><Popover matchTriggerWidth trigger={<Button variant="secondary">Match width</Button>}>This panel matches its trigger width.</Popover></Inline>`, overlayScope, 'import { Button, Inline, Popover } from "@vyrnforge/ui-components";') },
      { id: "controlled-usage", label: "Controlled usage", title: "Controlled usage", children: live("popover-controlled", "Controlled interactive content", `function Example() { const [open, setOpen] = React.useState(false); return <Popover open={open} onOpenChange={setOpen} trigger={<Button>{open ? "Close details" : "Open details"}</Button>}><Stack gap="sm"><TextInput aria-label="Note" placeholder="Add a note" /><Button onClick={() => setOpen(false)}>Save note</Button></Stack></Popover>; } render(<Example />);`, overlayScope, 'import { Button, Popover, Stack, TextInput } from "@vyrnforge/ui-components";') },
      { id: "composition", label: "Composition", title: "Composition", children: live("popover-nested", "Nested popover", `<Popover trigger={<Button>Account</Button>}><Stack gap="sm"><Text>Account tools</Text><Popover trigger={<Button variant="secondary">More options</Button>}>Nested content closes before the parent.</Popover></Stack></Popover>`, overlayScope, 'import { Button, Popover, Stack, Text } from "@vyrnforge/ui-components";') }
    ]}
    status="stable" title="Popover" useWhen={["Showing compact interactive details connected to a trigger.", "The app needs controlled or uncontrolled floating content without menu semantics."]}
  />;
}

export function MenuPage() {
  return <ComponentDemoPage
    accessibility={["Menu uses role=menu and native menuitem buttons.", "Arrow keys, Home, End, Enter, Space, and Escape follow the enabled item sequence."]}
    avoidWhen={["Selecting a persistent form value; use Select.", "Showing explanatory content; use Popover."]}
    description="Action-oriented floating menu with keyboard navigation, disabled-item skipping, and shared anchored positioning."
    importCode={'import { Menu } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components"
    props={[{ name: "items", type: "MenuItem[]", description: "Action records with label, disabled, danger, and onSelect." }, { name: "open | defaultOpen", type: "boolean", description: "Controlled or initial visibility." }, { name: "placement", type: "PopoverPlacement", description: "Anchored menu location." }]}
    relatedComponents={[{ id: "dropdown", name: "Dropdown", description: "Generic floating content without menu roles." }, { id: "popover", name: "Popover", description: "Interactive non-menu content." }]}
    sections={[
      { id: "basic-usage", label: "Basic actions", title: "Basic actions", children: live("menu-basic", "Actions menu", `<Menu trigger={<Button>Actions</Button>} items={[{ id: "edit", label: "Edit", onSelect: () => undefined }, { id: "duplicate", label: "Duplicate" }, { id: "archive", label: "Archive", danger: true }]} />`, overlayScope, 'import { Button, Menu } from "@vyrnforge/ui-components";') },
      { id: "states", label: "States", title: "States", children: live("menu-states", "Disabled and destructive actions", `<Menu trigger={<Button variant="secondary">Manage</Button>} items={[{ id: "rename", label: "Rename" }, { id: "locked", label: "Managed by policy", disabled: true }, { id: "delete", label: "Delete record", danger: true }]} />`, overlayScope, 'import { Button, Menu } from "@vyrnforge/ui-components";') },
      { id: "keyboard-navigation", label: "Keyboard navigation", title: "Keyboard navigation", children: live("menu-keyboard", "Keyboard-ready menu", `<Menu trigger={<Button>Open with keyboard</Button>} items={[{ id: "first", label: "First action" }, { id: "disabled", label: "Skipped disabled action", disabled: true }, { id: "last", label: "Last action" }]} />`, overlayScope, 'import { Button, Menu } from "@vyrnforge/ui-components";', "Open the trigger, then use ArrowUp, ArrowDown, Home, End, Enter, and Escape.") }
    ]}
    status="stable" title="Menu" useWhen={["Offering a compact list of actions for the current resource.", "A destructive command needs clear danger treatment."]}
  />;
}

export function DropdownPage() {
  return <ComponentDemoPage
    accessibility={["Dropdown preserves normal floating-content behavior and does not apply menu or listbox semantics."]}
    avoidWhen={["The content is an action list; use Menu.", "The content selects a form value; use Select."]}
    description="A thin generic composition over Popover for trigger-controlled floating content."
    importCode={'import { Dropdown } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components"
    props={[{ name: "trigger", type: "ReactNode", description: "Control that toggles the content." }, { name: "children", type: "ReactNode", description: "Generic floating content." }, { name: "open | defaultOpen", type: "boolean", description: "Controlled or initial visibility." }]}
    relatedComponents={[{ id: "popover", name: "Popover", description: "Underlying generic overlay primitive." }, { id: "menu", name: "Menu", description: "Action list semantics." }, { id: "select", name: "Select", description: "Native form selection." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("dropdown-basic", "Generic dropdown", `<Dropdown trigger={<Button>Account tools</Button>}><Stack gap="sm"><Text weight="strong">Workspace</Text><Button variant="secondary">Manage members</Button></Stack></Dropdown>`, overlayScope, 'import { Button, Dropdown, Stack, Text } from "@vyrnforge/ui-components";') },
      { id: "controlled-usage", label: "Controlled usage", title: "Controlled usage", children: live("dropdown-controlled", "Controlled dropdown", `function Example() { const [open, setOpen] = React.useState(false); return <Dropdown open={open} onOpenChange={setOpen} trigger={<Button>{open ? "Close" : "Open"} panel</Button>}><Button onClick={() => setOpen(false)}>Done</Button></Dropdown>; } render(<Example />);`, overlayScope, 'import { Button, Dropdown } from "@vyrnforge/ui-components";') }
    ]}
    status="stable" title="Dropdown" useWhen={["Composing small generic floating content without introducing new semantics."]}
  />;
}

export function TooltipPage() {
  return <ComponentDemoPage
    accessibility={["Tooltip opens on hover and keyboard focus, and connects the trigger through aria-describedby.", "Do not put interactive controls inside tooltip content. Wrap disabled controls with a focusable explanatory trigger when guidance is required."]}
    avoidWhen={["The user must interact with the content; use Popover.", "The description is essential enough to show permanently."]}
    description="Short non-interactive contextual description with delayed hover/focus activation and shared anchored positioning."
    importCode={'import { Tooltip } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components"
    props={[{ name: "content", type: "ReactNode", description: "Short non-interactive description." }, { name: "placement | delayMs", type: "placement | number", description: "Anchoring and opening delay." }, { name: "disabled", type: "boolean", description: "Disables tooltip behavior." }]}
    relatedComponents={[{ id: "icon-button", name: "IconButton", description: "Icon-only actions need an accessible label even with Tooltip." }, { id: "popover", name: "Popover", description: "Interactive contextual content." }]}
    sections={[
      { id: "basic-usage", label: "Hover and focus", title: "Hover and focus", children: live("tooltip-basic", "Helpful description", `<Tooltip content="Refresh the current data"><Button variant="secondary">Refresh</Button></Tooltip>`, overlayScope, 'import { Button, Tooltip } from "@vyrnforge/ui-components";') },
      { id: "placements", label: "Placement", title: "Placement", children: live("tooltip-placement", "Icon action accessibility", `<Tooltip content="Open filters" placement="right"><IconButton aria-label="Open filters"><Icon name="Filter" /></IconButton></Tooltip>`, overlayScope, 'import { Icon, IconButton, Tooltip } from "@vyrnforge/ui-components";') },
      { id: "states", label: "Disabled guidance", title: "Disabled guidance", children: live("tooltip-disabled", "Disabled-control guidance", `<Tooltip content="Export is unavailable until at least one row is selected"><span><Button disabled>Export</Button></span></Tooltip>`, overlayScope, 'import { Button, Tooltip } from "@vyrnforge/ui-components";') }
    ]}
    status="stable" title="Tooltip" useWhen={["Giving a compact explanation for a visible action, especially an icon-only action."]}
  />;
}

export function DialogPage() {
  return <ComponentDemoPage
    accessibility={["Dialog uses role=dialog, aria-modal, title and description relationships, trapped focus, and focus restoration.", "Use an initial focus ref for a safe first action in destructive or form workflows."]}
    avoidWhen={["A non-blocking message is enough; use InlineMessage or Alert.", "A side workflow is better represented as Drawer."]}
    description="Modal dialog with portal rendering, topmost Escape/outside dismissal, focus containment, restoration, and body scroll locking."
    importCode={'import { Dialog } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components"
    props={[{ name: "open | onOpenChange", type: "boolean | callback", description: "Application-owned visibility." }, { name: "title | description | footer", type: "ReactNode", description: "Accessible dialog structure." }, { name: "initialFocusRef", type: "RefObject", description: "Optional focus target on open." }, { name: "closeOnEscape | closeOnOverlayClick", type: "boolean", description: "Dismissal controls." }]}
    relatedComponents={[{ id: "confirm-dialog", name: "ConfirmDialog", description: "Standard confirmation composition." }, { id: "drawer", name: "Drawer", description: "Modal side or edge workflow." }]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("dialog-basic", "Basic dialog", `function Example() { const [open, setOpen] = React.useState(false); return <><Button onClick={() => setOpen(true)}>Open dialog</Button><Dialog open={open} onOpenChange={setOpen} title="Review changes" description="Confirm the update before continuing." footer={<Button onClick={() => setOpen(false)}>Close</Button>}>The body scrolls independently when needed.</Dialog></>; } render(<Example />);`, overlayScope, 'import { Button, Dialog } from "@vyrnforge/ui-components";') },
      { id: "long-content", label: "Long content", title: "Long content", children: live("dialog-long", "Scrollable dialog body", `function Example() { const [open, setOpen] = React.useState(false); return <><Button onClick={() => setOpen(true)}>Open long dialog</Button><Dialog open={open} onOpenChange={setOpen} title="Change history" footer={<Button onClick={() => setOpen(false)}>Done</Button>}><Stack gap="md">{Array.from({ length: 18 }, (_, index) => <Text key={index}>Audit event {index + 1}: a detailed operational change record.</Text>)}</Stack></Dialog></>; } render(<Example />);`, overlayScope, 'import { Button, Dialog, Stack, Text } from "@vyrnforge/ui-components";') },
      { id: "initial-focus", label: "Initial focus", title: "Initial focus", children: live("dialog-focus", "Initial focus", `function Example() { const [open, setOpen] = React.useState(false); const confirmRef = React.useRef(null); return <><Button onClick={() => setOpen(true)}>Delete project</Button><Dialog initialFocusRef={confirmRef} open={open} onOpenChange={setOpen} title="Delete project" description="This cannot be undone." footer={<Inline gap="sm"><Button onClick={() => setOpen(false)} variant="secondary">Cancel</Button><Button ref={confirmRef} onClick={() => setOpen(false)} variant="danger">Delete project</Button></Inline>}>Review the impact before confirming.</Dialog></>; } render(<Example />);`, overlayScope, 'import { Button, Dialog, Inline } from "@vyrnforge/ui-components";') }
    ]}
    status="stable" title="Dialog" useWhen={["Blocking a focused decision, review, or compact workflow.", "The app needs a dependable modal focus boundary."]}
  />;
}

export function DrawerPage() {
  return <ComponentDemoPage
    accessibility={["Drawer is modal by default and shares Dialog focus restoration and scroll locking.", "Its header and footer remain outside the independently scrolling body."]}
    avoidWhen={["A brief confirmation fits a Dialog or ConfirmDialog.", "The content does not need an overlay; use a normal page section."]}
    description="Viewport-safe modal edge panel for focused secondary workflows, with a scrollable body and fixed header/footer regions."
    importCode={'import { Drawer } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components"
    props={[{ name: "side", type: '"left" | "right" | "top" | "bottom"', description: "Viewport edge." }, { name: "modal", type: "boolean", defaultValue: "true", description: "Controls focus trapping and body scroll locking." }, { name: "footer", type: "ReactNode", description: "Visible action region outside the body scroll." }]}
    relatedComponents={[{ id: "dialog", name: "Dialog", description: "Centered modal workflow." }, { id: "confirm-dialog", name: "ConfirmDialog", description: "Confirmation composition." }]}
    sections={[
      { id: "basic-usage", label: "Right drawer", title: "Right drawer", children: live("drawer-right", "Right-side drawer", `function Example() { const [open, setOpen] = React.useState(false); return <><Button onClick={() => setOpen(true)}>Open drawer</Button><Drawer open={open} onOpenChange={setOpen} title="Edit member" footer={<Button onClick={() => setOpen(false)}>Save changes</Button>}><TextInput aria-label="Member name" defaultValue="Taylor Morgan" /></Drawer></>; } render(<Example />);`, overlayScope, 'import { Button, Drawer, TextInput } from "@vyrnforge/ui-components";') },
      { id: "states", label: "Sides and scrolling", title: "Sides and scrolling", children: live("drawer-long", "Left drawer with long body", `function Example() { const [open, setOpen] = React.useState(false); return <><Button onClick={() => setOpen(true)} variant="secondary">Open left drawer</Button><Drawer side="left" open={open} onOpenChange={setOpen} title="Activity" footer={<Button onClick={() => setOpen(false)}>Close</Button>}><Stack gap="md">{Array.from({ length: 20 }, (_, index) => <Text key={index}>Activity record {index + 1}</Text>)}</Stack></Drawer></>; } render(<Example />);`, overlayScope, 'import { Button, Drawer, Stack, Text } from "@vyrnforge/ui-components";') }
    ]}
    status="stable" title="Drawer" useWhen={["Editing or reviewing a secondary workflow while preserving page context."]}
  />;
}

export function ConfirmDialogPage() {
  return <ComponentDemoPage
    accessibility={["ConfirmDialog composes Dialog, so it inherits modal role, focus trap, restoration, portal, and scroll-lock behavior.", "Destructive confirmation copy should name the consequence clearly."]}
    avoidWhen={["The action is reversible or low impact; consider an inline action with feedback.", "The app needs a multi-step form; use Dialog or Drawer."]}
    description="Reusable Dialog composition for normal and destructive confirmation flows."
    importCode={'import { ConfirmDialog } from "@vyrnforge/ui-components";'} packageName="@vyrnforge/ui-components"
    props={[{ name: "title | description", type: "ReactNode", description: "Decision and impact text." }, { name: "variant", type: '"default" | "danger"', description: "Confirmation tone." }, { name: "loading | disabled", type: "boolean", description: "Temporarily disables confirmation actions." }, { name: "onConfirm | onCancel", type: "callback", description: "App-owned workflow callbacks." }]}
    relatedComponents={[{ id: "dialog", name: "Dialog", description: "General modal workflow." }, { id: "button", name: "Button", description: "Inline low-risk actions." }]}
    sections={[
      { id: "basic-usage", label: "Normal confirmation", title: "Normal confirmation", children: live("confirm-basic", "Archive confirmation", `function Example() { const [open, setOpen] = React.useState(false); return <><Button onClick={() => setOpen(true)}>Archive report</Button><ConfirmDialog open={open} onOpenChange={setOpen} onConfirm={() => setOpen(false)} title="Archive report" description="The report remains available in the archive." confirmLabel="Archive" /></>; } render(<Example />);`, overlayScope, 'import { Button, ConfirmDialog } from "@vyrnforge/ui-components";') },
      { id: "destructive", label: "Destructive", title: "Destructive", children: live("confirm-danger", "Destructive confirmation", `function Example() { const [open, setOpen] = React.useState(false); return <><Button onClick={() => setOpen(true)} variant="danger">Delete workspace</Button><ConfirmDialog open={open} onOpenChange={setOpen} onConfirm={() => setOpen(false)} title="Delete workspace" description="All members and records will lose access immediately." confirmLabel="Delete workspace" variant="danger" /></>; } render(<Example />);`, overlayScope, 'import { Button, ConfirmDialog } from "@vyrnforge/ui-components";') },
      { id: "loading", label: "Loading", title: "Loading", children: live("confirm-loading", "Loading confirmation", `function Example() { const [open, setOpen] = React.useState(false); const [loading, setLoading] = React.useState(false); return <><Button onClick={() => setOpen(true)}>Sync records</Button><ConfirmDialog loading={loading} open={open} onOpenChange={setOpen} onConfirm={() => { setLoading(true); setTimeout(() => { setLoading(false); setOpen(false); }, 900); }} title="Sync records" description="This may take a moment." confirmLabel="Start sync" /></>; } render(<Example />);`, overlayScope, 'import { Button, ConfirmDialog } from "@vyrnforge/ui-components";') }
    ]}
    status="stable" title="Confirm Dialog" useWhen={["A destructive or consequential action needs an explicit final decision."]}
  />;
}

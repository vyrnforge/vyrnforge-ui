import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { createLiveScope, LiveExample } from "../../components/live";

const scope = createLiveScope("Button", "ConfirmDialog", "Dialog", "Drawer", "Icon", "IconButton", "Menu", "Popover", "Stack", "Text", "Tooltip");

export function OverlayStressPage() {
  return <ComponentDemoPage
    accessibility={["Use this page with a keyboard to verify Escape affects only the topmost layer and modal Tab focus remains contained.", "The live example intentionally combines overlays; each remains responsible for its own labels and commands."]}
    description="A composed overlay exercise for portal, stack ordering, focus, scrolling, and sticky AppShell regression checks."
    importCode={'import { ConfirmDialog, Dialog, Drawer, Menu, Popover, Tooltip } from "@dravyn/ui-components";'}
    packageName="@dravyn/ui-components"
    props={[]}
    relatedComponents={[]}
    sections={[{
      id: "overlay-composition",
      label: "Overlay composition",
      title: "Overlay composition",
      children: <LiveExample
        description="Open the dialog, then its nested popover and confirmation. Close each layer with Escape. The drawer includes a keyboard-ready menu and a tooltip on its close action."
        id="overlay-stress"
        imports={'import { Button, ConfirmDialog, Dialog, Drawer, Icon, IconButton, Menu, Popover, Stack, Text, Tooltip } from "@dravyn/ui-components";'}
        initialCode={`function Example() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return <Stack gap="md">
    <Button onClick={() => setDialogOpen(true)}>Open dialog workflow</Button>
    <Button onClick={() => setDrawerOpen(true)} variant="secondary">Open drawer workflow</Button>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Review workflow">
      <Stack gap="md">
        <Text>Open the nested overlays, then press Escape one layer at a time.</Text>
        <Popover trigger={<Button variant="secondary">Open nested popover</Button>}>
          <Stack gap="sm"><Text>Nested popover content</Text><Button onClick={() => setConfirmOpen(true)} variant="danger">Open confirmation</Button></Stack>
        </Popover>
      </Stack>
    </Dialog>
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Drawer workflow" footer={<Tooltip content="Close this drawer"><IconButton aria-label="Close drawer" onClick={() => setDrawerOpen(false)}><Icon name="Close" /></IconButton></Tooltip>}>
      <Stack gap="md">
        <Menu trigger={<Button>Drawer menu</Button>} items={[{ id: "edit", label: "Edit" }, { id: "managed", label: "Managed", disabled: true }, { id: "remove", label: "Remove", danger: true }]} />
        {Array.from({ length: 12 }, (_, index) => <Text key={index}>Scrollable drawer content {index + 1}</Text>)}
      </Stack>
    </Drawer>
    <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={() => setConfirmOpen(false)} title="Confirm nested action" description="This confirmation is above the dialog and nested popover." variant="danger" />
  </Stack>;
}

render(<Example />);`}
        scope={scope}
        title="Nested overlay stress test"
      />
    }]}
    status="experimental"
    title="Overlay Stress Test"
    useWhen={["Checking nested overlay behavior while evolving shared focus and portal internals."]}
  />;
}

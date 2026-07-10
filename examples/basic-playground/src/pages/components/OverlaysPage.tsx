import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  Dialog,
  Drawer,
  Dropdown,
  Field,
  Heading,
  Icon,
  Inline,
  Menu,
  Popover,
  Section,
  Stack,
  Text,
  TextInput,
  Tooltip
} from "@dravyn/ui-components";

export function OverlaysPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  return (
    <div className="dv-playground-page-stack">
      <Section
        title="Popover, menu, dropdown, and tooltip"
        description="Small anchored overlays use native events and CSS positioning."
      >
        <Inline gap="md">
          <Popover
            trigger={<Button leftSlot={<Icon name="Plus" />} variant="primary">Open popover</Button>}
            placement="bottom-start"
          >
            <div className="dv-playground-overlay-demo-panel">
              <Heading size="sm">Popover content</Heading>
              <Text tone="muted">Useful for simple forms, help panels, and previews.</Text>
              <Field htmlFor="popover-name" label="View name">
                <TextInput id="popover-name" defaultValue="Quarterly review" />
              </Field>
            </div>
          </Popover>

          <Menu
            trigger={<Button leftSlot={<Icon name="MoreHorizontal" />} variant="subtle">Open menu</Button>}
            items={[
              { id: "rename", label: "Rename", shortcut: "R" },
              { id: "duplicate", label: "Duplicate", description: "Create a copy" },
              { id: "disabled", label: "Disabled item", disabled: true },
              { id: "delete", label: "Delete", danger: true, shortcut: "Del" }
            ]}
          />

          <Dropdown trigger={<Button leftSlot={<Icon name="ChevronDown" />} variant="subtle">Dropdown</Button>}>
            <Stack gap="sm">
              <Text tone="strong">Scoped actions</Text>
              <Text tone="muted">Dropdown is a light Popover wrapper for custom content.</Text>
              <Button leftSlot={<Icon name="Check" />} size="sm" variant="primary">Apply</Button>
            </Stack>
          </Dropdown>

          <Tooltip content="Tooltip appears on hover and focus.">
            <Button variant="ghost">Hover or focus</Button>
          </Tooltip>
        </Inline>
      </Section>

      <Section
        title="Dialog, drawer, and confirmation"
        description="Modal overlays include Escape and overlay-close behavior without a focus-trap dependency."
      >
        <Inline gap="md">
          <Button leftSlot={<Icon name="Edit" />} variant="primary" onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Button leftSlot={<Icon name="Settings" />} variant="subtle" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Button leftSlot={<Icon name="Check" />} variant="subtle" onClick={() => setConfirmOpen(true)}>Confirm</Button>
          <Button leftSlot={<Icon name="Delete" />} variant="danger" onClick={() => setDangerOpen(true)}>Danger confirm</Button>
        </Inline>
      </Section>

      <section className="dv-playground-grid two">
        <div className="dv-playground-card" data-theme="dark">
          <Heading size="sm">Dark theme overlays</Heading>
          <Inline>
            <Popover trigger={<Button leftSlot={<Icon name="Info" />} variant="primary">Dark popover</Button>}>
              <div className="dv-playground-overlay-demo-panel">
                <Text tone="strong">Dark scoped popover</Text>
                <Text tone="muted">The overlay inherits dv tokens from the scoped theme.</Text>
              </div>
            </Popover>
            <Tooltip content="Dark tooltip">
              <Button variant="subtle">Tooltip</Button>
            </Tooltip>
          </Inline>
        </div>

        <div className="dv-playground-card" data-theme="enterprise">
          <Heading size="sm">Enterprise theme overlays</Heading>
          <Menu
            trigger={<Button leftSlot={<Icon name="MoreHorizontal" />} variant="primary">Enterprise menu</Button>}
            items={[
              { id: "audit", label: "Open audit log" },
              { id: "export", label: "Export preview" },
              { id: "archive", label: "Archive", danger: true }
            ]}
          />
        </div>
      </section>

      <Dialog
        description="Dialogs are for focused decisions or short workflows."
        footer={
          <Inline justify="end">
            <Button variant="subtle" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button leftSlot={<Icon name="Check" />} variant="primary" onClick={() => setDialogOpen(false)}>Save</Button>
          </Inline>
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Edit saved view"
      >
        <Field htmlFor="dialog-name" label="Name">
          <TextInput id="dialog-name" defaultValue="Executive overview" />
        </Field>
      </Dialog>

      <Drawer
        description="Drawers support side panels for settings, filters, or detail previews."
        footer={
          <Inline justify="end">
            <Button variant="subtle" onClick={() => setDrawerOpen(false)}>Close</Button>
            <Button leftSlot={<Icon name="Check" />} variant="primary" onClick={() => setDrawerOpen(false)}>Apply</Button>
          </Inline>
        }
        onOpenChange={setDrawerOpen}
        open={drawerOpen}
        title="Advanced filters"
      >
        <Stack gap="md">
          <Field htmlFor="drawer-owner" label="Owner">
            <TextInput id="drawer-owner" defaultValue="Platform" />
          </Field>
          <Field htmlFor="drawer-status" label="Status">
            <TextInput id="drawer-status" defaultValue="Active" />
          </Field>
        </Stack>
      </Drawer>

      <ConfirmDialog
        confirmLabel="Continue"
        description="This confirms the workflow and closes the current review."
        onConfirm={() => setConfirmOpen(false)}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Complete review?"
      />

      <ConfirmDialog
        confirmLabel="Delete view"
        description="This action removes the saved view for everyone in the workspace."
        onConfirm={() => setDangerOpen(false)}
        onOpenChange={setDangerOpen}
        open={dangerOpen}
        title="Delete saved view?"
        variant="danger"
      />
    </div>
  );
}

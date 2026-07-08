# @dravyn/ui-components

Native-first Dravyn UI component primitives built with React, TypeScript, and CSS variables.

## Install

```bash
npm install @dravyn/ui-core @dravyn/ui-components
```

Import core tokens first, then component styles:

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
```

`@dravyn/ui-components` consumes shared `--dv-*` variables from `@dravyn/ui-core`, so light, dark, enterprise, density, and scoped token overrides flow through the primitives.

## Components

- Actions: `Button`, `IconButton`, `ToolbarButton`, `ButtonGroup`, `SegmentedControl`
- Icons: `Icon`, `CloseButton`, `ClearButton`, `RefreshButton`, `MoreButton`
- Typography: `Heading`, `Text`, `Label`, `Caption`, `CodeText`
- Feedback: `Badge`, `StatusBadge`, `EmptyState`, `ErrorState`, `LoadingState`, `Skeleton`, `InlineMessage`, `Alert`
- Forms: `Field`, `TextInput`, `SearchInput`, `Select`, `Checkbox`, `Textarea`, `ValidationMessage`
- Layout: `Card`, `Panel`, `Stack`, `Inline`, `Section`
- Overlays: `Popover`, `Menu`, `Dropdown`, `Tooltip`, `Dialog`, `Drawer`, `ConfirmDialog`

## Examples

```tsx
import {
  Badge,
  Button,
  Card,
  Field,
  Stack,
  TextInput
} from "@dravyn/ui-components";

export function Example() {
  return (
    <Card variant="bordered" padding="md">
      <Stack gap="md">
        <Badge variant="success">Active</Badge>
        <Field label="Name" htmlFor="name" required>
          <TextInput id="name" defaultValue="Dravyn" />
        </Field>
        <Button variant="primary" leftSlot="+">
          Save
        </Button>
      </Stack>
    </Card>
  );
}
```

Button states:

```tsx
<Button variant="primary" loading>
  Saving
</Button>

<Button fullWidth variant="subtle">
  Full width
</Button>
```

Icons and action controls:

```tsx
import {
  ButtonGroup,
  Icon,
  IconButton,
  SegmentedControl,
  ToolbarButton
} from "@dravyn/ui-components";

<Icon name="Search" title="Search" decorative={false} />

<IconButton aria-label="Refresh" tooltip="Refresh">
  <Icon name="Refresh" />
</IconButton>

<ToolbarButton
  icon={<Icon name="Filter" />}
  label="Filters"
  active
  tooltip="Filters active"
/>

<ButtonGroup attached size="sm">
  <ToolbarButton icon={<Icon name="Refresh" />} label="Refresh" />
  <ToolbarButton icon={<Icon name="Columns" />} label="Columns" />
</ButtonGroup>

<SegmentedControl
  aria-label="Density"
  value={density}
  onChange={setDensity}
  options={[
    { value: "compact", label: "Compact", icon: <Icon name="Minus" /> },
    { value: "standard", label: "Standard", icon: <Icon name="Columns" /> },
    { value: "comfortable", label: "Comfort", icon: <Icon name="Plus" /> }
  ]}
/>
```

Form validation:

```tsx
<Field label="Email" htmlFor="email" error="Email is required">
  <TextInput id="email" invalid />
</Field>
```

Layout:

```tsx
<Section title="Workspace" actions={<Button>New</Button>}>
  <Panel title="Settings">
    <Inline gap="sm">
      <Button variant="primary">Save</Button>
      <Button variant="subtle">Cancel</Button>
    </Inline>
  </Panel>
</Section>
```

Overlays:

```tsx
<Popover trigger={<Button>Open</Button>}>
  <Card padding="md">Popover content</Card>
</Popover>

<Menu
  trigger={<Button>Actions</Button>}
  items={[
    { id: "rename", label: "Rename" },
    { id: "delete", label: "Delete", danger: true }
  ]}
/>

<Tooltip content="Short contextual help">
  <Button variant="ghost">Hover or focus</Button>
</Tooltip>
```

Dialog and drawer:

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Edit view"
  description="Update the saved view name."
  footer={<Button onClick={() => setOpen(false)}>Done</Button>}
>
  <Field label="Name" htmlFor="view-name">
    <TextInput id="view-name" />
  </Field>
</Dialog>

<Drawer
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  title="Advanced filters"
>
  Drawer content
</Drawer>

<ConfirmDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Delete saved view?"
  confirmLabel="Delete"
  variant="danger"
  onConfirm={handleDelete}
/>
```

## Accessibility Notes

- Native controls remain native `button`, `input`, `select`, `textarea`, and `label` elements.
- `IconButton` requires `aria-label` in its TypeScript props.
- Every icon-only control must have an accessible label. Prefer `tooltip` for repeated utility actions.
- `Button loading` sets `aria-busy` and disables the button.
- `Field` supports `htmlFor`, `required`, descriptions, and accessible error text.
- `ErrorState` and danger validation messages use alert roles.
- `Skeleton` disables animation when `animated={false}` and respects `prefers-reduced-motion`.
- `Tooltip` uses `role="tooltip"` and opens on hover or focus.
- `Dialog` and `Drawer` use `role="dialog"`, `aria-modal`, labelled title/description ids, Escape close, overlay click close, and basic focus return.
- `Popover`, `Menu`, and `Dropdown` support controlled and uncontrolled open state.

## Current Overlay Limitations

- Positioning is CSS-based with no complex collision detection.
- Menu does not support nested menus yet.
- Dialog and Drawer use basic focus handling, not a full focus-trap library.
- Overlays do not use portals yet.

## UX Guidance

- Use text `Button` for primary business actions such as Save, Submit, or Create.
- Use `IconButton` for repeated utility actions such as refresh, close, more, or clear.
- Use `ToolbarButton` when an action appears inside a dense toolbar and may need icon plus text.
- Use `SegmentedControl` for small mutually exclusive modes such as density, view type, or theme preview.
- Do not hide destructive actions behind unlabeled icons.

## Dependency Policy

This package is intentionally dependency-minimal. Do not add MUI, Radix, Headless UI, TanStack, Redux, Tailwind, styled-components, Emotion, icon libraries, CSS frameworks, or new runtime dependencies without review.

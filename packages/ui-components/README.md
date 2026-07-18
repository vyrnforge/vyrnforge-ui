# @vyrnforge/ui-components

Native-first VyrnForge UI component primitives built with React, TypeScript, and CSS variables.

## Install

VyrnForge UI is pre-alpha. The `0.1.0-alpha.0` candidate is prepared for the
first controlled alpha, but has not been published for public npm installation
and is not ready for production use. The intended install shape is:

```bash
npm install @vyrnforge/ui-core @vyrnforge/ui-components
```

Public package entry points are prepared for the first approved alpha:

```ts
import { Button } from "@vyrnforge/ui-components";
import "@vyrnforge/ui-components/styles/index.css";
```

The package is built from `dist` output. Public exports do not point at internal `src` files. React and ReactDOM are peer dependencies and are not bundled as duplicate runtimes.

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Source inspection, local evaluation, and temporary non-production prototypes are permitted. Production use, commercial use, redistribution, package republication, resale, sublicensing, white-labeling, and competing-library use require separate written permission or a separate written commercial license. Package metadata uses `SEE LICENSE IN LICENSE`, and the npm artifact includes a package-local LICENSE that matches the repository root license.

Import core tokens first, then component styles:

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

`@vyrnforge/ui-components` consumes shared `--vf-*` variables from `@vyrnforge/ui-core`, so light, dark, enterprise, density, and scoped token overrides flow through the primitives.

`@vyrnforge/ui-components` owns reusable UI primitives only. It does not own app business state, backend data, grid behavior, or a global store.

## Components

- Actions: `Button`, `IconButton`, `ToolbarButton`, `ButtonGroup`, `SegmentedControl`, `ToggleButton`, `ToggleButtonGroup`
- Icons: `Icon`, `CloseButton`, `ClearButton`, `RefreshButton`, `MoreButton`
- Typography: `Heading`, `Text`, `Label`, `Caption`, `CodeText`
- Feedback: `Badge`, `StatusBadge`, `ToastProvider`, `ToastAction`, `useToast`, `EmptyState`, `ErrorState`, `LoadingState`, `Skeleton`, `InlineMessage`, `Alert`
- Forms: `Field`, `TextInput`, `SearchInput`, `Select`, `Autocomplete`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `NumberInput`, `DateInput`, `DateTimeInput`, `Rating`, `Slider`, `MultiSelect`, `Textarea`, `ValidationMessage`
- Data management: `TransferList`
- Layout: `Card`, `Panel`, `Stack`, `Inline`, `Section`, `AppShell`, `Page`, `PageHeader`, `PageToolbar`
- Navigation: `SideNav`, `TopNav`, `Breadcrumbs`, `Tabs`
- Overlays: `Popover`, `Menu`, `Dropdown`, `Tooltip`, `Dialog`, `Drawer`, `ConfirmDialog`

## Maturity

`docs/metadata/component-status.json` is the canonical maturity index. The
action aliases `CloseButton`, `ClearButton`, `RefreshButton`, and `MoreButton`
are stable convenience wrappers. `Toast`, `ToastProvider`, `ToastAction`, and
`useToast` are experimental. `ToastProvider` owns its internal viewport; do
not import `ToastViewport` as an application API.

## Examples

```tsx
import {
  Badge,
  Button,
  Card,
  Field,
  Stack,
  TextInput
} from "@vyrnforge/ui-components";

export function Example() {
  return (
    <Card variant="bordered" padding="md">
      <Stack gap="md">
        <Badge variant="success">Active</Badge>
        <Field label="Name" htmlFor="name" required>
          <TextInput id="name" defaultValue="VyrnForge" />
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
} from "@vyrnforge/ui-components";

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
<Field id="email" label="Email" error="Email is required" required>
  {(controlProps) => <TextInput {...controlProps} />}
</Field>
```

Choice and scheduling inputs:

```tsx
<RadioGroup
  label="Billing cycle"
  value={cycle}
  onValueChange={setCycle}
  options={[
    { value: "monthly", label: "Monthly" },
    { value: "annual", label: "Annual" }
  ]}
/>

<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
  label="Enable workflow alerts"
/>

<NumberInput mode="integer" min={0} max={100} defaultValue={50} />
<NumberInput mode="decimal" min={0} max={100} step={0.01} defaultValue={12.5} />
<DateInput defaultValue="2026-07-10" />
<DateTimeInput defaultValue="2026-07-10T09:30" />

<MultiSelect
  value={roles}
  onValueChange={setRoles}
  options={roleOptions}
  searchable
/>
```

Native selection controls:

```tsx
<Rating label="Quality score" defaultValue={4} />
<Slider ariaLabel="Approval threshold" defaultValue={65} showValue />

<ToggleButton defaultPressed>Pin column</ToggleButton>
<ToggleButtonGroup ariaLabel="View mode" defaultValue="table">
  <ToggleButton value="table">Table</ToggleButton>
  <ToggleButton value="board">Board</ToggleButton>
</ToggleButtonGroup>
```

Use `Switch` for a persistent setting, `ToggleButton` for an active tool or view action, `SegmentedControl` for a small stable exclusive set, `RadioGroup` for spacious form choices, and `Checkbox` for an independent Boolean value.

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

App shell and navigation:

```tsx
import {
  AppShell,
  Breadcrumbs,
  Page,
  PageHeader,
  PageToolbar,
  SearchInput,
  SideNav,
  Tabs,
  TopNav
} from "@vyrnforge/ui-components";

<AppShell
  header={<TopNav brand="Operations" />}
  headerPosition="sticky"
  scrollMode="content"
  sidebar={<SideNav activeId="orders" items={navItems} />}
  sidebarPosition="sticky"
>
  <Page toolbar={<PageToolbar left={<SearchInput aria-label="Search orders" />} />}>
    <PageHeader
      breadcrumbs={<Breadcrumbs items={breadcrumbs} />}
      title="Orders"
    />
    <Tabs defaultValue="open" items={tabs} />
  </Page>
</AppShell>
```

`AppShell` layout modes:

- `scrollMode="page"`: document scrolls normally; useful for simple pages.
- `scrollMode="content"`: shell fills the viewport and main content scrolls; useful for docs, admin apps, and persistent navigation.
- `scrollMode="split"`: shell fills the viewport while sidebar and content are independent scroll containers; useful for workspaces.

Prefer `AppShell` props for persistent header/sidebar behavior. Do not fix navigation persistence with one-off app CSS when `scrollMode`, `headerPosition`, or `sidebarPosition` can express the layout.

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
- `Field` supplies stable control and description ids through its render-function child. Static children remain supported with `htmlFor` plus a matching child control id; `Field` does not clone arbitrary controls.
- `ErrorState` and danger validation messages use alert roles.
- `Skeleton` disables animation when `animated={false}` and respects `prefers-reduced-motion`.
- `Tooltip` uses `role="tooltip"`, opens on hover or focus, and stays non-interactive.
- `Dialog` and modal `Drawer` use portals, `role="dialog"`, `aria-modal`, labelled title/description ids, focus containment, focus restoration, Escape/outside dismissal, and nested-safe body scroll locking.
- `Popover`, `Menu`, and `Dropdown` support controlled and uncontrolled open state through shared portal, dismissal, and anchored positioning behavior. Popover remains non-modal unless `modal` is explicitly enabled.
- `Tabs` supports controlled and uncontrolled selection, tab roles, and arrow/Home/End keyboard navigation.
- `Breadcrumbs` marks the current item with `aria-current="page"`.
- `SideNav` exposes active navigation with `aria-current`; app routing remains outside the component.

## Current Overlay Limitations

- Anchored overlays use fixed portal positioning with viewport shifting, basic flipping, and scroll/resize updates; this is intentionally smaller than a general positioning engine.
- Menu does not support nested menus yet.

## UX Guidance

- Use text `Button` for primary business actions such as Save, Submit, or Create.
- Use `IconButton` for repeated utility actions such as refresh, close, more, or clear.
- Use `ToolbarButton` when an action appears inside a dense toolbar and may need icon plus text.
- Use `SegmentedControl` for small mutually exclusive modes such as density, view type, or theme preview.
- Do not hide destructive actions behind unlabeled icons.

## Styling Architecture Rules

- `ui-core` owns shared `--vf-*` tokens for color, surfaces, spacing, radius, shadows, typography, focus, and density.
- `ui-components` owns reusable component styles through `vf-*` classes such as `vf-button`, `vf-icon-button`, `vf-input`, `vf-badge`, `vf-popover`, and `vf-dialog`.
- TSX should define structure, behavior, accessibility, state classes, and dynamic CSS variables only.
- CSS owns static visual styling such as colors, spacing, borders, radius, shadows, typography, hover/focus/active/disabled states, themes, and density.
- Use CSS variables for customization. Prefer scoped token overrides over editing package CSS directly.
- Use `className` for structural extension and `style` only for instance-level overrides or dynamic runtime values.
- Keep data-grid-specific styling in `@vyrnforge/ui-data-grid` with `udg-*` classes mapped to shared `vf-*` tokens.
- Shared interaction hooks live under `src/hooks/` when they are React-specific to components.

## Dependency Policy

This package is intentionally dependency-minimal. Do not add MUI, Radix, Headless UI, TanStack, Redux, Tailwind, styled-components, Emotion, icon libraries, CSS frameworks, or new runtime dependencies without review.

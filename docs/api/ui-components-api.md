# @vyrnforge/ui-components API

`@vyrnforge/ui-components` provides native-first React primitives and application components.

## CSS Import

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

## General Rules

- Prefer these components before building raw custom controls.
- Use component props first, CSS variables second, scoped `className` extensions last.
- Do not depend on undocumented internal classes.
- Icon-only controls must have an accessible name.

## Actions

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Button` | Text action control. | `import { Button } from "@vyrnforge/ui-components";`<br>`<Button variant="primary">Save</Button>` | `variant`, `size`, `loading`, `disabled`, `fullWidth` | Use visible text for important actions. | Use for business actions. Avoid for icon-only repeated utility controls. |
| `IconButton` | Compact icon-only action. | `import { IconButton, Icon } from "@vyrnforge/ui-components";`<br>`<IconButton aria-label="Refresh"><Icon name="Refresh" /></IconButton>` | `variant`, `size`, `disabled` | Always provide `aria-label`. | Use for utility actions. Avoid for primary business actions without text. |
| `CloseButton` / `ClearButton` / `RefreshButton` / `MoreButton` | Stable IconButton convenience wrappers. | `import { CloseButton } from "@vyrnforge/ui-components";`<br>`<CloseButton aria-label="Close" />` | IconButton props | Every wrapper still needs an accessible name. | Use for the matching familiar utility action. Avoid as a substitute for labelled business actions. |
| `ToolbarButton` | Dense toolbar command with optional icon and label. | `import { ToolbarButton, Icon } from "@vyrnforge/ui-components";`<br>`<ToolbarButton icon={<Icon name="Filter" />} label="Filters" />` | `icon`, `label`, `size`, `pressed` | Label should remain meaningful in compact UI. | Use in repeated toolbars. Avoid as a page-level primary action. |
| `ButtonGroup` | Groups related buttons. | `import { ButtonGroup, Button } from "@vyrnforge/ui-components";`<br>`<ButtonGroup><Button>One</Button><Button>Two</Button></ButtonGroup>` | `children` | Keep grouped actions related. | Use for adjacent related controls. Avoid for unrelated actions. |
| `SegmentedControl` | Mutually exclusive mode selector. | `import { SegmentedControl } from "@vyrnforge/ui-components";`<br>`<SegmentedControl value="list" options={[{ label: "List", value: "list" }]} onChange={setValue} />` | `value`, `options`, `onChange`, `size` | Options need clear labels. | Use for small mode sets. Avoid for long option lists. |
| `ToggleButton` | Pressable tool, formatting, or view action. | `import { ToggleButton } from "@vyrnforge/ui-components";`<br>`<ToggleButton defaultPressed>Pin column</ToggleButton>` | `pressed`, `defaultPressed`, `onPressedChange`, `icon`, `variant`, `size` | Native button with `aria-pressed`; icon-only controls need `aria-label`. | Use for a temporary tool or mode. Avoid persistent settings; use `Switch`. |
| `ToggleButtonGroup` | Joined exclusive or multiple tool choices. | `import { ToggleButton, ToggleButtonGroup } from "@vyrnforge/ui-components";`<br>`<ToggleButtonGroup defaultValue="table"><ToggleButton value="table">Table</ToggleButton></ToggleButtonGroup>` | `type`, `value`, `defaultValue`, `onValueChange`, `orientation`, `disabled` | Keeps child ToggleButtons native and supports arrow-key focus movement. | Use for related compact tools/modes. Avoid arbitrary children or long form choices. |
| `ToggleButton` | Pressable tool, formatting, or view action. | `import { ToggleButton } from "@vyrnforge/ui-components";`<br>`<ToggleButton defaultPressed>Pin column</ToggleButton>` | `pressed`, `defaultPressed`, `onPressedChange`, `icon`, `variant`, `size` | Native button with `aria-pressed`; icon-only controls need `aria-label`. | Use for a temporary tool or mode. Avoid persistent settings; use `Switch`. |
| `ToggleButtonGroup` | Joined exclusive or multiple tool choices. | `import { ToggleButton, ToggleButtonGroup } from "@vyrnforge/ui-components";`<br>`<ToggleButtonGroup defaultValue="table"><ToggleButton value="table">Table</ToggleButton></ToggleButtonGroup>` | `type`, `value`, `defaultValue`, `onValueChange`, `orientation`, `disabled` | Keeps child ToggleButtons native and supports arrow-key focus movement. | Use for related compact tools/modes. Avoid arbitrary children or long form choices. |
| `Icon` | Shared inline symbol. | `import { Icon } from "@vyrnforge/ui-components";`<br>`<Icon name="Search" />` | `name`, `size`, `aria-hidden` | Decorative icons should be hidden from assistive tech. | Use inside controls or status text. Avoid replacing text with icons alone. |

## Typography

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Text` | Body text. | `import { Text } from "@vyrnforge/ui-components";`<br>`<Text tone="muted">Updated now</Text>` | `tone`, `size`, `as` | Keep semantic element appropriate. | Use for readable body copy. Avoid custom paragraph classes for common text. |
| `Heading` | Section heading. | `import { Heading } from "@vyrnforge/ui-components";`<br>`<Heading level={2}>Orders</Heading>` | `level`, `size` | Preserve heading order. | Use for page and section titles. Avoid skipping levels for visual size only. |
| `Label` | Form or data label text. | `import { Label } from "@vyrnforge/ui-components";`<br>`<Label htmlFor="name">Name</Label>` | native label props | Associate with controls when possible. | Use for form labels. Avoid as decorative text. |
| `Caption` | Small supporting text. | `import { Caption } from "@vyrnforge/ui-components";`<br>`<Caption>Optional</Caption>` | `children` | Do not use as the only label for required info. | Use for minor metadata. Avoid for primary content. |
| `CodeText` | Inline code-like text. | `import { CodeText } from "@vyrnforge/ui-components";`<br>`<CodeText>--vf-primary</CodeText>` | `children` | Keep code readable in context. | Use for tokens, package names, and snippets. Avoid large blocks. |

## Forms

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Field` | Label, description, and validation composition. | `import { Field, TextInput } from "@vyrnforge/ui-components";`<br>`<Field id="name" label="Name">{(controlProps) => <TextInput {...controlProps} />}</Field>` | `id`, `htmlFor`, `label`, `description`, `error`, `warning`, `success`, `required`, `disabled`, `orientation` | The render function receives a stable id plus `aria-describedby`, `aria-invalid`, `aria-required`, `required`, and `disabled`. Static children remain compatible through `htmlFor` plus a matching control id. | Use around standard form controls. Avoid assuming Field mutates arbitrary children. |
| `TextInput` | Native text input. | `import { TextInput } from "@vyrnforge/ui-components";`<br>`<TextInput value={name} onChange={...} />` | native input props, `size`, `invalid` | Provide a label through `Field` or ARIA. | Use for short text. Avoid for search-specific inputs. |
| `SearchInput` | Native search input with search affordance. | `import { SearchInput } from "@vyrnforge/ui-components";`<br>`<SearchInput aria-label="Search orders" />` | native input props, `size`, `invalid` | Provide visible or ARIA label. | Use for filtering/search. Avoid for generic text entry. |
| `Select` | Native select. | `import { Select } from "@vyrnforge/ui-components";`<br>`<Select options={[{ label: "Open", value: "open" }]} />` | `options`, native select props, `size`, `invalid` | Label the select and keep options concise. | Use for small option sets. Avoid for custom combobox behavior. |
| `Autocomplete` | Experimental searchable single-value combobox. | `import { Autocomplete } from "@vyrnforge/ui-components";`<br>`<Autocomplete options={options} placeholder="Select an owner" />` | `options`, `value`, `inputValue`, `open`, callbacks, `filterOptions`, `renderOption`, `loading` | Uses combobox/listbox roles and keeps focus on the input with `aria-activedescendant`. | Use for larger known option sets. Avoid for small stable sets, free text, and multi-value selection. |
| `TransferList` | Experimental dual-list assignment component for moderate known collections. | `import { TransferList } from "@vyrnforge/ui-components";`<br>`<TransferList options={options} value={assigned} onValueChange={setAssigned} />` | `options`, `value`, `defaultValue`, `onValueChange`, `searchable`, `filterOptions`, `renderOption`, `name` | Uses labelled groups, native checkboxes, and native buttons; submitted values use repeated hidden inputs when `name` is provided. | Use for bounded reversible assignment. Avoid for large/server-managed resources, complex IAM catalogs, hierarchy, and approval/audit workflows. |
| `Checkbox` | Boolean input. | `import { Checkbox } from "@vyrnforge/ui-components";`<br>`<Checkbox label="Active" checked={active} onChange={...} />` | `checked`, `defaultChecked`, `label`, native props | Label must describe the state. | Use for binary settings. Avoid for mutually exclusive groups. |
| `Radio` | Native radio input. | `import { Radio } from "@vyrnforge/ui-components";`<br>`<Radio name="cycle" value="monthly" label="Monthly" />` | native radio props, `label`, `description`, `invalid` | Provide label or ARIA label; group related radios. | Use for custom single-choice groups. Prefer `RadioGroup` for standard groups. |
| `RadioGroup` | Fieldset-based radio group. | `import { RadioGroup } from "@vyrnforge/ui-components";`<br>`<RadioGroup label="Cycle" value={cycle} onValueChange={setCycle} options={options} />` | `value`, `defaultValue`, `onValueChange`, `options`, `orientation`, `error` | Uses `fieldset`/`legend` and native radio keyboard behavior. | Use for mutually exclusive choice sets. Avoid for long lists. |
| `Switch` | On/off setting toggle. | `import { Switch } from "@vyrnforge/ui-components";`<br>`<Switch checked={enabled} onCheckedChange={setEnabled} label="Enabled" />` | `checked`, `defaultChecked`, `onCheckedChange`, native `onChange`, `label`, `description` | Uses native checkbox with `role="switch"`. | Use for immediate settings. Avoid for acknowledgements; use `Checkbox`. |
| `NumberInput` | Native number input with integer/decimal typing modes. | `import { NumberInput } from "@vyrnforge/ui-components";`<br>`<NumberInput mode="integer" min={0} max={100} />`<br>`<NumberInput mode="decimal" step={0.01} />` | native number props, `mode`, `invalid`, `size` | Label constraints and validation. | Use for numeric values. Avoid custom spinner UI. |
| `DateInput` | Native date input. | `import { DateInput } from "@vyrnforge/ui-components";`<br>`<DateInput defaultValue="2026-07-10" />` | native date props, `invalid`, `size` | Label date meaning and format context. | Use simple dates. Avoid complex date picker needs. |
| `DateTimeInput` | Native local date-time input. | `import { DateTimeInput } from "@vyrnforge/ui-components";`<br>`<DateTimeInput defaultValue="2026-07-10T09:30" />` | native datetime-local props, `invalid`, `size` | Explain timezone context where needed. | Use simple local date/time values. Avoid timezone-heavy scheduling. |
| `Rating` | Discrete whole-number rating. | `import { Rating } from "@vyrnforge/ui-components";`<br>`<Rating label="Quality" defaultValue={4} />` | `value`, `defaultValue`, `onValueChange`, `max`, `allowClear`, `readOnly` | Editable mode uses labelled native radio inputs; read-only mode is not editable. | Use for small qualitative scores. Avoid continuous ranges; use `Slider`. |
| `Slider` | Native bounded numeric range. | `import { Slider } from "@vyrnforge/ui-components";`<br>`<Slider ariaLabel="Threshold" defaultValue={65} showValue />` | `value`, `defaultValue`, `onValueChange`, `min`, `max`, `step`, `showValue` | Native range retains keyboard behavior; provide a Field label or `ariaLabel`. | Use for bounded numeric settings. Avoid direct formatted numeric entry; use `NumberInput`. |
| `Rating` | Discrete whole-number rating. | `import { Rating } from "@vyrnforge/ui-components";`<br>`<Rating label="Quality" defaultValue={4} />` | `value`, `defaultValue`, `onValueChange`, `max`, `allowClear`, `readOnly` | Editable mode uses labelled native radio inputs; read-only mode is not editable. | Use for small qualitative scores. Avoid continuous ranges; use `Slider`. |
| `Slider` | Native bounded numeric range. | `import { Slider } from "@vyrnforge/ui-components";`<br>`<Slider ariaLabel="Threshold" defaultValue={65} showValue />` | `value`, `defaultValue`, `onValueChange`, `min`, `max`, `step`, `showValue` | Native range retains keyboard behavior; provide a Field label or `ariaLabel`. | Use for bounded numeric settings. Avoid direct formatted numeric entry; use `NumberInput`. |
| `MultiSelect` | Simple multi-value selector with chips. | `import { MultiSelect } from "@vyrnforge/ui-components";`<br>`<MultiSelect value={roles} onValueChange={setRoles} options={options} searchable />` | `value`, `defaultValue`, `onValueChange`, `options`, `searchable`, `clearable` | Keep option labels clear; keyboard support is basic. | Use for small multi-choice sets. Avoid async/virtualized/creatable lists. |
| `ValidationMessage` | Inline validation/supporting message. | `import { ValidationMessage } from "@vyrnforge/ui-components";`<br>`<ValidationMessage tone="error">Required</ValidationMessage>` | `tone="error" | "warning" | "success" | "info"`, `id`, `role`, native div props | Error tone uses alert semantics; non-error tones are noninterrupting and can be referenced by `aria-describedby`. | Use for custom field feedback. Prefer `Field error` for standard field errors. |
| `Textarea` | Multi-line text input. | `import { Textarea } from "@vyrnforge/ui-components";`<br>`<Textarea rows={4} />` | native textarea props, `size`, `invalid` | Provide a label and validation message. | Use for longer text. Avoid for single-line values. |

## Choice Guidance

- `Switch`: persistent enabled/disabled setting.
- `ToggleButton`: active tool, formatting option, or view action.
- `ToggleButtonGroup`: related compact tool or mode choices.
- `SegmentedControl`: one small, stable choice set that stays continuously visible.
- `RadioGroup`: form choices that need room for labels and descriptions.
- `Checkbox`: an independent Boolean form value.
- `Autocomplete`: one known value from a larger searchable option set; do not treat it as SearchInput or MultiSelect.
- `TransferList`: a bounded known collection split between available and assigned states; use UniversalDataGrid or a dedicated workflow for large or server-managed assignment.

## Choice Guidance

- `Switch`: persistent enabled/disabled setting.
- `ToggleButton`: active tool, formatting option, or view action.
- `ToggleButtonGroup`: related compact tool or mode choices.
- `SegmentedControl`: one small, stable choice set that stays continuously visible.
- `RadioGroup`: form choices that need room for labels and descriptions.
- `Checkbox`: an independent Boolean form value.

## Feedback

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Badge` | Compact status or label. | `import { Badge } from "@vyrnforge/ui-components";`<br>`<Badge variant="success">Stable</Badge>` | `variant`, `tone`, `size` | Do not rely on color alone for critical meaning. | Use for short metadata. Avoid long sentences. |
| `StatusBadge` | Status-specific badge. | `import { StatusBadge } from "@vyrnforge/ui-components";`<br>`<StatusBadge status="success">Ready</StatusBadge>` | `status`, badge props | Text should name the status. | Use for state labels. Avoid as a button. |
| `Alert` / `InlineMessage` | Contextual messages. | `import { InlineMessage } from "@vyrnforge/ui-components";`<br>`<InlineMessage variant="info" title="Note">...</InlineMessage>` | `variant`, `title`, `children` | Danger messages use alert semantics. | Use for inline guidance. Avoid replacing validation messages near fields. |
| `ToastProvider` / `useToast` / `ToastAction` | Experimental transient operation feedback. | `import { ToastProvider, useToast } from "@vyrnforge/ui-components";`<br>`toast.success({ title: "Saved" })` | `position`, `maxVisible`, `defaultDuration`, `toast`, `update`, `dismiss`, `duration`, `action` | Provider renders a Portal viewport. Polite tones use status; warning/error use alert. Focus does not move automatically. | Use for brief operation feedback. Avoid required validation, persistent alerts, destructive confirmation, and notification history. |

`ToastViewport` is internal provider infrastructure and is not a supported
package-root import.
| `EmptyState` | Empty content state. | `import { EmptyState } from "@vyrnforge/ui-components";`<br>`<EmptyState title="No rows" description="Try another filter." />` | `title`, `description`, `action`, `actions` | Keep message actionable. | Use when content is absent. Avoid for loading. |
| `ErrorState` | Error content state. | `import { ErrorState } from "@vyrnforge/ui-components";`<br>`<ErrorState title="Could not load" />` | `title`, `description`, `action` | Error text should be clear. | Use for recoverable content errors. Avoid for inline field errors. |
| `LoadingState` | Loading placeholder. | `import { LoadingState } from "@vyrnforge/ui-components";`<br>`<LoadingState label="Loading" />` | `label`, `size` | Label loading for assistive tech. | Use for loading regions. Avoid when skeleton better preserves layout. |
| `Skeleton` | Visual placeholder. | `import { Skeleton } from "@vyrnforge/ui-components";`<br>`<Skeleton width="100%" height={24} />` | `width`, `height`, `variant` | Respect reduced motion settings. | Use for layout-preserving loading. Avoid as permanent decoration. |

## Layout

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Card` | Framed content surface. | `import { Card } from "@vyrnforge/ui-components";`<br>`<Card padding="md">...</Card>` | `variant`, `padding` | Use semantic children inside. | Use for repeated items and framed content. Avoid nesting cards inside cards. |
| `Panel` | Section container with optional header/actions. | `import { Panel } from "@vyrnforge/ui-components";`<br>`<Panel title="Filters">...</Panel>` | `title`, `description`, `actions` | Title should describe the section. | Use for larger sections. Avoid as a generic div replacement. |
| `Stack` | Vertical layout. | `import { Stack } from "@vyrnforge/ui-components";`<br>`<Stack gap="md">...</Stack>` | `gap`, `align`, `justify` | Keep DOM order logical. | Use for vertical rhythm. Avoid complex page layout. |
| `Inline` | Horizontal layout. | `import { Inline } from "@vyrnforge/ui-components";`<br>`<Inline gap="sm">...</Inline>` | `gap`, `align`, `justify`, `wrap` | Preserve reading order. | Use for inline controls. Avoid table-like layout. |
| `Section` | Semantic content section. | `import { Section } from "@vyrnforge/ui-components";`<br>`<Section title="Details">...</Section>` | `title`, `description`, `actions` | Use meaningful section titles. | Use for document/application sections. Avoid for tiny grouped controls. |

## App Shell And Navigation

These components are experimental. They are implemented and public, but API details may still evolve.

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `AppShell` | Enterprise app layout with optional header, sidebar, footer, explicit scroll/sticky behavior, and an internal sidebar scroll viewport. | `import { AppShell } from "@vyrnforge/ui-components";`<br>`<AppShell scrollMode="content" headerPosition="sticky" sidebarPosition="sticky" header={<TopNav />} sidebar={<SideNav items={items} />}>...</AppShell>` | `header`, `sidebar`, `footer`, `scrollMode`, `headerPosition`, `sidebarPosition`, `headerHeight`, `sidebarCollapsed`, `sidebarWidth`, `collapsedSidebarWidth`, `minHeight`, `fullHeight` | Provide meaningful header/sidebar content and avoid duplicate main landmarks. | Use `page` for simple pages, `content` for admin/docs apps with persistent navigation, and `split` for workspaces with independently scrollable nav/content. AppShell wraps sidebar content in `vf-app-shell__sidebar-scroll`; do not fix persistent navigation with one-off app CSS when AppShell can express it. |
| `Page` | Route-level page wrapper with header, toolbar, density, and max-width. | `import { Page } from "@vyrnforge/ui-components";`<br>`<Page title="Orders" toolbar={<PageToolbar />}>...</Page>` | `title`, `description`, `actions`, `toolbar`, `maxWidth`, `density` | Renders a main landmark. | Use for route pages. Avoid inside another main landmark or repeated cards. |
| `PageHeader` | Page title area with description, status, metadata, breadcrumbs, and actions. | `import { PageHeader } from "@vyrnforge/ui-components";`<br>`<PageHeader title="Orders" actions={<Button>Create</Button>} />` | `title`, `description`, `eyebrow`, `status`, `metadata`, `actions`, `breadcrumbs` | Renders an `h1`; keep heading order logical. | Use for route/workflow headers. Avoid for small panel headings. |
| `PageToolbar` | Page-level controls for search, filters, refresh, export, and view controls. | `import { PageToolbar } from "@vyrnforge/ui-components";`<br>`<PageToolbar left={<SearchInput aria-label="Search" />} right={<ToolbarButton label="Refresh" />} />` | `left`, `right`, `sticky`, `density`, `children` | Controls need accessible names. | Use below a page header. Avoid for primary business actions. |
| `SideNav` | Sidebar navigation with active, disabled, badge, icon, collapsed, header/footer slots, and one-level nested items. | `import { SideNav } from "@vyrnforge/ui-components";`<br>`<SideNav activeId="orders" items={items} onSelect={setRoute} />` | `items`, `activeId`, `collapsed`, `onSelect`, `header`, `footer` | Uses a nav landmark and `aria-current` for active items. | Use for app navigation. The item list scrolls inside `vf-side-nav__scroll` so header/footer remain visible. Avoid for complex tree views. |
| `TopNav` | Compact top navigation/header bar. | `import { TopNav } from "@vyrnforge/ui-components";`<br>`<TopNav brand="Admin" actions={<Button>Invite</Button>} />` | `brand`, `navigation`, `actions`, `userArea` | Navigation/action labels must be clear. | Use in `AppShell` headers. Avoid owning auth/user state inside it. |
| `Breadcrumbs` | Hierarchical location trail. | `import { Breadcrumbs } from "@vyrnforge/ui-components";`<br>`<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Orders", current: true }]} />` | `items`, `separator` | Current item receives `aria-current="page"`. | Use for nested app pages. Avoid for step progress. |
| `Tabs` | Controlled/uncontrolled tab navigation with panels. | `import { Tabs } from "@vyrnforge/ui-components";`<br>`<Tabs defaultValue="summary" items={[{ id: "summary", label: "Summary", content: "..." }]} />` | `items`, `value`, `defaultValue`, `onValueChange`, `variant`, `size` | Uses tablist/tab/tabpanel roles and arrow/Home/End keyboard behavior. | Use for related content panels. Avoid for simple mode switches; use `SegmentedControl`. |

## Overlays

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Popover` | Anchored generic floating content. | `import { Popover } from "@vyrnforge/ui-components";`<br>`<Popover trigger={<Button>Open</Button>}>...</Popover>` | `trigger`, `open`, `onOpenChange`, `placement`, `offset`, `matchTriggerWidth`, `modal` | Non-modal by default; restores trigger focus on close. | Use for small contextual surfaces. Avoid for menus or complex workflows. |
| `Menu` | Keyboard-ready action menu. | `import { Menu } from "@vyrnforge/ui-components";`<br>`<Menu items={[{ id: "edit", label: "Edit" }]} />` | `items`, `open`, `onOpenChange`, `size`, `placement` | Uses menu roles; Arrow/Home/End skip disabled items. | Use for command lists. Avoid as navigation or form selection. |
| `Dropdown` | Generic Popover composition. | `import { Dropdown } from "@vyrnforge/ui-components";`<br>`<Dropdown trigger={<Button>More</Button>}>...</Dropdown>` | `trigger`, `children`, `open`, `onOpenChange` | Trigger needs an accessible name. | Use for generic compact content. Use Menu for actions and Select for values. |
| `Tooltip` | Short non-interactive hint. | `import { Tooltip } from "@vyrnforge/ui-components";`<br>`<Tooltip content="Refresh"><IconButton aria-label="Refresh" /></Tooltip>` | `content`, `placement`, `delayMs` | Hover/focus description; never the only accessible name. | Use for hints. Avoid interactive tooltip content. |
| `Dialog` | Portal-rendered modal dialog. | `import { Dialog } from "@vyrnforge/ui-components";`<br>`<Dialog open={open} title="Edit">...</Dialog>` | `open`, `onOpenChange`, `title`, `size`, `initialFocusRef` | Traps focus, restores focus, locks body scroll. | Use for focused modal tasks. Avoid for long multi-page workflows. |
| `Drawer` | Modal edge panel by default. | `import { Drawer } from "@vyrnforge/ui-components";`<br>`<Drawer open={open} title="Details">...</Drawer>` | `open`, `onOpenChange`, `title`, `side`, `size`, `modal` | Traps focus and locks scroll in modal mode. | Use for contextual side workflows. Avoid for required confirmation. |
| `ConfirmDialog` | Dialog-based confirmation modal. | `import { ConfirmDialog } from "@vyrnforge/ui-components";`<br>`<ConfirmDialog open={open} title="Delete item" />` | `variant`, `confirmLabel`, `cancelLabel`, `loading`, `disabled` | Inherits Dialog focus and modal behavior. | Use for confirmation. Avoid for routine non-risky actions. |

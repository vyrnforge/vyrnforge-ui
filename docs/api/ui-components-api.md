# @dravyn/ui-components API

`@dravyn/ui-components` provides native-first React primitives and application components.

## CSS Import

```ts
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
```

## General Rules

- Prefer these components before building raw custom controls.
- Use component props first, CSS variables second, scoped `className` extensions last.
- Do not depend on undocumented internal classes.
- Icon-only controls must have an accessible name.

## Actions

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Button` | Text action control. | `import { Button } from "@dravyn/ui-components";`<br>`<Button variant="primary">Save</Button>` | `variant`, `size`, `loading`, `disabled`, `fullWidth` | Use visible text for important actions. | Use for business actions. Avoid for icon-only repeated utility controls. |
| `IconButton` | Compact icon-only action. | `import { IconButton, Icon } from "@dravyn/ui-components";`<br>`<IconButton aria-label="Refresh"><Icon name="Refresh" /></IconButton>` | `variant`, `size`, `disabled` | Always provide `aria-label`. | Use for utility actions. Avoid for primary business actions without text. |
| `ToolbarButton` | Dense toolbar command with optional icon and label. | `import { ToolbarButton, Icon } from "@dravyn/ui-components";`<br>`<ToolbarButton icon={<Icon name="Filter" />} label="Filters" />` | `icon`, `label`, `size`, `pressed` | Label should remain meaningful in compact UI. | Use in repeated toolbars. Avoid as a page-level primary action. |
| `ButtonGroup` | Groups related buttons. | `import { ButtonGroup, Button } from "@dravyn/ui-components";`<br>`<ButtonGroup><Button>One</Button><Button>Two</Button></ButtonGroup>` | `children` | Keep grouped actions related. | Use for adjacent related controls. Avoid for unrelated actions. |
| `SegmentedControl` | Mutually exclusive mode selector. | `import { SegmentedControl } from "@dravyn/ui-components";`<br>`<SegmentedControl value="list" options={[{ label: "List", value: "list" }]} onChange={setValue} />` | `value`, `options`, `onChange`, `size` | Options need clear labels. | Use for small mode sets. Avoid for long option lists. |
| `Icon` | Shared inline symbol. | `import { Icon } from "@dravyn/ui-components";`<br>`<Icon name="Search" />` | `name`, `size`, `aria-hidden` | Decorative icons should be hidden from assistive tech. | Use inside controls or status text. Avoid replacing text with icons alone. |

## Typography

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Text` | Body text. | `import { Text } from "@dravyn/ui-components";`<br>`<Text tone="muted">Updated now</Text>` | `tone`, `size`, `as` | Keep semantic element appropriate. | Use for readable body copy. Avoid custom paragraph classes for common text. |
| `Heading` | Section heading. | `import { Heading } from "@dravyn/ui-components";`<br>`<Heading level={2}>Orders</Heading>` | `level`, `size` | Preserve heading order. | Use for page and section titles. Avoid skipping levels for visual size only. |
| `Label` | Form or data label text. | `import { Label } from "@dravyn/ui-components";`<br>`<Label htmlFor="name">Name</Label>` | native label props | Associate with controls when possible. | Use for form labels. Avoid as decorative text. |
| `Caption` | Small supporting text. | `import { Caption } from "@dravyn/ui-components";`<br>`<Caption>Optional</Caption>` | `children` | Do not use as the only label for required info. | Use for minor metadata. Avoid for primary content. |
| `CodeText` | Inline code-like text. | `import { CodeText } from "@dravyn/ui-components";`<br>`<CodeText>--dv-primary</CodeText>` | `children` | Keep code readable in context. | Use for tokens, package names, and snippets. Avoid large blocks. |

## Forms

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Field` | Label, hint, and validation composition. | `import { Field, TextInput } from "@dravyn/ui-components";`<br>`<Field label="Name"><TextInput /></Field>` | `label`, `hint`, `error`, `required` | Connect labels and messages to controls. | Use around form controls. Avoid duplicating label markup. |
| `TextInput` | Native text input. | `import { TextInput } from "@dravyn/ui-components";`<br>`<TextInput value={name} onChange={...} />` | native input props, `size`, `invalid` | Provide a label through `Field` or ARIA. | Use for short text. Avoid for search-specific inputs. |
| `SearchInput` | Native search input with search affordance. | `import { SearchInput } from "@dravyn/ui-components";`<br>`<SearchInput aria-label="Search orders" />` | native input props, `size`, `invalid` | Provide visible or ARIA label. | Use for filtering/search. Avoid for generic text entry. |
| `Select` | Native select. | `import { Select } from "@dravyn/ui-components";`<br>`<Select options={[{ label: "Open", value: "open" }]} />` | `options`, native select props, `size`, `invalid` | Label the select and keep options concise. | Use for small option sets. Avoid for custom combobox behavior. |
| `Checkbox` | Boolean input. | `import { Checkbox } from "@dravyn/ui-components";`<br>`<Checkbox label="Active" checked={active} onChange={...} />` | `checked`, `defaultChecked`, `label`, native props | Label must describe the state. | Use for binary settings. Avoid for mutually exclusive groups. |
| `Textarea` | Multi-line text input. | `import { Textarea } from "@dravyn/ui-components";`<br>`<Textarea rows={4} />` | native textarea props, `size`, `invalid` | Provide a label and validation message. | Use for longer text. Avoid for single-line values. |

## Feedback

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Badge` | Compact status or label. | `import { Badge } from "@dravyn/ui-components";`<br>`<Badge variant="success">Stable</Badge>` | `variant`, `tone`, `size` | Do not rely on color alone for critical meaning. | Use for short metadata. Avoid long sentences. |
| `StatusBadge` | Status-specific badge. | `import { StatusBadge } from "@dravyn/ui-components";`<br>`<StatusBadge status="success">Ready</StatusBadge>` | `status`, badge props | Text should name the status. | Use for state labels. Avoid as a button. |
| `Alert` / `InlineMessage` | Contextual messages. | `import { InlineMessage } from "@dravyn/ui-components";`<br>`<InlineMessage variant="info" title="Note">...</InlineMessage>` | `variant`, `title`, `children` | Danger messages use alert semantics. | Use for inline guidance. Avoid replacing validation messages near fields. |
| `EmptyState` | Empty content state. | `import { EmptyState } from "@dravyn/ui-components";`<br>`<EmptyState title="No rows" description="Try another filter." />` | `title`, `description`, `action`, `actions` | Keep message actionable. | Use when content is absent. Avoid for loading. |
| `ErrorState` | Error content state. | `import { ErrorState } from "@dravyn/ui-components";`<br>`<ErrorState title="Could not load" />` | `title`, `description`, `action` | Error text should be clear. | Use for recoverable content errors. Avoid for inline field errors. |
| `LoadingState` | Loading placeholder. | `import { LoadingState } from "@dravyn/ui-components";`<br>`<LoadingState label="Loading" />` | `label`, `size` | Label loading for assistive tech. | Use for loading regions. Avoid when skeleton better preserves layout. |
| `Skeleton` | Visual placeholder. | `import { Skeleton } from "@dravyn/ui-components";`<br>`<Skeleton width="100%" height={24} />` | `width`, `height`, `variant` | Respect reduced motion settings. | Use for layout-preserving loading. Avoid as permanent decoration. |

## Layout

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Card` | Framed content surface. | `import { Card } from "@dravyn/ui-components";`<br>`<Card padding="md">...</Card>` | `variant`, `padding` | Use semantic children inside. | Use for repeated items and framed content. Avoid nesting cards inside cards. |
| `Panel` | Section container with optional header/actions. | `import { Panel } from "@dravyn/ui-components";`<br>`<Panel title="Filters">...</Panel>` | `title`, `description`, `actions` | Title should describe the section. | Use for larger sections. Avoid as a generic div replacement. |
| `Stack` | Vertical layout. | `import { Stack } from "@dravyn/ui-components";`<br>`<Stack gap="md">...</Stack>` | `gap`, `align`, `justify` | Keep DOM order logical. | Use for vertical rhythm. Avoid complex page layout. |
| `Inline` | Horizontal layout. | `import { Inline } from "@dravyn/ui-components";`<br>`<Inline gap="sm">...</Inline>` | `gap`, `align`, `justify`, `wrap` | Preserve reading order. | Use for inline controls. Avoid table-like layout. |
| `Section` | Semantic content section. | `import { Section } from "@dravyn/ui-components";`<br>`<Section title="Details">...</Section>` | `title`, `description`, `actions` | Use meaningful section titles. | Use for document/application sections. Avoid for tiny grouped controls. |

## Overlays

| Component | Purpose | Import and usage | Important props | Accessibility | Use / avoid |
| --- | --- | --- | --- | --- | --- |
| `Popover` | Anchored floating content. | `import { Popover } from "@dravyn/ui-components";`<br>`<Popover trigger={<Button>Open</Button>}>...</Popover>` | `trigger`, `open`, `onOpenChange`, `placement` | Trigger must be keyboard accessible. | Use for small contextual surfaces. Avoid for complex workflows. |
| `Menu` | Action/options menu. | `import { Menu } from "@dravyn/ui-components";`<br>`<Menu items={[{ id: "edit", label: "Edit" }]} />` | `items`, `onSelect`, `size` | Labels must be clear actions. | Use for command lists. Avoid as navigation if links are better. |
| `Dropdown` | Triggered selection/action surface. | `import { Dropdown } from "@dravyn/ui-components";`<br>`<Dropdown trigger={<Button>More</Button>}>...</Dropdown>` | `trigger`, `children` | Trigger needs accessible name. | Use for compact optional content. Avoid hidden primary actions. |
| `Tooltip` | Short non-interactive hint. | `import { Tooltip } from "@dravyn/ui-components";`<br>`<Tooltip content="Refresh"><IconButton aria-label="Refresh" /></Tooltip>` | `content`, `placement` | Tooltip cannot be the only accessible label. | Use for hints. Avoid interactive tooltip content. |
| `Dialog` | Modal dialog. | `import { Dialog } from "@dravyn/ui-components";`<br>`<Dialog open={open} title="Edit">...</Dialog>` | `open`, `onOpenChange`, `title`, `size` | Dialog needs clear title and close path. | Use for focused modal tasks. Avoid for long multi-page workflows. |
| `Drawer` | Edge panel. | `import { Drawer } from "@dravyn/ui-components";`<br>`<Drawer open={open} title="Details">...</Drawer>` | `open`, `onOpenChange`, `title`, `side`, `size` | Preserve focus and close behavior. | Use for contextual side workflows. Avoid for required confirmation. |
| `ConfirmDialog` | Confirmation modal. | `import { ConfirmDialog } from "@dravyn/ui-components";`<br>`<ConfirmDialog open={open} title="Delete item" />` | `variant`, `confirmLabel`, `cancelLabel` | Destructive confirmations must be explicit. | Use for confirmation. Avoid for routine non-risky actions. |

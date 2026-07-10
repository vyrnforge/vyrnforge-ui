# `@dravyn/ui-components`

## Purpose

`@dravyn/ui-components` provides reusable native-first React components for enterprise apps.

## Component groups

- actions: Button, IconButton, ToolbarButton, ButtonGroup, SegmentedControl
- typography: Text, Heading, Label, Caption, CodeText
- forms: Field, TextInput, SearchInput, Select, Checkbox, Radio, RadioGroup, Switch, NumberInput, DateInput, DateTimeInput, MultiSelect, Textarea, ValidationMessage
- feedback: Badge, Alert/InlineMessage, EmptyState, ErrorState, LoadingState, Skeleton, planned Toast/Progress
- overlays: Popover, Menu, Dropdown, Tooltip, Dialog, Drawer, ConfirmDialog
- layout: Card, Panel, Stack, Inline, Section, AppShell, Page, PageHeader, PageToolbar
- navigation: SideNav, TopNav, Breadcrumbs, Tabs

## Owns

- `dv-*` classes
- native React component APIs
- accessibility behavior for shared primitives

## Does not own

- data-grid algorithms
- backend data
- app/global state

## Import

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
```

## Usage principle

Use text buttons for primary business actions. Use IconButton/ToolbarButton for repeated utility actions. Every icon-only action must have an accessible label.

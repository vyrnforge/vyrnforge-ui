# `@vyrnforge/ui-components`

## Purpose

`@vyrnforge/ui-components` is the first-class React renderer for reusable
VyrnForge UI primitives and enterprise application components.

The package name remains stable through the multi-framework beta. Do not rename
it to `@vyrnforge/ui-react` during behavior extraction.

## Component groups

- actions: Button, IconButton, ToolbarButton, ButtonGroup, SegmentedControl;
- typography: Text, Heading, Label, Caption, CodeText;
- forms: Field, TextInput, SearchInput, Select, Autocomplete, Checkbox, Radio,
  RadioGroup, Switch, NumberInput, DateInput, DateTimeInput, MultiSelect,
  Textarea, ValidationMessage;
- data management: TransferList;
- feedback: Badge, Alert/InlineMessage, Toast, EmptyState, ErrorState,
  LoadingState, Skeleton;
- overlays: Popover, Menu, Dropdown, Tooltip, Dialog, Drawer, ConfirmDialog;
- layout: Card, Panel, Stack, Inline, Section, AppShell, Page, PageHeader,
  PageToolbar;
- navigation: SideNav, TopNav, Breadcrumbs, Tabs.

## Multi-framework role

React remains the reference renderer. During S5, portable state transitions and
controller rules move into planned `@vyrnforge/ui-behaviors` without changing
the documented React public API.

React owns:

- React props and callbacks;
- hooks and lifecycle integration;
- refs, JSX, children, and render callbacks;
- React-specific DOM adapters;
- current component CSS and `vf-*` class structure.

React must not become the implementation runtime for Angular, Vue, or native
HTML consumers.

## Dependencies

Current:

- `@vyrnforge/ui-core`
- React and React DOM as peer dependencies

Planned after S5:

- `@vyrnforge/ui-behaviors`

Forbidden:

- `@vyrnforge/ui-elements`
- `@vyrnforge/ui-data-grid`
- required Redux, TanStack, MUI, Radix, Tailwind, or other large UI runtimes

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

## Release direction

All public non-grid React components are in the coordinated beta scope. Their
promotion requires React parity after behavior extraction and the normal
component maturity evidence.

See:

- `../architecture/adr-004-multi-framework-web-support.md`
- `../architecture/09-component-contracts-and-events.md`
- `../metadata/multi-framework.json`

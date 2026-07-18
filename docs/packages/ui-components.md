# `@vyrnforge/ui-components`

## Purpose

`@vyrnforge/ui-components` provides reusable native-first React components for enterprise apps.

## Component groups

- actions: Button, IconButton, ToolbarButton, ButtonGroup, SegmentedControl
- typography: Text, Heading, Label, Caption, CodeText
- forms: Field, TextInput, SearchInput, Select, Autocomplete, Checkbox, Radio, RadioGroup, Switch, NumberInput, DateInput, DateTimeInput, MultiSelect, Textarea, ValidationMessage
- data management: TransferList
- feedback: Badge, Alert/InlineMessage, Toast, EmptyState, ErrorState, LoadingState, Skeleton, planned Progress
- overlays: Popover, Menu, Dropdown, Tooltip, Dialog, Drawer, ConfirmDialog
- layout: Card, Panel, Stack, Inline, Section, AppShell, Page, PageHeader, PageToolbar
- navigation: SideNav, TopNav, Breadcrumbs, Tabs

## Owns

- `vf-*` classes
- native React component APIs
- accessibility behavior for shared primitives

## Does not own

- data-grid algorithms
- backend data
- app/global state

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

## Package readiness

- JavaScript entry: `@vyrnforge/ui-components` resolves to built `dist/index.js` or `dist/index.cjs`.
- Type declarations: `dist/index.d.ts`.
- CSS entry: `@vyrnforge/ui-components/styles/index.css` resolves to built `dist/index.css`.
- Published file whitelist: `dist` and `README.md`; package metadata and top-level `LICENSE` are included by npm automatically.
- CSS side effect: `./dist/index.css`.
- Peer dependencies: React and ReactDOM.
- Internal dependency: `@vyrnforge/ui-core`.
- License metadata: `SEE LICENSE IN LICENSE`.

## Usage principle

Use text buttons for primary business actions. Use IconButton/ToolbarButton for repeated utility actions. Every icon-only action must have an accessible label.

Use `AppShell` `scrollMode`, `headerPosition`, and `sidebarPosition` props for persistent enterprise navigation. Do not patch app-specific sidebar stickiness when the shell API can express the layout.

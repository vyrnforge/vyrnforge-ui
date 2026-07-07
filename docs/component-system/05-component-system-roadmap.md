# 05 — UI Component System Roadmap

## Purpose

This roadmap defines the broader reusable component system beyond the Universal Data Grid.

The data grid is the first strategic component. The long-term project should become a reusable enterprise UI foundation.

## Package roadmap

```txt
UI-0 Documentation and inventory
UI-1 Create ui-core package
UI-2 Extract theme tokens and shared CSS utilities
UI-3 Create ui-components package
UI-4 Implement action, feedback, and form primitives
UI-5 Refactor ui-data-grid to optionally consume shared primitives
UI-6 Add playground/story documentation
UI-7 Release and version packages
```

## Component categories

### Foundation

```txt
Typography
Text
Heading
Label
Caption
CodeText
MutedText
StrongText
```

### Layout

```txt
Page
PageHeader
PageToolbar
Section
Panel
Card
Stack
Inline
Grid
SplitPane
AppShell
ContentShell
```

### Actions

```txt
Button
IconButton
ButtonGroup
SegmentedControl
DropdownButton
ActionMenu
Toolbar
CommandButton
```

### Forms

```txt
Field
FieldGroup
TextInput
SearchInput
NumberInput
DateInput
Select
MultiSelect
Checkbox
Radio
Switch
Textarea
ValidationMessage
```

### Overlays

```txt
Popover
Menu
Dropdown
Tooltip
Dialog
Drawer
ConfirmDialog
CommandPalette
```

### Feedback

```txt
Badge
StatusBadge
Alert
Toast
InlineMessage
EmptyState
ErrorState
LoadingState
Skeleton
ProgressBar
```

### Data display

```txt
DescriptionList
KeyValueList
MetadataList
PropertyTable
Timeline
ActivityLog
ResourceList
TreeList
CompactList
```

### Navigation

```txt
NavDock
SideNav
TopNav
Breadcrumbs
Tabs
ContextTabs
PageSwitcher
```

### Data management

```txt
UniversalDataGrid
FilterBar
FilterChip
AdvancedFilterDrawer
SavedViewSelector
ColumnManager
BulkActionBar
ExportPreviewPanel
ImportPreviewPanel
```

### Workflow

```txt
StepProgress
WizardShell
ApprovalBar
ReviewPanel
ChangeSummary
AuditTrail
DiffViewer
ImpactPreview
```

## Component maturity model

### Candidate

Potential component. Not yet accepted for shared package.

### Proposed

Documented and approved concept. Not implemented yet.

### Experimental

Implemented but API may change.

### Stable

Reusable across projects. Public API is documented.

### Deprecated

Should no longer be used. Migration path required.

## Shared component acceptance criteria

A component may enter shared packages only if it:

* solves repeated use cases
* is not domain-specific
* supports light and dark theme
* supports density where relevant
* is accessible
* has TypeScript types
* uses CSS variables
* has examples
* has tests where logic exists
* avoids unnecessary runtime dependencies

## Priority matrix

### P0 — Foundation components

```txt
ui-core theme/tokens
Button
IconButton
Typography
Badge
EmptyState
ErrorState
LoadingState
Skeleton
Field
TextInput
Select
Checkbox
Popover/Menu
```

### P1 — Application primitives

```txt
Page
PageHeader
Card
Panel
Tabs
Drawer
Dialog
ActionMenu
SearchInput
StatusBadge
DescriptionList
```

### P2 — Advanced patterns

```txt
CommandPalette
AdvancedFilterDrawer
SavedViewSelector
Timeline
ActivityLog
WizardShell
AuditTrail
DiffViewer
ImpactPreview
```

## Relationship to ui-data-grid

`ui-data-grid` should remain specialized.

Generic pieces may later move to `ui-core` or `ui-components`, including:

* buttons
* menu styles
* badge styles
* empty/error/loading states
* typography patterns
* theme helpers

Avoid circular dependencies.

Recommended long-term dependency graph:

```txt
ui-data-grid -> ui-components -> ui-core
```

## Rule against premature abstraction

Do not create a shared component just because it is possible.

A component should become shared when:

* it appears in at least 2–3 real use cases, or
* it is foundational enough that many components depend on it.

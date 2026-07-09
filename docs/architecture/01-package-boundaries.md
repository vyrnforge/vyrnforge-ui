# Package Boundaries

## `@dravyn/ui-core`

### Owns

- `--dv-*` CSS variables
- theme presets: light, dark, system, enterprise
- density tokens: compact, standard, comfortable
- utility classes
- theme helper types/functions if dependency-free

### Must not own

- React components
- data grid behavior
- business state
- app routing
- backend fetching

## `@dravyn/ui-components`

### Owns

- shared `dv-*` React components
- actions: Button, IconButton, ToolbarButton, SegmentedControl
- forms: Field, TextInput, Select, Checkbox, etc.
- feedback: Badge, EmptyState, ErrorState, LoadingState, Skeleton
- overlays: Popover, Menu, Tooltip, Dialog, Drawer, ConfirmDialog
- layout/app primitives: Card, Panel, Stack, Inline, AppShell, PageHeader later

### Must not own

- data-grid algorithms
- grid row models
- backend data fetching
- global store
- tenant/auth/permissions

## `@dravyn/ui-data-grid`

### Owns

- UniversalDataGrid
- grid-specific `udg-*` styles
- grid state contracts
- column/search/filter/sort/pagination/grouping/selection logic
- persistence adapter contracts
- server query contracts
- export request contracts

### Must not own

- API calls
- export file generation by default
- report generator engine
- global store
- backend business workflows

## Circular dependency rule

If a package needs something from a higher-level package, the abstraction belongs in the lower-level package or in a new adapter package.

## Dependency policy

Dravyn packages must not depend on Redux, React Redux, RTK Query, Zustand, TanStack state/query/table/virtual, MUI, AntD, Chakra, Mantine, Radix, Headless UI, Tailwind, styled-components, Emotion, icon libraries, or CSS frameworks by default.

Apps may use those tools around Dravyn through controlled props, adapter contracts, and normal application composition.

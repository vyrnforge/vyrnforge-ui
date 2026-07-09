> Archived: This document is historical and no longer canonical.
> Replacement: ../../architecture/04-clean-code-boundaries.md, ../../architecture/02-state-and-adapter-ownership.md, and ../../architecture/03-theming-and-styling.md

# 03 — Native-First Engineering Principles

## Principle

Dravyn UI should be native-first and dependency-light.

The project should build reusable enterprise-grade components using browser-native capabilities before reaching for large frameworks.

## Preferred implementation tools

```txt
React
TypeScript
HTML
CSS
CSS variables
Pointer events
ResizeObserver when needed
Native form controls where practical
Small pure utility functions
```

## Avoid as required dependencies

```txt
MUI
TanStack Table
TanStack Virtual
Redux
RTK Query
Radix
Headless UI
Tailwind
Emotion
styled-components
icon libraries
large utility libraries
```

Apps may use those libraries outside Dravyn UI. Dravyn UI should not force them.

## Controlled and uncontrolled state

Components should support:

* controlled mode through `state` / `value` props
* uncontrolled mode through `defaultState` / `defaultValue` props
* change callbacks

Example:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  state={gridState}
  onStateChange={setGridState}
/>
```

Uncontrolled:

```tsx
<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  defaultState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
/>
```

## Adapter-based integrations

Do not hardwire global stores or backends into components.

Prefer adapters:

```txt
persistenceAdapter
serverDataSource
exportRequestBuilder
savedViewAdapter
```

This allows projects to connect Redux, RTK Query, Zustand, localStorage, URL params, or backend APIs without making those dependencies mandatory.

## CSS strategy

Use scoped component classes and CSS variables.

Example:

```css
.udg {
  --udg-primary: #2563eb;
  --udg-border: #e2e8f0;
}
```

Project override:

```css
.my-project .udg {
  --udg-primary: #003b71;
}
```

## Testing strategy

Prefer pure functions for complex behavior.

Examples:

* filtering
* sorting
* pagination
* grouping
* selection
* column sizing
* view persistence
* export request building

React components should be thin orchestration layers where possible.

## API stability

Avoid exposing too many internal details.

Public exports should be intentional:

* component APIs
* types
* useful pure utilities
* theme helpers
* adapters

Avoid exporting internal helpers unless they are stable and documented.

## Performance principles

* Avoid unnecessary rerenders.
* Memoize derived rows and columns.
* Avoid storing large row data in global state.
* Support server mode for large datasets.
* Add virtualization only after the data model is stable.

## Accessibility principles

Every interactive component must support:

* keyboard access
* visible focus states
* accessible labels
* disabled states
* screen-reader-friendly states when practical
* reduced motion support where animation exists

## Component acceptance criteria

A component is acceptable for shared use only if it:

* has clear purpose
* is not domain-specific
* is typed
* is themeable
* works in light and dark themes
* supports relevant density modes
* has accessible interactions
* is documented with examples
* avoids unnecessary runtime dependencies

> Archived: This document is historical and no longer canonical.
> Replacement: ../../architecture/05-accessibility-standards.md

# 11 — Quality, Accessibility, and Test Strategy

## Quality goals

VyrnForge UI should be reliable enough for enterprise applications.

The library should avoid fragile UI behavior and hidden assumptions.

## Test layers

### Pure utility tests

Test core logic as pure functions:

* search
* filters
* sorting
* pagination
* column visibility
* column order
* column sizing
* selection
* grouping
* persistence picking
* export request building

### Component behavior tests

Test key interactions when practical:

* search input updates rows
* header sort works
* filter popover applies filters
* column menu toggles visibility
* resize does not trigger sort
* row selection works
* bulk action receives selected rows
* group toggle expands/collapses

### Playground validation

Build the playground on CI.

This catches package consumption issues.

## Accessibility requirements

Components should support:

* visible focus states
* keyboard access
* aria-labels for icon/symbol buttons
* aria-expanded for expandable rows/menus
* aria-selected for selected rows
* readable disabled states
* reduced motion support
* color contrast in light and dark themes

## Data grid specific accessibility

Data grid should ensure:

* sortable headers are keyboard accessible
* filter buttons have labels
* resize handles have labels
* drag reorder has button fallback
* row selection has checkbox labels
* group toggle has aria-expanded
* bulk action bar is understandable

## Visual QA checklist

Test every component in:

```txt
light theme
 dark theme
 enterprise theme
 compact density
 standard density
 comfortable density
 card variant
 bordered variant
 plain variant
```

## Interaction conflict checklist

For data grid:

* resize must not sort
* reorder must not sort
* checkbox click must not trigger row click
* filter button click must not sort
* header menu click must not sort
* drag handle in column menu must not toggle checkbox
* hidden columns must not break filtering/grouping
* selected rows must resolve only leaf rows when grouped

## Performance checklist

* no large row data in persistence
* no large row data in global store
* memoize derived row models
* avoid excessive state updates during resize
* server mode for large datasets
* virtualization only after model is stable

## Release quality gate

Before a release:

```bash
npm run build
npm run typecheck
npm run test
npm run build:playground
npm pack
```

Then install the package into at least one external app and verify:

* import works
* CSS works
* types work
* light/dark theme works
* core interactions work

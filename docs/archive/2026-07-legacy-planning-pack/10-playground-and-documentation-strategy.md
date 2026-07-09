> Archived: This document is historical and no longer canonical.
> Replacement: ../../react-docs/00-react-docs-app-spec.md

# 10 — Playground and Documentation Strategy

## Purpose

Playgrounds prove that packages work as external consumers would use them.

A component working inside its own package is not enough.

## Recommended examples

```txt
examples/basic-playground
examples/data-grid-playground
examples/component-playground
```

## Basic playground responsibilities

The playground should demonstrate:

* package import
* CSS import
* light theme
* dark theme
* enterprise theme
* density modes
* variants
* controlled state
* uncontrolled state
* themeVars override

## Data grid playground responsibilities

The data grid playground should demonstrate:

* search
* sorting
* filtering
* pagination
* column menu
* column resizing
* header controls
* row selection
* bulk actions
* grouping
* loading state
* empty state
* error state
* server-mode mock later
* export request mock later

## Component playground responsibilities

When `ui-components` exists, it should demonstrate:

* Button
* IconButton
* Typography
* Field
* TextInput
* Select
* Checkbox
* Popover/Menu
* Badge
* EmptyState
* LoadingState
* Panel
* Card

## Documentation files per package

Each package should include:

```txt
README.md
CHANGELOG.md at root
MIGRATION.md at root
examples in playground
```

## Recommended README structure

```txt
Overview
Installation
CSS import
Basic usage
Props
Controlled/uncontrolled examples
Theme examples
Accessibility notes
Limitations
Migration notes
```

## Documentation standard

Docs should be practical, not theoretical.

Every feature should include:

* when to use it
* minimal example
* controlled example if stateful
* limitations
* accessibility notes when relevant

## Storybook note

Storybook may be added later, but do not require it early if it slows down progress.

Current priority:

```txt
Vite playgrounds first
Storybook later if documentation needs grow
```

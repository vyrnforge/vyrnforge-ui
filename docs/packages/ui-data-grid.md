# `@vyrnforge/ui-data-grid`

## Purpose

`@vyrnforge/ui-data-grid` provides `UniversalDataGrid`, a specialized React
enterprise data-management grid.

It is one package inside VyrnForge UI, not the entire library.

## Current scope

The package owns:

- React grid rendering;
- grid-specific `udg-*` styles;
- search, filter, sort, pagination, grouping, and selection behavior;
- column visibility, order, and sizing;
- grid state contracts;
- persistence, server, and export adapters.

Applications still own backend rows, fetching, authorization, mutations,
business actions, and report-file generation.

## Multi-framework roadmap status

The data grid remains an independently versioned **React alpha** package. It is
excluded from the non-grid beta release group.

Deferred until after GBETA:

- large internal decomposition;
- performance and scale expansion;
- framework-neutral grid-core extraction;
- native, Angular, or Vue grid renderers.

Targeted defect, security, accessibility, and compatibility fixes remain
allowed. Grid feature expansion must not delay the non-grid beta.

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

## Release direction

`@vyrnforge/ui-data-grid` stays on its own alpha prerelease line while
`ui-core`, `ui-behaviors`, `ui-components`, and `ui-elements` move toward the
coordinated non-grid beta.

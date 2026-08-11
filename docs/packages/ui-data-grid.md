# `@vyrnforge/ui-data-grid`

## Purpose

`@vyrnforge/ui-data-grid` provides `UniversalDataGrid` and the specialized
React data-management contracts around it.

The package owns grid rendering, grid-specific `udg-*` styling, search/filter/
sort/pagination/grouping behavior, selection, column management, grid state,
persistence contracts, server-query contracts, and export-request contracts.

Applications continue to own backend rows, fetching, authorization, mutations,
business workflows, and generated report files.

## Install

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";

import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

## Release and framework scope

The grid remains an independently versioned React `alpha` package. It is not
part of the synchronized non-grid beta release group.

Native HTML, Angular, and Vue grid renderers are not part of the current support
claim. Broader grid decomposition, scale work, and additional renderers remain
a separate future workstream unless reprioritized.

## Public surface

Use [ui-data-grid API](../api/ui-data-grid-api.md) for the current public grid
contracts. Shared non-grid component maturity does not imply grid maturity.

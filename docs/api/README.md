# VyrnForge UI Public API Reference

This folder documents the public API surface for VyrnForge UI.

Public API means the parts of VyrnForge UI that consuming applications may rely on:

- package entry exports
- documented React components and props
- documented CSS variables
- documented CSS import paths
- documented data-grid state and adapter contracts
- documented metadata JSON files

The public packages are:

| Package | Public role |
| --- | --- |
| `@vyrnforge/ui-core` | Shared tokens, themes, density, utilities, and theme helpers. |
| `@vyrnforge/ui-components` | Native-first reusable React components. |
| `@vyrnforge/ui-data-grid` | Specialized enterprise data-management grid and grid contracts. |

## Importing Packages

```ts
import { Button } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

Import CSS for the packages you use:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

`ui-core` styles should come first because they define shared `--vf-*` tokens. `ui-components` consumes those shared tokens. `ui-data-grid` owns grid-specific `--udg-*` variables and maps them to `--vf-*` tokens where practical.

## API Documents

| Document | Purpose |
| --- | --- |
| `import-and-setup.md` | Installation, import order, and CSS setup. |
| `ui-core-api.md` | Public token, theme, density, and utility API. |
| `ui-components-api.md` | Public React component API overview. |
| `ui-data-grid-api.md` | Public grid component, state, adapter, and styling API overview. |
| `css-token-reference.md` | Stable public CSS variables. |
| `css-class-reference.md` | Public class naming and extension rules. |
| `public-vs-internal-api.md` | What apps may rely on and what remains private. |

## Metadata

Machine-readable metadata lives in `docs/metadata/`. It complements these API docs and helps AI agents find package roles, component status, CSS imports, and state contracts quickly.

Markdown docs remain the human source of truth. Metadata is a structured index and must not contradict the API docs.

## Internal API

Anything not exported from a package entry point or documented here is internal unless explicitly stated otherwise. Do not depend on non-exported helpers, internal class names, implementation files, tests, or docs-app-only classes.

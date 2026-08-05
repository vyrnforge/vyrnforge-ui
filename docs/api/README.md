# VyrnForge UI Public API Reference

This folder documents the public API surface for VyrnForge UI.

Public API means the parts of VyrnForge UI that consuming applications may rely on:

- package entry exports
- documented React components and props
- documented CSS variables
- documented CSS import paths
- documented data-grid state and adapter contracts
- documented metadata JSON files

The currently implemented public packages are:

| Package                    | Public role                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, density, utilities, and theme helpers.                          |
| `@vyrnforge/ui-behaviors`  | Framework-neutral controllable state, collections, selection, and reasoned controller events.     |
| `@vyrnforge/ui-components` | First-class reusable React components.                                                            |
| `@vyrnforge/ui-elements`   | Complete 58-tag GMF3 native Custom Element renderer, forms, events, styles, and service mappings. |
| `@vyrnforge/ui-data-grid`  | Specialized React enterprise data-management grid on an independent alpha track.                  |

GMF3 proves the complete native renderer. CF-7003 adds Angular 22
packed-package, build, property/event, slot, native-form, and Chromium evidence.
CF-7004 adds an isolated Angular Forms reference directive over the same public
properties, events, disabled state, and native validity; it is not a new
published package. CF-7005 adds the isolated Vue 3 fixture and verifier for
compiler, property/event, slot, native-form, production-build, and Chromium
coverage. The clean build and Chromium evidence are complete. Vue `v-model`,
accessibility, documentation, and final GMF4 closure evidence remain planned.

## Multi-framework contract

The public cross-framework architecture is defined by:

- `../architecture/adr-004-multi-framework-web-support.md`;
- `../architecture/09-component-contracts-and-events.md`;
- `../architecture/10-custom-elements-and-form-association.md`;
- `../metadata/multi-framework.json`;
- `../metadata/component-contracts.json`.

Architecture metadata is public documentation, but final beta support still
requires GMF4 closure. Native HTML, Angular, and Vue have packed runtime consumer evidence. Remaining
adapter, matrix,
accessibility, and documentation gates still control the release claim.

## Importing Packages

```ts
import {
  createControllableState,
  createSelectionController,
} from "@vyrnforge/ui-behaviors";
import { Button } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

Import CSS for the packages you use:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

`ui-core` styles should come first because they define shared `--vf-*` tokens. `ui-elements` and `ui-components` consume those shared tokens for their respective renderers. `ui-data-grid` owns grid-specific `--udg-*` variables and maps them to `--vf-*` tokens where practical.

## API Documents

| Document                    | Purpose                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| `import-and-setup.md`       | Installation, import order, and CSS setup.                            |
| `ui-core-api.md`            | Public token, theme, density, and utility API.                        |
| `ui-behaviors-api.md`       | Public framework-neutral state, collection, selection, and event API. |
| `ui-components-api.md`      | Public React component API overview.                                  |
| `ui-elements-api.md`        | Native Custom Element foundation API and registration entry points.   |
| `ui-data-grid-api.md`       | Public grid component, state, adapter, and styling API overview.      |
| `css-token-reference.md`    | Stable public CSS variables.                                          |
| `css-class-reference.md`    | Public class naming and extension rules.                              |
| `public-vs-internal-api.md` | What apps may rely on and what remains private.                       |

## Metadata

Machine-readable metadata lives in `docs/metadata/`. It complements these API docs and helps AI agents find package roles, component status, CSS imports, and state contracts quickly.

Markdown docs remain the human source of truth. Metadata is a structured index and must not contradict the API docs.

Component maturity is canonical in `metadata/components.json`. Public
components are `planned`, `experimental`, `alpha-stable`, `beta-stable`,
`stable`, or `deprecated`; internal records must not be imported from package
roots. The VF-1009 evidence required to claim Alpha Stable, Beta Stable,
Stable, or Deprecated is recorded in the same catalog and verified by
`npm run verify:component-maturity`.

## Internal API

Anything not exported from a package entry point or documented here is internal unless explicitly stated otherwise. Do not depend on non-exported helpers, internal class names, implementation files, tests, or docs-app-only classes.

## Semantic token contract

The complete S3 token roles and compatibility policy live in
`../architecture/08-semantic-token-contract.md`. Use
`css-token-reference.md` for public variable names and
`../metadata/design-tokens.json` for machine-readable tooling.

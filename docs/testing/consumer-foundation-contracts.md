# Consumer Foundation Contracts

CF-7001, CF-7002, and CF-7008 established the original runtime evidence inside
S7 / GMF4. The canonical machine-readable record is
`docs/metadata/consumer-foundations.json`. MFD-1417 promotes the React fixture
to the final first-class package path without changing the native HTML contract.

## Scope

The consumer foundation verifies clean packed consumption for:

- native HTML through `@vyrnforge/ui-elements`;
- React through the public `@vyrnforge/ui-components` package;
- Angular and Vue through their current verified native-element integrations.

The data grid remains outside the non-grid beta gate.

## Clean package rule

Verification packs the shared VyrnForge packages needed to exercise each
surface. Installed artifacts must be ordinary files under each fixture's
`node_modules`, not workspace symlinks. Consumer source must not use
`packages/*/src`, TypeScript path aliases, or repository-relative imports.

For the React fixture, normal application code imports only
`@vyrnforge/ui-components` and its public stylesheet. `@vyrnforge/ui-core`,
`@vyrnforge/ui-behaviors`, and `@vyrnforge/ui-elements` may be present as
transitive implementation dependencies, but React application code must not
import, register, or type against them.

## CF-7001 native HTML evidence

`tests/consumers/native-html` proves:

1. explicit `@vyrnforge/ui-elements/register` registration;
2. shared core and native CSS imports;
3. typed `document.createElement` and literal `querySelector` results;
4. typed canonical `vf-*` events;
5. property-only array models;
6. slots and Light DOM composition;
7. `ElementInternals` form submission;
8. production Vite output and Chromium interaction.

## MFD-1417 React evidence

`tests/consumers/react` proves React can consume VyrnForge through the intended
first-class public package from packed artifacts. The fixture imports
components, component types, and styles from `@vyrnforge/ui-components` only.
It does not carry a Custom Element JSX declaration shim, generated local native
wrappers, explicit element registration, or direct native-package imports.

Evidence covers clean packed installation, TypeScript typecheck, production
Vite output, SSR-safe import, canonical-backed runtime behavior, controlled
React state, keyboard interaction, and accessibility checks.

## CF-7008 declaration and metadata evidence

The native package separately exposes:

- `VyrnForgeHTMLElementTagNameMap`;
- global `HTMLElementTagNameMap` augmentation for all 58 public tags;
- `VyrnForgeElementForTagName<TTagName>`;
- typed canonical event listener overloads on `VyrnForgeElement`;
- `customElements: "./custom-elements.json"` in package metadata;
- the public `@vyrnforge/ui-elements/custom-elements.json` export.

`scripts/generate-ui-elements-manifest.mjs` generates the editor-facing
Custom Elements Manifest from the deterministic registry and component
metadata. `npm run verify:consumer-foundations` rejects drift between the
registry, declarations, manifest, fixture claims, and program metadata.

## Required commands

```bash
npm run test:consumer-foundations
npm run verify:consumer-foundations
npm run verify:consumer-foundations:runtime
npm run test:angular-consumer
npm run verify:angular-consumer
npm run verify:angular-consumer:runtime
npm run test:vue-consumer
npm run verify:vue-consumer
npm run verify:vue-consumer:runtime
npm run verify:packages
npm run quality
```

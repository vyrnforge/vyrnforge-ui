# Consumer Foundation Contracts

CF-7001, CF-7002, and CF-7008 establish the first runtime evidence inside
S7 / GMF4. The canonical machine-readable record is
`docs/metadata/consumer-foundations.json`.

## Scope

This batch verifies two packed-package consumers:

- native HTML with no framework runtime;
- React 19 consuming `@vyrnforge/ui-elements` directly.

Angular is now verified separately by CF-7003 and
`docs/metadata/angular-consumer.json`. Vue remains an architecture fixture until
its runtime task is complete. The data grid remains outside the non-grid beta
gate.

## Clean package rule

Runtime fixtures install npm tarballs for:

```text
@vyrnforge/ui-core
@vyrnforge/ui-behaviors
@vyrnforge/ui-elements
```

Installed packages must be ordinary files under each fixture's
`node_modules`, not workspace symlinks. Consumer source must not use
`packages/*/src`, TypeScript path aliases, or repository-relative imports.

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

## CF-7002 React evidence

`tests/consumers/react` proves React 19 can consume native VyrnForge
elements directly from packed packages. The application owns its JSX
declaration adapter, so `@vyrnforge/ui-elements` remains independent from
React.

Evidence covers typed refs, non-scalar property assignment, explicit
registration, canonical DOM listeners, production output, and Chromium
interaction. `@vyrnforge/ui-components` remains the recommended first-class
React renderer.

## CF-7008 declaration and metadata evidence

The package exposes:

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
npm run verify:packages
npm run quality
```

GMF4 remains in progress. CF-7003 adds Angular runtime evidence; Vue,
cross-framework form adapters, compatibility documentation, and final gate
sign-off remain S7 work.

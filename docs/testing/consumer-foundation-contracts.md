# Consumer Foundation Contracts

The consumer foundation contracts establish clean packed runtime evidence for
VyrnForge's framework surfaces. The canonical machine-readable record is
`docs/metadata/consumer-foundations.json`.

## Scope

The consumer foundation verifies clean packed consumption for:

- Native HTML through `@vyrnforge/ui-elements`;
- React through the public `@vyrnforge/ui-components` package;
- Angular through the public `@vyrnforge/ui-angular` package;
- Vue through the public `@vyrnforge/ui-vue` package.

Angular and Vue remain adapters over the canonical Custom Element implementation;
they do not create independent VyrnForge renderers. The data grid remains
outside the non-grid beta gate.

## Clean package rule

Verification packs the VyrnForge packages needed to exercise each surface.
Installed artifacts must be ordinary files under each fixture's `node_modules`,
not workspace symlinks. Consumer source must not use `packages/*/src`,
TypeScript path aliases, repository-relative imports, fixture-local generated
facade copies, or application-owned wrappers that duplicate package behavior.

For the React fixture, normal application code imports only
`@vyrnforge/ui-components` and its public stylesheet. Shared implementation
packages may be installed transitively, but React application code must not
import, register, or type against private implementation paths.

For the Angular and Vue fixtures, normal application code consumes the public
framework package and package-owned generated facade. `@vyrnforge/ui-elements`
remains the canonical runtime dependency and an explicit interoperability escape
hatch, not a reason to recreate framework adapters in each consumer.

## Native HTML evidence

`tests/consumers/native-html` proves:

1. explicit `@vyrnforge/ui-elements/register` registration;
2. shared core and native CSS imports;
3. typed `document.createElement` and literal `querySelector` results;
4. typed canonical `vf-*` events;
5. property-only array models;
6. slots and Light DOM composition;
7. `ElementInternals` form submission;
8. production Vite output and Chromium interaction.

## React evidence

`tests/consumers/react` proves React can consume VyrnForge through the intended
first-class public package from packed artifacts. The fixture imports
components, component types, and styles from `@vyrnforge/ui-components` only.
It does not carry a Custom Element JSX declaration shim, generated local native
wrappers, explicit element registration, or direct native-package imports.

Evidence covers clean packed installation, TypeScript typecheck, production
Vite output, SSR-safe import, canonical-backed runtime behavior, controlled
React state, keyboard interaction, and accessibility checks.

## Angular evidence

`tests/consumers/angular` verifies the packed `@vyrnforge/ui-angular` package,
package-owned registration, generated component coverage, typed inputs/outputs,
composition, native form participation, Angular Forms integration where
applicable, SSR safety, production build, and Chromium interaction. Fixture-local
CVA/directive copies are not the supported path after package cutover.

## Vue evidence

`tests/consumers/vue` verifies the packed `@vyrnforge/ui-vue` package and the
normal `VyrnForgeVue` facade path. Evidence covers generated component/type
coverage, Vue `v-model` mappings, typed emits, named slots, typed refs and
imperative methods, native form participation, SSR-safe import/server rendering,
strict `vue-tsc`, production Vite output, Chromium interaction, and automated
accessibility behavior. Fixture-local generated wrappers and model adapters are
not the supported application path after package cutover.

## Declaration and metadata evidence

The native package separately exposes:

- `VyrnForgeHTMLElementTagNameMap`;
- global `HTMLElementTagNameMap` augmentation for all public tags;
- `VyrnForgeElementForTagName<TTagName>`;
- typed canonical event listener overloads on `VyrnForgeElement`;
- `customElements: "./custom-elements.json"` in package metadata;
- the public `@vyrnforge/ui-elements/custom-elements.json` export.

Framework packages add their own package-owned generated TypeScript surface
without moving canonical component metadata or rendering ownership out of the
shared/native foundations.

`scripts/generate-ui-elements-manifest.mjs` generates the editor-facing Custom
Elements Manifest from the deterministic registry and component metadata.
Repository verifiers reject drift between the registry, declarations, manifests,
framework generators, fixture claims, and program metadata.

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

Repository automation covers browser and accessibility evidence, but this
contract does not itself claim completion of manual assistive-technology review
or external trusted-publisher configuration.

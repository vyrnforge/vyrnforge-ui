# Contributing to VyrnForge

VyrnForge is a clean-slate rebuild inside an existing repository. Canonical architecture and standards live in the connected VyrnForge Google Drive documentation; repository code is implementation evidence, and `packages/legacy` is historical reference only.

## Before implementation

1. Read the smallest relevant canonical architecture, standard, and component documents.
2. Inspect the current active repository surface before making implementation claims.
3. Identify the reusable capability and whether it belongs in a shared contract, Core, Web, a framework port, documentation, or repository-only tooling.
4. Reuse an approved foundation when it is correct. Do not preserve a legacy abstraction merely because it already exists.
5. Define observable acceptance evidence before considering the change complete.

## Setup and tooling

Use the Node/npm versions declared by `.node-version`, `.nvmrc`, and the root `package.json`, then install the locked workspace with `npm ci --ignore-scripts --no-audit --no-fund`.

Common commands:

- `npm run build` — build all seven active packages in dependency order.
- `npm run build:docs` — build packages plus the documentation site and executable examples.
- `npm run lint:tooling`, `npm run lint:web-css`, and the package-scoped lint commands — validate authoring surfaces.
- `npm run generate:tokens` — regenerate browser-facing token CSS from the repository-owned token source.
- `npm run verify:tokens` — fail when generated token CSS has drifted.
- `npm run verify:foundation-readiness` — check the current foundation baseline and its recorded evidence.
- `npm run check:changed:plan` — inspect the validation plan selected from local changes.
- `npm run check:changed` — execute the targeted local validation plan.
- `npm run check` — execute the broader main-tier validation graph.
- `npm run test:visual:foundation` — run the deterministic Chromium visual-regression fixture for the foundation design language.

Do not bypass a failing verifier by weakening the verifier unless the canonical architecture itself has deliberately changed.

## Package boundaries

The active public package graph is:

- `@vyrnforge/core` — DOM-free renderer-neutral semantic types and genuinely portable logic.
- `@vyrnforge/web` — canonical CSS, tokens/themes at runtime, and narrow shared browser foundations.
- `@vyrnforge/icons` — optional official authored glyph catalog that builds on Web's icon definition contract.
- `@vyrnforge/react`, `@vyrnforge/angular`, `@vyrnforge/vue`, `@vyrnforge/elements` — sibling idiomatic ports depending only on Core and Web.

Do not introduce sibling-port dependencies, cycles, a universal component controller/runtime, framework-specific shared contracts, port-local visual systems, or application business architecture. Repository component folders are ownership and validation boundaries; they do not create additional public npm packages.

## Product ownership and testing

Architectural policy is explicit; normal product instances are discovered. Framework component implementations live under `packages/<port>/src/components/<component>/`, with package-local evidence under `packages/<port>/test/components/<component>/`. Shared component docs, examples, cross-port/browser evidence, and unreleased changes live under `components/<component>/`.

Reusable package-owned units may live under `packages/<package>/src/capabilities/`, `src/accessibility/`, or `src/foundations/` when that package is the correct architectural owner, with mirrored evidence under `packages/<package>/test/<kind>/`. Do not add per-instance CI mappings or a central component testing registry. Public exports, conventional ownership, and source dependencies drive discovery.

Canonical component contracts own behavioral scenarios. Use real browsers for browser-owned behavior. Automated accessibility scanning complements rather than replaces keyboard/focus/browser behavior and assistive-technology evidence. Put evidence at the lowest owner that actually proves the behavior rather than centralizing unrelated tests in generic tooling folders.

Foundation-wide visual regression is repository-owned evidence under `tooling/visual/` because it proves the shared design-language output rather than one component. Component-specific visual evidence should remain with the component when introduced.

## Documentation and changes

Framework-neutral foundation content is authored once under shared documentation sources and composed into framework experiences. Framework guides own only framework-specific installation/API/integration guidance. Component documentation and executable examples are component-owned and discovered from `components/<component>/`. An unimplemented framework must be shown as unavailable rather than implied to work.

Implementation changes to a component or reusable scoped unit require a matching unreleased change fragment beside that owner. Use `major`, `minor`, or `patch` for consumer-visible release significance and `internal` for repository-only changes. The fragment records change meaning; it must not contain a hand-maintained list of CI jobs. Release tooling composes the centralized changelog from scoped fragments.

## CI and validation

Pull requests use dependency-derived validation. Changed paths resolve to the most specific discovered owner, then reverse dependency closure selects applicable evidence. Package builds, packing, and consumer checks may execute as prerequisites without making unrelated sibling product units selected evidence. Review the validation-plan artifact instead of assuming every test should run.

- PR: targeted affected evidence plus small global architecture sentinels.
- `main`: broader package, consumer, documentation, integration, and foundation visual assurance.
- scheduled: expensive cross-browser/compatibility/accessibility evidence plus the foundation visual baseline.
- release: complete required release graph, not merely the PR selection.

Unknown or unclassified changes intentionally fail closed and broaden validation. Do not encode large path-condition matrices in workflow YAML.

## Completion

Code alone is not completion. A change is complete only when the applicable contract, accessibility/interaction behavior, tests, package/public entrypoints, docs/examples, styling/token behavior, consumer verification, SSR/browser evidence, visual evidence where relevant, and migration/release implications are resolved or explicitly documented as non-applicable/deferred.

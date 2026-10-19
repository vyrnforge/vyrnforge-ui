# Contributing to VyrnForge

VyrnForge is a clean-slate rebuild inside an existing repository. Canonical architecture and standards live in the connected VyrnForge Google Drive documentation; repository code is implementation evidence, and `packages/legacy` is historical reference only.

## Before implementation

1. Read the smallest relevant canonical architecture, standard, and component documents.
2. Inspect the current active repository surface before making implementation claims.
3. Identify the reusable capability and whether it belongs in a shared contract, Core, Web, a framework port, documentation, or repository-only tooling.
4. Reuse an approved foundation when it is correct. Do not preserve a legacy abstraction merely because it already exists.
5. Define observable acceptance evidence before considering the change complete.

## Package boundaries

The active public package graph is:

- `@vyrnforge/core` — DOM-free renderer-neutral semantic types and genuinely portable logic.
- `@vyrnforge/web` — canonical CSS, tokens/themes at runtime, and narrow shared browser foundations.
- `@vyrnforge/react`, `@vyrnforge/angular`, `@vyrnforge/vue`, `@vyrnforge/elements` — sibling idiomatic ports depending only on Core and Web.

Do not introduce sibling-port dependencies, cycles, a universal component controller/runtime, framework-specific shared contracts, port-local visual systems, or application business architecture.

## Testing layout

Canonical component contracts own behavioral scenarios. Repository evidence lives under `testing/` by layer: renderer-neutral contract evidence, framework-port integration, real-browser behavior, visual evidence, and SSR/hydration evidence when those layers genuinely apply. The component registry is an ownership/status index, not a behavioral DSL.

Use real browsers for browser-owned behavior. Automated accessibility scanning complements rather than replaces keyboard/focus/browser behavior and assistive-technology evidence. Do not create meaningless visual baselines or fake SSR fixtures for unsupported framework/runtime combinations.

## Documentation

Framework-neutral content is authored once under shared documentation sources and composed into framework experiences. Framework guides own only framework-specific installation/API/integration/examples. Public examples must eventually compile/run against the supported package version. An unimplemented framework must be shown as unavailable rather than implied to work.

## CI and validation

Pull requests use dependency-derived validation. The product graph identifies affected areas; the validation graph selects required evidence; prerequisites are expanded and deduplicated by the executor. Review the uploaded validation-plan artifact instead of assuming every test should run.

- PR: targeted affected evidence plus small global architecture sentinels.
- `main`: broader package, consumer, documentation, and integration assurance.
- scheduled: expensive cross-browser/compatibility/visual/accessibility evidence as those scopes exist.
- release: complete required release graph, not merely the PR selection.

Unknown or unclassified changes intentionally fail closed and broaden validation. Do not encode large path-condition matrices in workflow YAML.

## Completion

Code alone is not completion. A change is complete only when the applicable contract, accessibility/interaction behavior, tests, package/public entrypoints, docs/examples, styling/token behavior, consumer verification, SSR/browser evidence, and migration/release implications are resolved or explicitly documented as non-applicable/deferred.

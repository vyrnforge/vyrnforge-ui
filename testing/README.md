# VyrnForge repository testing layout

This directory defines where component validation evidence lives and how impact-aware CI selects that evidence. It is repository-only infrastructure and is not a public `@vyrnforge/testing` package.

The canonical component contract owns behavioral scenarios. Tests execute those scenarios at the lowest reliable layer and then add port, browser, package, consumer, accessibility, visual, or SSR evidence only when the affected capability requires it.

## Metadata and CI ownership

`testing/impact.json` is the repository-level impact map. It declares package/documentation/tooling ownership, dependency direction, global sentinels, broad fail-closed paths, and the broader main/scheduled/release tiers.

`testing/components/registry.json` is the component evidence registry. A component entry declares only durable metadata needed for selection: implemented ports, owned implementation paths, component documentation paths, type-contract evidence, SSR evidence, and browser evidence. It is not a behavioral DSL.

PR validation derives its plan from changed paths plus this metadata. A changed component implementation or component-owned test path selects that component, the owning package, downstream dependents, and only the evidence needed for that impact closure. Unknown paths, CI metadata changes, or repository-wide testing metadata changes fail closed to broad validation.

Main, scheduled, and release validation remain intentionally broader than PR selection. They are independent safety nets against mistakes in impact metadata or selectors.

## Layers

- `contracts/` — renderer-neutral pure logic and canonical scenario evidence.
- `ports/` — framework-specific integration evidence. Framework syntax stays local to each port.
- `browser/` — real-browser interaction, keyboard, focus, form, and browser-owned behavior evidence.
- `visual/` — meaningful visual regression baselines and review metadata once a component has stable rendered states.
- `ssr/` — server import/render/hydration/activation fixtures once a supported framework/runtime combination exists.
- `components/registry.json` — component ownership and evidence-selection metadata.
- `impact.json` — repository ownership, dependency, tier, and fail-closed impact metadata.

A component is not considered validated merely because one layer passes. Its contract/specification determines the evidence scopes that apply. Unimplemented framework ports remain absent from implemented evidence; tests must not manufacture parity by testing empty scaffolds.

When adding a component, extend the registry and add real evidence files. Do not add component names to the CI planner, validation scope table, or GitHub Actions workflow. If new component work requires editing those places, the testing abstraction is probably missing a reusable capability.

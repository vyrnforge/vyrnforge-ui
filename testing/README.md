# VyrnForge repository testing layout

This directory defines reusable validation layers and repository-level impact policy. It is repository-only infrastructure and is not a public `@vyrnforge/testing` package.

The canonical component contract owns behavioral scenarios. Tests execute those scenarios at the lowest reliable layer and then add port, browser, package, consumer, accessibility, visual, or SSR evidence only when the affected capability requires it.

## Discovery and CI ownership

`testing/impact.json` is the repository-level impact map. It declares package/documentation/tooling ownership, dependency direction, global sentinels, broad fail-closed paths, and the broader main/scheduled/release tiers.

Components are not manually registered for testing. `tooling/testing/discover-components.mjs` derives component surfaces from product truth that must already exist to ship them: framework package exports, Web component-style exports, component documentation routes, executable example directories, and conventional implementation source paths.

Discovery then derives conventional evidence locations for type contracts, SSR tests, browser runners, fixture builders, browser configs, and browser test directories. `verify:testing-structure` fails when a discovered public component is not fully prepared. This makes forgetting testing setup a CI error instead of silently excluding the component from validation.

A top-level framework source module that looks like a component but is not exported is also rejected. Shared/internal implementation modules must be placed under `src/internal/` or use an `_` prefix so discovery does not mistake accidental unexported component work for an intentional private surface.

PR validation derives its plan from changed paths plus discovered ownership. A changed component implementation or component-owned test path selects that component, the owning package, downstream dependents, and only the evidence needed for that impact closure. Unknown paths, CI infrastructure changes, or repository-wide impact metadata changes fail closed to broad validation.

Main, scheduled, and release validation remain intentionally broader than PR selection. They are independent safety nets against mistakes in discovery or selectors.

## Conventional component preparation

For a public component `<id>`, the repository derives applicable evidence instead of asking for a central registry entry. Examples of the conventions are:

- framework public export `./<id>` with implementation at `packages/<framework>/src/<id>.*` or `packages/<framework>/src/<id>/`;
- Web styling export `./styles/<id>.css` with source at `packages/web/src/styles/<id>.css`;
- docs route `components/<id>` in `documentation/site/registry.json`;
- at least one executable `examples/<id>/**/example.json`;
- type contract `tooling/types/<id>-api.ts` when framework ports exist;
- SSR evidence `tooling/tests/<id>-<framework>.test.mjs` for SSR-capable framework ports;
- browser preparation `tooling/browser/run-<id>.mjs`, `build-<id>-fixtures.mjs`, `<id>.config.mjs`, and `<id>-tests/`.

The exact conventions can evolve, but omission detection is mandatory: making a new public component visible must automatically make its required evidence visible to CI.

## Layers

- `contracts/` — renderer-neutral pure logic and canonical scenario evidence.
- `ports/` — framework-specific integration evidence. Framework syntax stays local to each port.
- `browser/` — real-browser interaction, keyboard, focus, form, and browser-owned behavior evidence.
- `visual/` — meaningful visual regression baselines and review metadata once a component has stable rendered states.
- `ssr/` — server import/render/hydration/activation fixtures once a supported framework/runtime combination exists.
- `impact.json` — repository ownership, dependency, tier, and fail-closed impact metadata.

A component is not considered validated merely because one layer passes. Its contract/specification determines the evidence scopes that apply. Unimplemented framework ports remain absent from implemented evidence; tests must not manufacture parity by testing empty scaffolds.

When adding a component, expose the real product surface and add evidence in the conventional locations. Do not edit a central component test registry, add component names to the CI planner, add component-specific validation scopes, or add GitHub Actions path rules. If a genuinely new reusable evidence capability is required, extend the discovery/execution infrastructure once and cover that capability with selector tests.

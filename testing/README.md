# VyrnForge repository testing layout

This directory defines where component validation evidence lives. It is repository-only infrastructure and is not a public `@vyrnforge/testing` package.

The canonical component contract owns behavioral scenarios. Tests execute those scenarios at the lowest reliable layer and then add port, browser, package, consumer, accessibility, visual, or SSR evidence only when the affected capability requires it.

## Layers

- `contracts/` — renderer-neutral pure logic and canonical scenario evidence.
- `ports/` — framework-specific integration evidence. Framework syntax stays local to each port.
- `browser/` — real-browser interaction, keyboard, focus, form, and browser-owned behavior evidence.
- `visual/` — meaningful visual regression baselines and review metadata once a component has stable rendered states.
- `ssr/` — server import/render/hydration/activation fixtures once a supported framework/runtime combination exists.
- `components/registry.json` — small ownership/status index, not a behavioral DSL.

A component is not considered validated merely because one layer passes. Its contract/specification determines the evidence scopes that apply. Unimplemented framework ports remain `not-implemented`; tests must not manufacture parity by testing empty scaffolds.

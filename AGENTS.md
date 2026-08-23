# AGENTS.md - VyrnForge UI

## Project

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth.

It is one contract-driven UI system for common web applications and
sophisticated enterprise/data-heavy experiences. Native HTML, React, Angular,
and Vue are the approved first-class web support target, while current package
manifests and release metadata remain authoritative for what is actually shipped.
The architecture should remain capable of adding future justified web frameworks
without rebuilding VyrnForge as another independent component library.

Current packages:

- `@vyrnforge/ui-core` — framework-neutral design foundation;
- `@vyrnforge/ui-behaviors` — framework-neutral controllers and behavior;
- `@vyrnforge/ui-components` — first-class React package;
- `@vyrnforge/ui-elements` — first-class native HTML Custom Element package;
- `@vyrnforge/ui-data-grid` — specialized React data grid on an independent
  alpha track.

Do not treat this repository as only a data-grid project or as an
enterprise-only component catalog.

## Required reading

1. `.ai/AI_CONTEXT.md`
2. `docs/README.md`
3. `docs/governance/01-project-source-of-truth.md` for product identity/scope
4. the relevant package doc under `docs/packages/`
5. the relevant API doc under `docs/api/`
6. relevant canonical metadata under `docs/metadata/`
7. relevant architecture docs under `docs/architecture/`
8. the active roadmap/tracker when planning work

`docs/README.md` is the single documentation entrypoint. Do not create competing
sources of truth for project identity, package boundaries, state policy,
styling, roadmap, release, component status, framework support, or AI guidance.

## Reuse rule

Before adding custom UI, determine whether an existing VyrnForge component,
primitive, utility, behavior, token, contract, generator, pattern, package, or
extension point can be reused or extended.

Prefer solving cross-framework capabilities once in shared contracts, behavior,
metadata, or generation rather than creating unrelated framework-specific
solutions.

Sophisticated reusable UI is valid VyrnForge scope when it is primarily about
how users see, enter, navigate, manipulate, or visualize application information.
Heavy capabilities should remain optional and must not force their runtime,
dependencies, CSS, or setup on consumers that do not use them.

Do not invent future package names, public APIs, or dependency edges without
checking current repository architecture and an approved decision.

## Dependency rules

Do not add these by default:

- Redux / React Redux / RTK Query
- Zustand
- Pinia / NgRx
- TanStack Table / Query / Virtual
- MUI / Ant Design / Chakra / Mantine
- Radix / Headless UI
- Tailwind
- styled-components / Emotion
- large icon, charting, 3D, or CSS frameworks as required shared dependencies

Small focused dependencies require clear value without compromising portability,
framework independence, bundle isolation, or native ownership. Optional advanced
modules may integrate external engines through explicit adapters when VyrnForge
should own the UI contract but not the underlying runtime/domain engine.

## Package boundaries

Current package dependency directions are canonical in
`docs/architecture/01-package-boundaries.md` and `docs/metadata/packages.json`.
Do not infer future package topology from long-term scope.

Current rules include:

- `ui-core` depends on no VyrnForge package or framework runtime.
- `ui-behaviors` may depend on `ui-core` only and remains framework/DOM neutral.
- `ui-components` may depend on `ui-core` and `ui-behaviors`; not on
  `ui-elements` or `ui-data-grid`.
- `ui-elements` may depend on `ui-core` and `ui-behaviors`; not on React,
  Angular, Vue, `ui-components`, or `ui-data-grid`.
- `ui-data-grid` may depend on `ui-core` and `ui-components`.

## Styling

- Static styling belongs in CSS.
- Shared classes use `vf-*`.
- Grid classes use `udg-*`.
- Shared variables use `--vf-*`.
- Grid-specific variables use `--udg-*`.
- Prefer existing shared tokens before introducing new visual values.
- General-purpose, enterprise, light, dark, density, motion, and accessibility
  variants should share semantic token roles rather than create parallel design
  systems.

## State and application ownership

- No required global store inside VyrnForge packages.
- Preserve controlled/uncontrolled contracts.
- Applications own backend rows/data, auth, permissions, routing, persistence,
  business validation, and business workflow execution.
- VyrnForge may own reusable workflow UI, chart UI, tree UI, form UI, or other
  sophisticated interaction surfaces without owning the application's runtime
  semantics.
- Persistence, server-query, export, BI, rendering-engine, and other external
  integrations use explicit adapters where appropriate.

## Multi-framework rule

React, Native HTML, Angular, and Vue are the approved first-class web support
target. Support status is a consumer guarantee, not a requirement for four
independent implementations.

Use canonical contracts and generated/thin integration by default. Framework
correctness, public typing, accessibility, SSR behavior, forms, composition,
refs, and performance take precedence over eliminating all implementation
differences. Use the accepted framework-exception policy for narrow,
evidence-backed exceptions.

Do not claim target packages are current until package manifests, release
metadata, real packed consumer evidence, and gates support that claim.

Future frameworks require an explicit requirement, implementation, compatibility
policy, documentation, and verification. Do not hard-code assumptions that the
current four surfaces are the permanent architectural ceiling when a generic
contract model is practical.

## Human + AI developer experience

VyrnForge is designed for both human developers and AI systems that generate,
analyze, migrate, or maintain UI.

- Canonical metadata should own purpose, use/avoid guidance, props/models/events,
  composition, accessibility, framework mappings, limitations, and related
  components.
- Generate concise AI context from canonical metadata rather than hand-writing a
  second component documentation system.
- Prefer bounded task-specific context so AI consumers do not need the full
  library catalog for small implementation tasks.
- Keep terminology and framework mappings consistent across human docs,
  generators, tests, and AI context.

## Validation

Use targeted checks while implementing. The normal root command surface is:

```bash
npm run check
npm run test
npm run build
npm run ci
```

`npm run ci` is the complete local equivalent of current main-branch
validation. CI/CD changes must preserve the stable `ci-gate`, read-only normal
CI, and separate Pages, npm OIDC, registry-verification, and repository-write
permission boundaries.

Do not mark tasks or gates complete until acceptance criteria and required
evidence pass. When CI fails, inspect and fix the cause rather than only
explaining the failure.

## Documentation

When public behavior changes, update the canonical API/package docs and
structured metadata that own that behavior. Do not hand-maintain duplicate
component lists, route inventories, framework status, AI component catalogs, or
machine-readable copies of information already owned elsewhere.

Follow `docs/governance/02-document-lifecycle.md` when replacing documentation.
Archive material only when it retains audit, migration, regression, or
architectural value. Delete obsolete one-time prompts, task instructions,
reproducible copies, and duplicate guidance when they have no continuing value.

Before deleting or moving a document, check repository references and
`apps/docs/src/docsRegistry.ts` so the documentation build is not left with a
stale import.

## Licensing

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Do not
describe it as open source or broaden production/commercial/redistribution
rights beyond `LICENSE` and the commercial licensing guidance.

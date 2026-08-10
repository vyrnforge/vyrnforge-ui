# AGENTS.md - VyrnForge UI

## Project

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation.

Packages:

- `@vyrnforge/ui-core` â€” framework-neutral design foundation;
- `@vyrnforge/ui-behaviors` â€” framework-neutral controllers and behavior;
- `@vyrnforge/ui-components` â€” first-class React renderer;
- `@vyrnforge/ui-elements` â€” first-class native HTML Custom Element renderer;
- `@vyrnforge/ui-data-grid` â€” specialized React data grid on an independent
  alpha track.

Do not treat this repository as only a data-grid project.

## Required reading

1. `.ai/AI_CONTEXT.md`
2. `docs/README.md`
3. the relevant package doc under `docs/packages/`
4. the relevant API doc under `docs/api/`
5. relevant canonical metadata under `docs/metadata/`
6. relevant architecture docs under `docs/architecture/`

`docs/README.md` is the single documentation entrypoint. Do not create competing
sources of truth for project identity, package boundaries, state policy,
styling, roadmap, release, or component status.

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
- large icon or CSS frameworks

Small focused dependencies require clear value without compromising portability
or framework independence.

## Package boundaries

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

## State and application ownership

- No required global store inside VyrnForge packages.
- Preserve controlled/uncontrolled contracts.
- Applications own backend rows, auth, permissions, routing, and business
  workflows.
- Persistence, server-query, and export integrations use explicit adapters.

## Multi-framework rule

React and native HTML are first-class web renderers. Angular and Vue are
verified consumers of `@vyrnforge/ui-elements` through thin framework
integrations. Do not create independent Angular/Vue component libraries or
resume broad multi-framework grid work without an approved requirement.

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

## Documentation

When public behavior changes, update the canonical API/package docs and
structured metadata that own that behavior. Do not hand-maintain duplicate
component lists.

If documentation is replaced, archive it under
`docs/archive/<yyyy-mm-topic>/` with a replacement note.

## Licensing

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Do not
describe it as open source or broaden production/commercial/redistribution
rights beyond `LICENSE` and the commercial licensing guidance.

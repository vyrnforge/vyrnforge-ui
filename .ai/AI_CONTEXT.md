# VyrnForge UI - AI Context

## Project identity

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth.

It supports common web application UI as well as sophisticated administration,
IAM, workflow, reporting, dashboard, data-heavy, and enterprise experiences.
Enterprise capability is a first-class strength, not the boundary of the
library's intended audience.

VyrnForge is not only a component package or data grid. It is one
contract-driven UI system spanning design, behavior, accessibility, framework
integration, tooling, and optional advanced UI capabilities.

Use `docs/README.md` as the canonical documentation entrypoint and
`docs/governance/01-project-source-of-truth.md` for canonical product identity
and long-term scope.

## Human + AI developer mission

VyrnForge is designed for both human developers and AI software-development
systems.

Repository-maintenance AI guidance in this file is not a separate product truth.
Consumer-facing AI context must derive from canonical component/contracts,
metadata, patterns, framework mappings, and generated references.

When implementing or recommending VyrnForge UI:

- prefer existing VyrnForge components, primitives, utilities, behaviors,
  contracts, tokens, patterns, or extension points before inventing new UI;
- use canonical metadata such as purpose, `useWhen`, `avoidWhen`, accessibility
  notes, framework mappings, and `aiUsageNotes` when available;
- do not infer missing public APIs from framework implementation internals;
- keep generated AI guidance concise and task-scoped rather than requiring the
  complete library context for a small task;
- do not hand-maintain duplicate AI component descriptions when canonical
  metadata can own the information.

## Package model

| Package                    | Role                                                                                  | Release track     |
| -------------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, density, typography, motion, layers, and utilities. | Non-grid beta     |
| `@vyrnforge/ui-behaviors`  | Framework-neutral controllers and portable behavior.                                  | Non-grid beta     |
| `@vyrnforge/ui-components` | First-class React package.                                                            | Non-grid beta     |
| `@vyrnforge/ui-elements`   | First-class native HTML Custom Element package.                                       | Non-grid beta     |
| `@vyrnforge/ui-data-grid`  | Specialized React data grid.                                                          | Independent alpha |

React, Native HTML, Angular, and Vue are the approved first-class web support
target. Current package manifests and release metadata remain authoritative for
which public framework packages are actually shipped at any point in time.

Future justified frameworks should extend the canonical contract/integration
model rather than trigger another independent VyrnForge implementation.

## Canonical docs

| Topic                         | Source                                                         |
| ----------------------------- | -------------------------------------------------------------- |
| Documentation entrypoint      | `docs/README.md`                                               |
| Project identity and scope    | `docs/governance/01-project-source-of-truth.md`                |
| Vision/scope alignment detail | `docs/roadmap/04-vision-mission-scope-alignment-review.md`     |
| Package boundaries            | `docs/architecture/01-package-boundaries.md`                   |
| Multi-framework support       | accepted ADRs under `docs/architecture/`                       |
| State ownership               | `docs/architecture/02-state-and-adapter-ownership.md`          |
| Styling                       | `docs/architecture/03-theming-and-styling.md`                  |
| Component contracts           | `docs/architecture/09-component-contracts-and-events.md`       |
| Native elements/forms         | `docs/architecture/10-custom-elements-and-form-association.md` |
| Component catalog/maturity    | `docs/metadata/components.json`                                |
| Generated component reference | `docs/generated/component-reference.json`                      |
| Current roadmap               | `docs/roadmap/00-master-roadmap.md`                            |
| Strategic gaps                | `docs/roadmap/02-gap-analysis.md`                              |
| Deferred work                 | `docs/roadmap/03-do-not-build-yet.md`                          |
| Public API                    | `docs/api/README.md`                                           |
| CI/CD                         | `docs/engineering/ci-cd-architecture.md`                       |
| Release process               | `docs/release/README.md`                                       |

## Hard rules

- Reuse or extend existing VyrnForge foundations before adding new UI.
- Keep shared foundations framework-neutral where practical.
- Do not require Redux, Zustand, Pinia, NgRx, TanStack state/query, or another
  application store.
- Do not add large UI/styling frameworks by default.
- Use `--vf-*` shared tokens and `vf-*` shared classes.
- Use `--udg-*` and `udg-*` only for current grid-specific styling unless a
  later architecture decision deliberately generalizes that ownership.
- Keep business data, auth, routing, permissions, backend workflows, and
  application persistence in consuming applications.
- Sophisticated reusable UI is not automatically out of scope. Charting,
  tree/tree-grid, advanced forms, workflow/diagram UI, and spatial UI require
  approved optional-module architecture rather than one-off application forks.
- Do not deep-import package internals.
- Do not create duplicate documentation or manually duplicate component
  catalogs.
- Preserve current-state versus target-state distinctions. Never claim a target
  framework package or advanced module is shipped before implementation and
  release evidence exists.
- Framework-specific implementation exceptions must be narrow, explicit,
  evidence-backed, tested, and tracked through accepted exception policy.

## Dependency direction

Current implemented package directions remain governed by
`docs/architecture/01-package-boundaries.md` and `docs/metadata/packages.json`.
Do not invent future package names or dependency edges solely from long-term
scope.

Current allowed directions include:

- `ui-behaviors -> ui-core`
- `ui-components -> ui-core`
- `ui-components -> ui-behaviors`
- `ui-elements -> ui-core`
- `ui-elements -> ui-behaviors`
- `ui-data-grid -> ui-core`
- `ui-data-grid -> ui-components`

Current forbidden directions include:

- `ui-core -> any VyrnForge package`
- `ui-behaviors -> renderer packages`
- `ui-components <-> ui-elements`
- shared non-grid packages -> `ui-data-grid`

## Advanced capability rule

Before implementing a new advanced capability, determine whether existing
VyrnForge collection, state, overlay, form, accessibility, styling, token,
component, contract, generation, or package foundations can be reused or
extended.

Heavyweight capabilities should be optional and must not impose runtime,
dependency, CSS, or setup cost on consumers that do not use them. External
engines may be integrated through adapters where VyrnForge should own UI but not
the underlying domain/runtime engine.

## Normal validation commands

Use targeted checks while implementing, then the small root command surface as
appropriate:

```bash
npm run check
npm run test
npm run build
npm run ci
```

`npm run ci` is the complete local equivalent of current main-branch
validation. Documentation-only changes should at minimum satisfy the canonical
repository checks and documentation build selected by CI.

Do not mark a task, sprint, gate, package, framework surface, or capability
complete until required acceptance criteria and evidence pass.

## Licensing

VyrnForge UI is source-available under the VyrnForge Source License 1.0, not an
open-source license. See `LICENSE` and
`docs/legal/commercial-licensing.md`.

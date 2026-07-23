# VyrnForge UI - AI Context

## Project Identity

VyrnForge UI is a native-first enterprise UI foundation for internal tools, admin portals, customer portals, data-heavy applications, and workflow systems.

It is not only a data-grid package.

Use `docs/README.md` as the canonical documentation entrypoint.

VyrnForge UI is source-available under the VyrnForge Source License 1.0, not open source. Source inspection, local evaluation, and temporary non-production prototypes are permitted; production use, commercial use, redistribution, package republication, resale, sublicensing, white-labeling, and competing-library use require separate written permission or a separate written commercial license.

## Packages

| Package                    | Owns                                                                                         | Status                                |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| `@vyrnforge/ui-core`       | tokens, themes, density, typography, motion, layers, utilities                               | current; non-grid beta                |
| `@vyrnforge/ui-behaviors`  | controllable state, collections, active items, selection, subscriptions, and behavior events | S5 foundations current; non-grid beta |
| `@vyrnforge/ui-components` | first-class React renderer                                                                   | current; non-grid beta                |
| `@vyrnforge/ui-elements`   | native Custom Element base, registration, events, Light DOM, and future form association     | foundation current; non-grid beta     |
| `@vyrnforge/ui-data-grid`  | UniversalDataGrid and grid-specific behavior                                                 | React alpha; deferred                 |

React and native HTML are first-class beta targets. Angular and Vue require
verified consumer evidence. Mobile-native rendering is outside this program.

## Canonical Docs

| Topic                              | Source                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| Project identity                   | `docs/governance/01-project-source-of-truth.md`                |
| Package boundaries                 | `docs/architecture/01-package-boundaries.md`                   |
| Multi-framework support            | `docs/architecture/adr-004-multi-framework-web-support.md`     |
| Component contracts and events     | `docs/architecture/09-component-contracts-and-events.md`       |
| Native elements and forms          | `docs/architecture/10-custom-elements-and-form-association.md` |
| State and Redux policy             | `docs/architecture/02-state-and-adapter-ownership.md`          |
| Styling and themes                 | `docs/architecture/03-theming-and-styling.md`                  |
| CSS architecture                   | `docs/architecture/06-css-architecture.md`                     |
| Clean code boundaries              | `docs/architecture/04-clean-code-boundaries.md`                |
| Roadmap                            | `docs/roadmap/00-master-roadmap.md`                            |
| Component inventory                | `docs/roadmap/01-component-inventory.md`                       |
| Public API usage                   | `docs/api/README.md`                                           |
| Benchmarks                         | `docs/benchmark/`                                              |
| AI-readable metadata               | `docs/metadata/` and `.ai/COMPONENT_MAP.json`                  |
| CI/CD architecture                 | `docs/engineering/ci-cd-architecture.md`                       |
| Release responsibilities           | `docs/release/release-responsibility-matrix.md`                |
| Controlled implementation workflow | `docs/governance/controlled-implementation-rules.md`           |

## Hard Rules

- Do not add Redux/Zustand/TanStack state inside VyrnForge packages.
- Do not add MUI, AntD, Tailwind, Radix, Headless UI, styled-components, Emotion, or icon libraries by default.
- Keep React as the reference renderer and use browser-native Custom Elements for native HTML.
- Keep static visual styling in CSS, not TSX.
- Use `--vf-*` tokens for shared design.
- Use `--udg-*` variables only for grid-specific styling.
- Keep package CSS split by owner; consumers still import package-level `styles/index.css` files.
- Do not store row data in grid state.
- Do not fetch data inside the grid package.
- Do not generate export files inside the grid package by default.
- Before using a VyrnForge component, token, grid contract, or adapter, check `docs/api/` and `docs/metadata/`.
- Do not use undocumented internal APIs unless explicitly asked.
- Archive outdated docs under `docs/archive/<yyyy-mm-topic>/` instead of leaving duplicate guidance in place.
- Update `docs/metadata/` and `.ai/COMPONENT_MAP.json` when public components, package entry points, CSS imports, state contracts, or AI usage rules change.

## Dependency Direction

Allowed:

- `ui-behaviors -> ui-core`
- `ui-components -> ui-core`
- `ui-components -> ui-behaviors` during controlled S5 migrations
- `ui-elements -> ui-core`
- `ui-elements -> ui-behaviors`
- `ui-data-grid -> ui-core`
- `ui-data-grid -> ui-components`

Forbidden:

- `ui-core -> any VyrnForge package`
- `ui-behaviors -> renderer packages or framework runtimes`
- `ui-components <-> ui-elements`
- shared non-grid packages -> `ui-data-grid`

## Required Validation

Run targeted checks during implementation, then use the repository gate:

```bash
npm run verify:ci
npm run quality
```

For documentation-only changes, run the relevant docs build and
`git diff --check`. CI/CD changes must preserve the stable `ci-gate`, read-only
normal CI, and separate Pages, npm OIDC, registry-verification, and
release-record responsibilities.

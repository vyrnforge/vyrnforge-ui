# VyrnForge UI - AI Context

## Project identity

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation for
internal tools, admin portals, customer portals, data-heavy applications,
workflow systems, reporting interfaces, dashboards, and related enterprise
platforms.

It is not only a data-grid package.

Use `docs/README.md` as the canonical documentation entrypoint.

## Package model

| Package                    | Role                                                                                  | Release track     |
| -------------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, density, typography, motion, layers, and utilities. | Non-grid beta     |
| `@vyrnforge/ui-behaviors`  | Framework-neutral controllers and portable behavior.                                  | Non-grid beta     |
| `@vyrnforge/ui-components` | First-class React renderer.                                                           | Non-grid beta     |
| `@vyrnforge/ui-elements`   | First-class native HTML Custom Element renderer.                                      | Non-grid beta     |
| `@vyrnforge/ui-data-grid`  | Specialized React data grid.                                                          | Independent alpha |

React and native HTML are first-class web renderers. Angular and Vue are
verified consumers of `@vyrnforge/ui-elements`. Their form/model adapters remain
thin integration layers rather than separate component libraries.

## Canonical docs

| Topic                         | Source                                                         |
| ----------------------------- | -------------------------------------------------------------- |
| Documentation entrypoint      | `docs/README.md`                                               |
| Project identity              | `docs/governance/01-project-source-of-truth.md`                |
| Package boundaries            | `docs/architecture/01-package-boundaries.md`                   |
| Multi-framework support       | `docs/architecture/adr-004-multi-framework-web-support.md`     |
| State ownership               | `docs/architecture/02-state-and-adapter-ownership.md`          |
| Styling                       | `docs/architecture/03-theming-and-styling.md`                  |
| Component contracts           | `docs/architecture/09-component-contracts-and-events.md`       |
| Native elements/forms         | `docs/architecture/10-custom-elements-and-form-association.md` |
| Component catalog/maturity    | `docs/metadata/components.json`                                |
| Generated component reference | `docs/generated/component-reference.json`                      |
| Current roadmap               | `docs/roadmap/00-master-roadmap.md`                            |
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
- Use `--udg-*` and `udg-*` only for grid-specific styling.
- Keep business data, auth, routing, permissions, and workflows in consuming
  applications.
- Do not deep-import package internals.
- Do not create duplicate documentation or manually duplicate component
  catalogs.
- Archive replaced historical docs rather than letting them compete with current
  guidance.

## Dependency direction

Allowed:

- `ui-behaviors -> ui-core`
- `ui-components -> ui-core`
- `ui-components -> ui-behaviors`
- `ui-elements -> ui-core`
- `ui-elements -> ui-behaviors`
- `ui-data-grid -> ui-core`
- `ui-data-grid -> ui-components`

Forbidden:

- `ui-core -> any VyrnForge package`
- `ui-behaviors -> renderer packages`
- `ui-components <-> ui-elements`
- shared non-grid packages -> `ui-data-grid`

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

## Licensing

VyrnForge UI is source-available under the VyrnForge Source License 1.0, not an
open-source license. See `LICENSE` and
`docs/legal/commercial-licensing.md`.

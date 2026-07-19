# Contributing To VyrnForge UI

Thanks for helping improve VyrnForge UI. This repository is a native-first, dependency-minimal enterprise React UI foundation, not only a data-grid package.

VyrnForge UI is currently pre-alpha and source-available under the VyrnForge Source License 1.0. Do not describe the project as open source or production-ready in contributor-facing changes.

## Before Contributing

Before starting work:

- Read the root [README.md](README.md) and the relevant source-of-truth docs under [docs/README.md](docs/README.md).
- Search existing issues, components, tokens, utilities, metadata, and playground patterns before adding new surface area.
- Reuse or extend an existing VyrnForge component before creating a one-off implementation.
- Keep changes focused, reviewable, and source-of-truth oriented.
- Avoid duplicate documentation. Update the canonical document instead of creating a competing one.

Useful starting points:

- Project identity: [docs/governance/01-project-source-of-truth.md](docs/governance/01-project-source-of-truth.md)
- Package boundaries: [docs/architecture/01-package-boundaries.md](docs/architecture/01-package-boundaries.md)
- Styling rules: [docs/architecture/03-theming-and-styling.md](docs/architecture/03-theming-and-styling.md)
- CSS architecture: [docs/architecture/06-css-architecture.md](docs/architecture/06-css-architecture.md)
- Accessibility baseline: [docs/architecture/05-accessibility-standards.md](docs/architecture/05-accessibility-standards.md)
- Quality gates: [docs/quality/00-quality-gates.md](docs/quality/00-quality-gates.md)
- Public API rules: [docs/api/public-vs-internal-api.md](docs/api/public-vs-internal-api.md)
- Release governance: [docs/release/README.md](docs/release/README.md)

## Development Setup

Use Node.js `>=24.18 <25`; `.nvmrc` and `.node-version` pin Node `24.18.0` to match GitHub Actions. Use npm `>=11.16 <12`; `packageManager` pins npm `11.16.0`. TypeScript is pinned to `7.0.2` across every workspace. The published packages retain their existing Node `>=22.12 <25` consumer compatibility range because this toolchain migration does not change runtime output requirements.

```bash
git clone https://github.com/vyrnforge/vyrnforge-ui.git
cd vyrnforge-ui
npm install
```

Root scripts currently available:

```bash
npm run build
npm run build:packages
npm run build:docs
npm run build:playground
npm run clean:packages
npm run dev:docs
npm run dev:playground
npm run quality
npm run typecheck
npm run test
npm run verify:consumer
npm run verify:packages
npm run verify:toolchain
```

Do not document or rely on commands that are not present in the root `package.json`.

## Repository Structure

| Path | Responsibility |
| --- | --- |
| `packages/ui-core` | Shared foundation: `--vf-*` CSS variables, themes, density, utilities, and dependency-free theme helpers. |
| `packages/ui-components` | Reusable React primitives and application components using shared `vf-*` component classes. |
| `packages/ui-data-grid` | Enterprise data-management grid, `udg-*` classes, `--udg-*` variables, grid state contracts, and grid adapters. |
| `docs` | Canonical markdown documentation, metadata, architecture, API, quality, roadmap, and archive material. |
| `examples/basic-playground` | Interactive playground source for component and grid examples. |
| `apps/docs` | React documentation viewer over the markdown docs and metadata. |
| `.github` | Repository workflows for CI and Pages build/deploy automation. |
| `scripts` | Repository verification helpers such as package cleanup and package artifact checks. |

Tests currently live beside package source, mostly under `packages/ui-components/src/components/__tests__` and `packages/ui-data-grid/src/**` test files.

## Package Dependency Direction

Package dependencies must stay one-way:

- `@vyrnforge/ui-core` must remain independent.
- `@vyrnforge/ui-components` may depend on `@vyrnforge/ui-core`.
- `@vyrnforge/ui-data-grid` may depend on `@vyrnforge/ui-core` and `@vyrnforge/ui-components`.
- Circular dependencies are not allowed.
- Avoid cross-package internal source imports.
- Use public package entry points instead of deep internal paths.

If a lower-level package needs something from a higher-level package, move the abstraction down or create a dedicated adapter in a separate task.

## Component Contribution Rules

Before adding a component, confirm that:

- An existing component cannot satisfy the use case through props, composition, or a small extension.
- The component has reusable value beyond one product screen.
- The ownership package is clear.
- The public API follows existing VyrnForge naming and controlled/uncontrolled patterns.
- Accessibility behavior is defined.
- Keyboard behavior is defined where applicable.
- States are accounted for where relevant: default, hover, focus, active, disabled, loading, error, empty, and invalid.
- Light, dark, enterprise, compact, standard, and comfortable modes remain usable where applicable.
- Tests, docs, metadata, and playground examples are added or updated.

Prefer native HTML behavior and React composition before adding custom state machinery.

## Public API Discipline

Public APIs should remain framework-native and store-agnostic.

- Do not require Redux, Zustand, or another application store.
- Do not export internal implementation details as app contracts.
- Avoid unnecessary breaking changes.
- Add migration notes for intentional public API changes.
- Keep CSS tokens and public classes stable.
- Use controlled/uncontrolled props for stateful components where appropriate.
- Let consuming applications own backend data, auth, permissions, routing, and business workflows.

Public API includes documented package entry exports, documented props and types, documented CSS imports, documented CSS variables/classes, data-grid state contracts, and adapter contracts.

## Styling Rules

VyrnForge UI uses package CSS and CSS variables.

- Use existing `--vf-*` tokens when an appropriate shared token exists.
- Use `vf-*` classes for shared components.
- Use `--udg-*` variables and `udg-*` classes only for data-grid-specific styling.
- Do not introduce unrelated CSS prefixes.
- Do not hardcode static visual values when shared tokens are available.
- Support light and dark themes.
- Respect density and responsive behavior.
- Avoid application-specific styling in shared packages.
- Avoid inline styles for static theme styling; reserve inline styles for dynamic CSS variables, measured positions, and user-provided `style` props.

Docs app classes use `vf-docs-*`. Playground classes use `vf-playground-*`.

## Accessibility Expectations

Reusable components should target WCAG AA as a baseline.

Review for:

- Keyboard navigation and activation.
- Visible focus states.
- Semantic HTML before ARIA-heavy custom markup.
- Labels and accessible names for controls.
- Screen-reader behavior and live-region behavior where applicable.
- Sufficient contrast in supported themes.
- No color-only state communication.
- Reduced-motion behavior where animation exists.
- Focus management and Escape behavior for overlays.

## Testing Expectations

Run package tests through the root command:

```bash
npm run test
```

Add or update tests for:

- Public behavior and rendering contracts.
- Keyboard interaction.
- Accessibility-relevant behavior.
- Controlled and uncontrolled behavior where applicable.
- Disabled, read-only, invalid, loading, and empty states where applicable.
- Edge cases and regressions.
- Grid state, filtering, sorting, pagination, grouping, selection, persistence, and adapter behavior when changing data-grid logic.

Avoid tests that depend heavily on private implementation details. Prefer testing the public behavior that consuming apps rely on.

## Pull Requests And Repository Infrastructure Issues

Use the focused pull-request template that matches the change responsibility:

- component, package, token, hook, or data-grid work:
  `.github/PULL_REQUEST_TEMPLATE/component-or-package.md`;
- documentation, metadata, docs app, playground, or examples:
  `.github/PULL_REQUEST_TEMPLATE/docs-and-examples.md`;
- CI/CD, Pages, workflow permissions, branch protection, or release automation:
  `.github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md`;
- coordinated package candidates and trusted publication:
  `.github/PULL_REQUEST_TEMPLATE/release.md`;
- dependencies, tooling, cleanup, configuration, or non-runtime maintenance:
  `.github/PULL_REQUEST_TEMPLATE/repository-maintenance.md`.

The compact `.github/pull_request_template.md` remains the automatic fallback
when no focused template is selected. GitHub selects a focused template through
the `template` query parameter. Append a value such as the following to the
compare URL:

```text
?quick_pull=1&template=ci-cd-infrastructure.md
```

Package-specific templates are intentionally not split into three independent
forms because one change may affect upstream and downstream packages. The
component/package template records all affected libraries in one dependency-aware
review. Template selection and author checkboxes are review evidence;
`scripts/detect-ci-scope.mjs` remains authoritative for executed checks.

Use the focused GitHub issue forms:

- product and component defects: `bug.yml`;
- reusable UI proposals: `feature.yml`;
- accessibility concerns: `accessibility.yml`;
- CI, Pages, release automation, branch protection, and repository governance:
  `ci-cd-infrastructure.yml`;
- a specific candidate or published package release problem:
  `release-readiness.yml`.

Do not use the product feature form for workflow redesign. Do not use the
release-readiness form for general CI architecture proposals.

For CI/CD or repository-template changes, run:

```bash
npm run verify:ci
```

During implementation, run only relevant targeted checks. Run the complete
`npm run quality` suite once before merge when full repository validation is
required.

## Continuous Integration

Pull requests targeting `main` and pushes to `main` always run the `VyrnForge
CI` orchestrator. It detects the affected scope and invokes reusable workflows
for quality, package payloads, the packed consumer, documentation, and the
playground.

The long-term required status check is:

```text
ci-gate
```

The compatibility checks `quality` and `external-consumer` remain temporarily
while branch protection migrates to `ci-gate`.

Key behavior:

- docs-only changes build docs without running package runtime tests;
- ui-core changes validate ui-core, ui-components, ui-data-grid, the packed
  consumer, docs, and playground;
- ui-components changes validate components, data-grid, the consumer, docs,
  and playground;
- ui-data-grid changes validate data-grid, the consumer, docs, and playground;
- shared manifests, lockfiles, build scripts, and workflow changes run full CI;
- unknown paths use a safe full-validation fallback.

Useful local commands:

```bash
npm run test:ci-scope
npm run verify:workflows
npm run verify:templates
npm run verify:ci
npm run quality
```

CI uses read-only repository permissions and never publishes, deploys Pages,
creates tags, or creates GitHub Releases. Automatic Pages deployment starts only
after CI succeeds for the current `main` commit. Pages deployment, npm OIDC
publication, registry verification, and release recording are separate jobs or
workflows with narrowly scoped permissions.

See
[docs/engineering/ci-cd-architecture.md](docs/engineering/ci-cd-architecture.md)
and
[docs/release/release-responsibility-matrix.md](docs/release/release-responsibility-matrix.md).

## Documentation Requirements

Changes to public components, APIs, tokens, CSS imports, state contracts, or behavior must update the relevant source-of-truth material.

Update as applicable:

- Package README files.
- API docs under `docs/api/`.
- Component docs under `docs/components/`.
- Metadata under `docs/metadata/`.
- Playground examples under `examples/basic-playground/`.
- Changelog entries when useful for release notes.
- Migration notes for breaking changes.
Use [docs/release/](docs/release/) for release policy, versioning, publication, deprecation, and release-readiness guidance.

Do not duplicate the same detailed documentation in multiple places. Link to the canonical document from [docs/README.md](docs/README.md).

## Contribution Workflow

1. Create a focused branch.
2. Make small, coherent commits.
3. Keep changes scoped to the requested behavior or documentation.
4. Do not commit generated output, environment files, archives, logs, credentials, or `node_modules`.
5. Run all relevant quality checks.
6. Open a pull request.
7. Respond to review feedback with focused follow-up commits.

There is no repository commit-message convention currently documented, so this guide does not require one.

## Pull Request Checklist

Before requesting review, confirm:

- [ ] The change is scoped and coherent.
- [ ] Existing component reuse or extension was considered.
- [ ] Package boundaries are respected.
- [ ] Public package entry points are used instead of internal deep imports.
- [ ] No unnecessary dependency was added.
- [ ] Tests were added or updated where relevant.
- [ ] Documentation and metadata were updated where relevant.
- [ ] Accessibility behavior was reviewed.
- [ ] Theme and density behavior were reviewed.
- [ ] Relevant targeted checks passed during implementation.
- [ ] `npm run verify:ci` passed when infrastructure or repository-template contracts changed.
- [ ] `npm run quality` passed once when full repository validation is required.
- [ ] No sensitive files, generated output, archives, logs, credentials, or `node_modules` were committed.
- [ ] Breaking changes are intentional and documented with migration notes.

## Security Reporting

Do not report security vulnerabilities through a public issue.

Use [SECURITY.md](SECURITY.md) for private vulnerability reporting guidance. Coordinate privately with the repository maintainers before sharing vulnerability details.

## Licensing Status

VyrnForge UI is source-available under the [VyrnForge Source License 1.0](LICENSE), not an open-source license. Source inspection, local evaluation, and temporary non-production prototypes are permitted by that license.

Production use and commercial use require a separate written commercial license. Redistribution, npm or package-registry republication, resale, sublicensing, white-labeling, and use to create or operate a competing UI, component, design-system, or data-grid product are prohibited without separate written permission.

Do not add CLA requirements, license badges, alternative license identifiers, or new licensing claims unless that work is explicitly requested in a dedicated task.

# VyrnForge

VyrnForge is being rebuilt as a native-web-first, framework-neutral UI foundation with idiomatic React, Angular, Vue, Custom Elements, and Native Web surfaces.

## Rebuild status

The repository contains the current rebuild implementation only. Retired implementations remain available through Git history for provenance when needed, but they are not architectural sources of truth or active package dependencies.

The approved active package topology is:

- `@vyrnforge/core`
- `@vyrnforge/web`
- `@vyrnforge/icons`
- `@vyrnforge/react`
- `@vyrnforge/angular`
- `@vyrnforge/vue`
- `@vyrnforge/elements`

Packages remain private while the rebuild foundation is being proven. Framework package scaffolds do not imply component availability or supported framework-version ranges.

## Repository topology

The repository has five primary implementation roots:

- `packages/` — the seven private-rebuild package surfaces and package-owned evidence.
- `product/` — framework-neutral, repository-only product ownership slices for cross-package components: shared docs, examples, accessibility metadata, cross-port/browser evidence, and unreleased component changes. Runtime implementation does not live here.
- `apps/` — runnable repository applications. `apps/docs/` is the documentation application/runtime.
- `documentation/` — authored shared/framework/reference documentation sources that are not owned by one component.
- `tooling/` — repository-only automation, organized by durable function. See `tooling/README.md`.

Do not create new top-level roots for a test type, fixture type, generator, script family, or temporary concern. Repository-only infrastructure belongs under the existing owner that performs that function. Empty placeholder directories are not architecture.

## Tooling model

`tooling/` is the private repository-tooling package for recurring automation that does not belong to a public package, product slice, application, documentation source, or GitHub configuration. Top-level tooling capabilities are need-driven rather than a fixed directory checklist. Each capability owns a local `README.md` describing its responsibility and exclusions; `tooling/README.md` is the placement contract.

Do not add catch-all `scripts/`, `utils/`, `common/`, or placeholder capability directories. Tests for tooling stay with the tooling they prove, reusable quality infrastructure belongs under the appropriate testing owner, and workflow YAML remains orchestration rather than the source of validation policy.

## Foundation authoring

Reference design decisions remain repository-internal under `tooling/tokens/`. Run `pnpm generate:tokens` after changing the token source. `pnpm verify:tokens` and foundation readiness checks ensure the generated `@vyrnforge/web` runtime token CSS is current.

Canonical shared styling is owned by `@vyrnforge/web`. The aggregate `@vyrnforge/web/styles.css` includes tokens, themes, shared foundation styling, and component CSS but intentionally excludes the optional global reset. Consumers can opt into `@vyrnforge/web/styles/reset.css` separately or load granular component styles.

## Validation model

Pull requests do not run an arbitrary full suite. CI classifies changed areas, computes reverse product dependencies, selects required validation evidence, expands execution prerequisites, and uploads the resulting validation plan for inspection. Push-triggered Main validation uses the pushed change range through the same impact graph. Known, classified CI/impact infrastructure follows its explicit owner and evidence closure; a change does not broaden merely because it is infrastructure. Unknown or unclassified changes fail closed and broaden, while shared or genuinely repository-wide infrastructure may legitimately have broad impact. Scheduled and release workflows remain deliberately broad safety nets.

For normal local work, use `pnpm check:changed` to compute the local semantic impact plan and run affected Nx `lint`, `typecheck`, `test`, and `build` targets. Use `pnpm impact:plan` when you only need to inspect the local validation plan, and `pnpm check` for the repository's formatting, unit/build, architecture, package-contract, compatibility, and workflow verifiers. `pnpm check:full` is the explicit exhaustive alias for that repository check.

Use `pnpm test` for the workspace test targets, `pnpm exec vitest --project repository-tooling` for focused repository-tooling tests, `pnpm test:browser` for Chromium browser evidence, and `pnpm test:browser:cross` for the full configured browser matrix. Component type, SSR, and browser runners remain focused debugging interfaces; normal CI validation flows through the impact graph.

Real-browser documentation validation uses Playwright; automated accessibility scans run with axe-core. Packed-package consumer checks install actual tarballs through public entrypoints. Visual and framework-specific SSR/hydration evidence are added only where real rebuilt components and deliberately supported runtimes require them.

## Source of truth

Canonical VyrnForge product architecture, standards, component contracts, framework integration rules, testing/conformance architecture, and documentation architecture live in the connected Google Drive documentation. Repository implementation must conform to that source of truth; discrepancies should be surfaced and resolved deliberately.

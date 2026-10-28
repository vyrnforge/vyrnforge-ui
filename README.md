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

- `packages/` — the seven publishable package surfaces and package-owned evidence.
- `product/` — framework-neutral, repository-only product ownership slices for cross-package components: shared docs, examples, accessibility metadata, cross-port/browser evidence, and unreleased component changes. Runtime implementation does not live here.
- `apps/` — runnable repository applications. `apps/docs/` is the documentation application/runtime.
- `documentation/` — authored shared/framework/reference documentation sources that are not owned by one component.
- `tooling/` — repository-only automation, organized by durable function. See `tooling/README.md`.

Do not create new top-level roots for a test type, fixture type, generator, script family, or temporary concern. Repository-only infrastructure belongs under the existing tooling owner that performs that function. Empty placeholder directories are not architecture.

## Tooling model

`tooling/` has exactly eight top-level functional owners:

- `build/` — repository build orchestration and build-only asset preparation.
- `ci/` — CI operational support such as workflow evidence retention; workflow YAML remains orchestration.
- `docs/` — documentation generation, serving, compilation, and docs-specific browser adapters.
- `impact/` — impact policy, product/validation graph construction, plan selection, and plan execution.
- `release/` — change-fragment discovery and release/changelog composition.
- `testing/` — reusable test/evidence infrastructure, including accessibility, compatibility, performance, and visual harnesses or metadata.
- `tokens/` — repository-owned token authoring and generation.
- `verify/` — executable repository invariants and architecture/public-boundary verification.

A new tooling top-level directory requires a genuinely new repository capability that cannot be owned cleanly by one of these areas. Tests for tooling stay with the tooling they prove.

## Foundation authoring

Reference design decisions remain repository-internal under `tooling/tokens/`. Run `pnpm generate:tokens` after changing the token source. `pnpm verify:tokens` and foundation readiness checks ensure the generated `@vyrnforge/web` runtime token CSS is current.

Canonical shared styling is owned by `@vyrnforge/web`. The aggregate `@vyrnforge/web/styles.css` includes tokens, themes, shared foundation styling, and component CSS but intentionally excludes the optional global reset. Consumers can opt into `@vyrnforge/web/styles/reset.css` separately or load granular component styles.

## Validation model

Pull requests do not run an arbitrary full suite. CI classifies changed areas, computes reverse product dependencies, selects required validation evidence, expands execution prerequisites, and uploads the resulting validation plan for inspection. Push-triggered Main validation uses the pushed change range through the same impact graph. Known, classified CI/impact infrastructure follows its explicit owner and evidence closure; a change does not broaden merely because it is infrastructure. Unknown or unclassified changes fail closed and broaden, while shared or genuinely repository-wide infrastructure may legitimately have broad impact. Scheduled and release workflows remain deliberately broad safety nets.

For normal local work, use `pnpm check:changed`. It compares the current branch and working tree (including untracked files) against `origin/main`, then executes the targeted impact plan. Use `pnpm check:changed:plan` to inspect the execution plan without running it. Set `VF_BASE_REF` or pass `--base-ref` when a different reachable comparison base is required. Use `pnpm check:full` only for deliberate exhaustive repository validation.

Tooling tests are grouped by evidence owner: `pnpm test:impact`, `pnpm test:testing-tooling`, `pnpm test:accessibility-tooling`, and `pnpm test:ci-tooling`. `pnpm test:tooling` runs those repository-tooling suites together. Component type, SSR, and browser runners remain focused debugging interfaces; normal validation should flow through the impact graph.

Real-browser documentation validation uses Playwright; automated accessibility scans run with axe-core. Packed-package consumer checks install actual tarballs through public entrypoints. Visual and framework-specific SSR/hydration evidence are added only where real rebuilt components and deliberately supported runtimes require them.

## Source of truth

Canonical VyrnForge product architecture, standards, component contracts, framework integration rules, testing/conformance architecture, and documentation architecture live in the connected Google Drive documentation. Repository implementation must conform to that source of truth; discrepancies should be surfaced and resolved deliberately.

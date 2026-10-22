# VyrnForge

VyrnForge is being rebuilt as a native-web-first, framework-neutral UI foundation with idiomatic React, Angular, Vue, Custom Elements, and Native Web surfaces.

## Rebuild status

The repository is in foundation bootstrap. The previous implementation is quarantined under `packages/legacy` and is not an architectural source of truth or an active workspace dependency.

The approved active package topology is:

- `@vyrnforge/core`
- `@vyrnforge/web`
- `@vyrnforge/icons`
- `@vyrnforge/react`
- `@vyrnforge/angular`
- `@vyrnforge/vue`
- `@vyrnforge/elements`

Packages remain private while the rebuild foundation is being proven. Framework package scaffolds do not imply component availability or supported framework-version ranges.

## Repository areas

- `packages/` — the seven active package surfaces plus the isolated legacy quarantine.
- `apps/docs/` — public documentation presentation/runtime assets.
- `documentation/` — shared and framework-adaptation public documentation sources.
- `testing/` — repository-only contract, port, browser, visual, SSR, and component validation ownership.
- `fixtures/` — repository-only consumer and validation fixtures.
- `tooling/` — build, token generation, architecture enforcement, impact analysis, documentation generation, and quality infrastructure.

## Foundation authoring

Reference design decisions remain repository-internal under `tooling/tokens/`. Run `npm run generate:tokens` after changing the token source. `npm run verify:tokens` and foundation readiness checks ensure the generated `@vyrnforge/web` runtime token CSS is current.

Canonical shared styling is owned by `@vyrnforge/web`. The aggregate `@vyrnforge/web/styles.css` includes tokens, themes, shared foundation styling, and component CSS but intentionally excludes the optional global reset. Consumers can opt into `@vyrnforge/web/styles/reset.css` separately or load granular component styles.

## Validation model

Pull requests do not run an arbitrary full suite. CI classifies changed areas, computes reverse product dependencies, selects required validation evidence, expands execution prerequisites, and uploads the resulting validation plan for inspection. Main, scheduled, and release workflows deliberately broaden validation at their respective gates.

Real-browser documentation validation uses Playwright; automated accessibility scans run with axe-core. Packed-package consumer checks install actual tarballs through public entrypoints. Visual and framework-specific SSR/hydration evidence are intentionally added only when real rebuilt components and deliberately supported runtimes exist.

## Source of truth

Canonical VyrnForge product architecture, standards, component contracts, framework integration rules, testing/conformance architecture, and documentation architecture live in the connected Google Drive documentation. Repository implementation must conform to that source of truth; discrepancies should be surfaced and resolved deliberately.

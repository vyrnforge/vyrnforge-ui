# Contributing to VyrnForge

VyrnForge is a clean-slate rebuild inside an existing repository. Canonical architecture and standards live in the connected VyrnForge Google Drive documentation; repository code is implementation evidence, and retired implementations in Git history are historical reference only.

## Before implementation

1. Read the smallest relevant canonical architecture, standard, and component documents.
2. Inspect the current active repository surface before making implementation claims.
3. Identify the reusable capability and whether it belongs in a shared contract, Core, Web, a framework port, documentation, product ownership, or repository-only tooling.
4. Reuse an approved foundation when it is correct. Do not preserve a legacy abstraction merely because it already exists.
5. Define observable acceptance evidence before considering the change complete.

## Setup and common commands

Use the Node/npm versions declared by `.node-version`, `.nvmrc`, and the root `package.json`, then install the locked workspace with `pnpm install --frozen-lockfile --ignore-scripts`.

- `pnpm build` — build all seven active packages in dependency order.
- `pnpm build:docs` — build packages plus the documentation site and executable examples.
- `pnpm lint:tooling`, `pnpm lint:web-css`, and package-scoped lint commands — validate authoring surfaces.
- `pnpm generate:tokens` / `pnpm verify:tokens` — generate and verify repository-owned token output.
- `pnpm check:changed:plan` — inspect the validation plan selected from local changes.
- `pnpm check:changed` — execute targeted local validation.
- `pnpm check:full` — deliberately execute the exhaustive broad validation tier.
- `pnpm test:tooling` — test impact, reusable testing, accessibility, and CI tooling.
- `pnpm test:visual:foundation` — run deterministic Chromium foundation visual evidence.

Do not bypass a failing verifier by weakening it unless the canonical architecture itself has deliberately changed.

## Repository topology

Keep the repository root intentionally small:

- `packages/` — seven publishable package surfaces and package-owned evidence.
- `product/` — repository-only framework-neutral product slices spanning packages.
- `apps/` — runnable repository applications, currently the documentation app.
- `documentation/` — shared/framework/reference consumer documentation not owned by one component.
- `tooling/` — repository automation grouped by durable function.

Do not introduce top-level `components/`, `fixtures/`, `testing/`, `scripts/`, `utils/`, or other concern-specific roots. Empty placeholder directories are not architecture.

`tooling/` has eight functional owners: `build/`, `ci/`, `docs/`, `impact/`, `release/`, `testing/`, `tokens/`, and `verify/`. Quality-specific reusable validation infrastructure such as accessibility, compatibility, performance, and repository-wide visual evidence belongs beneath `tooling/testing/`, not as additional tooling roots. See `tooling/README.md` for placement rules.

## Package boundaries

The active public package graph is:

- `@vyrnforge/core` — DOM-free renderer-neutral semantic types and genuinely portable logic.
- `@vyrnforge/web` — canonical CSS, tokens/themes at runtime, and narrow shared browser foundations.
- `@vyrnforge/icons` — optional official authored glyph catalog built on Web's icon definition contract.
- `@vyrnforge/react`, `@vyrnforge/angular`, `@vyrnforge/vue`, `@vyrnforge/elements` — sibling idiomatic ports depending only on Core and Web.

Do not introduce sibling-port dependencies, cycles, a universal component controller/runtime, framework-specific shared contracts, port-local visual systems, or application business architecture. Repository product folders are ownership and validation boundaries; they do not create additional public npm packages.

## Product ownership and testing

Framework component implementations live under `packages/<port>/src/components/<component>/`, with package-local evidence under `packages/<port>/test/components/<component>/`. Shared component docs, examples, accessibility mapping, cross-port/browser evidence, and unreleased changes live under `product/<component>/`.

Reusable package-owned units may live under `packages/<package>/src/capabilities/`, `src/accessibility/`, or `src/foundations/` when that package is the correct architectural owner, with mirrored evidence under `packages/<package>/test/<kind>/`. Do not add per-instance CI mappings or a central component testing registry. Public exports, conventional ownership, and source dependencies drive discovery.

Canonical component contracts own behavioral scenarios. Use real browsers for browser-owned behavior. Automated accessibility scanning complements rather than replaces keyboard/focus/browser behavior and assistive-technology evidence. Put evidence at the lowest owner that actually proves the behavior.

Repository-wide reusable test infrastructure lives under `tooling/testing/`; product-specific evidence does not move there merely because it uses a shared harness. Foundation-wide visual regression is repository-owned testing infrastructure; component-specific visual evidence remains with the component when introduced.

## Documentation and changes

Framework-neutral foundation content is authored once under shared documentation sources and composed into framework experiences. Framework guides own only framework-specific installation/API/integration guidance. Component documentation and executable examples are discovered from `product/<component>/`.

Implementation changes to a component or reusable scoped unit require a matching unreleased change fragment beside that owner. Use `major`, `minor`, or `patch` for consumer-visible release significance and `internal` for repository-only changes. Release tooling under `tooling/release/` composes centralized changelog output from scoped fragments.

## CI and validation

Pull requests and push-triggered Main validation both use dependency-derived validation. Changed paths resolve to the most specific discovered owner, then reverse dependency closure selects applicable evidence. Impact policy and execution live under `tooling/impact/`; GitHub workflow YAML is orchestration only. Known CI/impact infrastructure follows its explicit owner; unknown or unclassified changes fail closed and broaden.

- PR: targeted affected evidence plus small global architecture sentinels.
- push-triggered `main`: targeted affected evidence for the merged push range.
- explicit broad/local `main` tier: deliberate exhaustive verification exposed as `pnpm check:full`.
- scheduled: broad recurring safety net including cross-browser assurance.
- release: broadest release-readiness graph.

Do not encode large path-condition matrices in workflow YAML. A passing scoped run proves its selected and executed evidence; it is not a claim that every repository test ran.

## Completion

Code alone is not completion. A change is complete only when the applicable contract, accessibility/interaction behavior, tests, package/public entrypoints, docs/examples, styling/token behavior, consumer verification, SSR/browser evidence, visual evidence where relevant, and migration/release implications are resolved or explicitly documented as non-applicable/deferred.

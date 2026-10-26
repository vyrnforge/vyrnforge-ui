# VyrnForge repository testing policy

Testing follows product ownership. Architectural policy is explicit; repeated product instances and their evidence are discovered from repository structure and public package surfaces.

The `testing/` directory is intentionally policy-only. It owns this guidance and `testing/impact.json`; it is not a storage location for component, framework, browser, visual, contract, SSR, accessibility, capability, or foundation evidence. Evidence lives beside the product unit or infrastructure that it proves.

`testing/impact.json` defines repository-level package topology, dependency direction, validation tiers, global sentinels, and fail-closed roots. It does not enumerate components, package subpaths, accessibility units, capabilities, or foundations.

## Ownership conventions

A public component `<id>` is represented by a shared ownership slice at `components/<id>/`. Shared docs, executable examples, cross-port conformance evidence, browser evidence, and scoped change fragments live there. Framework/package implementations live under `packages/<port>/src/components/<id>/`; package-local API and SSR evidence live under `packages/<port>/test/components/<id>/`.

Reusable package-owned units are discovered under `packages/<package>/src/capabilities/<id>/`, `src/accessibility/<id>/`, or `src/foundations/<id>/`, with mirrored evidence under `packages/<package>/test/<kind>/<id>/`. Relative source imports infer dependency edges between such units. When a real semantic dependency cannot be inferred from code, the owning unit may declare stable product dependencies in `dependencies.json`; this metadata describes product dependency, never a list of tests to run.

A specific owned path suppresses its aggregate package root during PR classification. Therefore a React Button implementation change selects the React/Button product unit and its transitive consumers, not every React component. Package-wide files such as `packages/react/src/index.ts`, package manifests, or package configuration select the aggregate React package and fan out to all dependent React product surfaces.

A selected component or reusable owned unit receives the build prerequisites required by its chosen type, SSR, browser, or unit evidence. Packed-package and consumer-entrypoint verification is reserved for affected package/public surfaces, aggregate package changes, and explicit broad validation tiers; implementation locality inside a package is not sufficient by itself. Shared Web component changes may fan out to discovered framework ports that consume that Web component, but each affected port receives only the validation evidence required by the affected contract or behavior. Package-wide Core or Web changes retain broader reverse-dependency closure.

## Evidence and omission detection

`tooling/testing/discover-product-units.mjs` derives ownership from public package exports plus conventional directories. `verify:testing-structure` fails when a public component is missing its component slice, docs, executable examples, package-local type/SSR evidence, or shared conformance/browser preparation. A newly exposed component therefore becomes required validation work automatically.

The same rule applies to reusable capabilities/accessibility/foundation units: once a conventional source unit exists, its mirrored evidence is required and its dependency edges participate in impact planning. New normal units do not require names in the CI planner, scope executor, workflow paths, or a central registry.

Tests execute at the lowest reliable layer. Package-local evidence proves framework/package integration. Shared component evidence proves cross-port observable outcomes. Browser-owned behavior stays in real browser tests. Accessibility evidence belongs to the lowest owner that actually owns the behavior: pure calculations may be Core; CSS/DOM/platform behavior may be Web; component semantics belong to the component; repository-wide conformance remains repository tooling.

Reusable evidence executors and harnesses live under `tooling/testing/`. Tests of repository infrastructure stay with their infrastructure owner as colocated `*.test.mjs` files or an owner-local test directory when that structure is warranted. They are grouped into semantic root commands: `test:impact`, `test:testing-tooling`, `test:accessibility-tooling`, and `test:actions`; `test:tooling` runs those groups together. No executable test or harness code belongs under the policy-only `testing/` root.

Owner-local wrappers are intentional discovery and ownership anchors. Repetition alone is not a reason to centralize or delete them when they prove package/component-local integration or make missing evidence detectable.

## Change fragments

Unreleased changes are scoped beside their owner. Components use `components/<id>/changes/*.md`; reusable-unit changes use `packages/<package>/changes/<kind>/<id>/*.md`. Fragment types are `major`, `minor`, `patch`, or `internal`. Release tooling derives changelog output from these fragments; fragments do not contain CI instructions or repeated package/component identity metadata.

Fragments are unreleased evidence, not permanent component structure. Targeted PR validation requires a matching changed fragment when a component implementation or reusable product-unit implementation changes. After release tooling consumes those fragments, the component or unit remains valid without retaining historical unreleased fragments in its ownership folder.

## Safety model

Unknown paths, unowned testing infrastructure, root package configuration, and other architecture-wide changes fail closed to broad validation. Normal PR and main-push validation both use changed-path impact plans and the same ownership model; main evaluates the merged change range rather than automatically executing the exhaustive graph. `npm run check:full` exposes the explicit broad main tier for deliberate exhaustive local/manual validation. Scheduled and release validation remain broad safety nets, with scheduled adding recurring cross-browser assurance and release adding release-readiness evidence.

PR and main reports are inspectable evidence. They record why validation scopes were selected, which prerequisite scopes were pulled in transitively, browser setup cost, and per-scope outcomes and durations. Partial execution evidence is preserved when a selected scope fails so CI cost and failure location remain diagnosable.

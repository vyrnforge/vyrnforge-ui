# Trunk and delivery governance

VyrnForge uses a protected, integration-ready `main` branch and short-lived work branches. Framework support is parallel work over shared foundations; React, Angular, Vue, Native HTML, data-management modules, docs, and tooling do not receive permanent integration branches.

## Branch model

`main` is the only long-lived development trunk. It must remain releasable from a repository-integrity perspective: required CI passes, generated/current metadata is synchronized, and deployable artifacts are produced only from successful `main` validation.

Normal work uses short-lived branches named for the tracker item or bounded infrastructure objective:

- `mfd-1301-vue-public-package`
- `mfd-1201-angular-public-package`
- `mfd-1410-react-form-controls-batch`
- `infra/trunk-ci-delivery-contract`

Do not create permanent `develop`, `react`, `angular`, `vue`, `docs`, or release-integration branches. They become alternate sources of truth and encourage framework drift.

A task branches from current `main` unless it has a real dependency on an unmerged task. Dependent work may be temporarily stacked on the prerequisite branch. After the prerequisite merges, the dependent branch must be rebased or retargeted to `main` before merge. The PR must identify the dependency while stacked.

Delete short-lived branches after merge.

## Protected trunk contract

Repository protection for `main` should enforce the following operational contract:

- changes enter through pull requests;
- `ci-gate` is required;
- the branch must be current before merge;
- unresolved review conversations block merge;
- force pushes and deletion are disabled;
- direct pushes are reserved for explicitly documented emergency administration only;
- auto-merge may be used after required checks and reviews are satisfied.

Release tags remain immutable and separately protected.

GitHub settings are enforcement. This document is the repository-owned policy that those settings must implement.

## Change-impact model

CI is organized by responsibilities, not framework-specific workflow copies:

1. **plan-change-impact** derives affected workspaces and repository surfaces from the PR diff.
2. **quality** validates repository contracts and affected workspaces.
3. **integration** verifies packed consumers, browser behavior, documentation, examples/playground, fixtures, and deployable Pages artifacts when selected.
4. **security** validates dependency and workflow/security changes.
5. **ci-gate** is the single merge-facing result and must fail when a selected responsibility fails.

Package impact must be derived from actual workspace manifests and their VyrnForge dependency graph. Do not add a new hard-coded workflow input for every package or framework.

Unknown paths use safe full validation. Pushes to `main` and manual CI runs use full validation so independently scoped PRs are revalidated together on trunk.

## Required change surfaces

Changing code does not automatically mean every documentation or example file must change, but public changes require an explicit and testable impact decision.

| Change | Required accompanying responsibility |
| --- | --- |
| Internal implementation with no contract change | affected package quality and tests |
| Shared behavior or accessibility contract | downstream framework adapters, browser/accessibility coverage, shared contract evidence |
| Public property, event, method, slot, model, or export | canonical metadata/reference, affected framework surface, docs |
| New reusable component | canonical contract, native/shared implementation as applicable, framework adapters, docs/reference, representative example or playground coverage |
| Token, theme, density, typography, motion, or visual-state change | token/style verification, relevant docs, browser/visual evidence |
| Framework adapter change | framework package, packed consumer, SSR/build checks where applicable, representative cross-framework parity |
| Package manifest or public-entrypoint change | package build/pack, external consumer, package-boundary verification, release lifecycle classification |
| New publishable workspace | workspace quality, repository inventory, dependency graph, consumer evidence, docs, and release lifecycle classification in the same change |
| Authored docs only | docs currentness/build/link validation |
| Generated/reference metadata | regenerate/verify and fail on drift |
| Playground/example only | playground lint/typecheck/build/smoke |
| Workflow, shared CI script, root manifest, or toolchain change | full repository validation |
| Release metadata | release-contract and artifact verification |

A publishable workspace may not exist in an unclassified release state. If it is intentionally not releasable yet, its repository metadata must represent that staged lifecycle explicitly rather than relying on CI exceptions.

## Documentation and playground synchronization

CI distinguishes between **building a surface** and **requiring that surface to change**.

Generated documentation and metadata must be reproducible; verification should fail when regeneration leaves a tracked diff.

For authored guides and examples, the PR describes public impact and updates the canonical source where the change alters supported installation, usage, API, behavior, accessibility, theming, migration, or framework semantics. Do not duplicate the same guidance across multiple documents merely to satisfy CI.

The playground is a maintained consumer surface, not a dumping ground for every refactor. Update it for new or materially changed public capabilities, representative interaction patterns, themes/tokens, or framework-facing setup where an executable example adds value.

## CI levels

### Pull request

Use affected-scope validation. Optimize for actionable feedback without losing required downstream coverage.

### Main

Run full validation. A merge is not considered integrated until the exact resulting `main` commit passes.

### Scheduled assurance

Run expensive compatibility, browser, security-drift, and ecosystem checks that are not required on every PR. Workflow names and schedules must agree; a weekly job must not be called nightly.

### Deployment and release

Deploy only artifacts bound to a successful current-`main` CI commit. Do not rebuild arbitrary source in a deployment job when a validated immutable artifact already exists.

GitHub Pages and npm publishing should retain their current commit-bound/immutable-artifact principles.

## Adding a package or framework surface

A new package is not complete when its source compiles. In the same task, verify:

1. workspace discovery and dependency relationships;
2. package boundary policy;
3. build, typecheck, lint, and tests;
4. public entry points and packed-consumer behavior;
5. repository inventory and canonical package metadata;
6. docs and example/playground impact;
7. framework/browser/SSR/accessibility evidence as applicable;
8. release lifecycle classification, including an explicit staged state when publication is deferred;
9. CI change-impact behavior for source, tests, manifests, and published payload changes.

This contract applies equally to React, Angular, Vue, Native HTML / Custom Elements, data-management modules, and future VyrnForge packages.

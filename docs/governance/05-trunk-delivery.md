# Trunk and integration-lane delivery governance

VyrnForge uses one canonical integrated trunk, `main`, plus persistent protected integration lanes for independently moving architectural areas. The lanes are engineering and integration surfaces; they are not alternate release trunks and they do not redefine package ownership.

## Branch topology

The persistent branches are:

- `main` — canonical integrated product and release/deployment source;
- `integration/foundation` — `ui-core`, `ui-behaviors`, design tokens, shared contracts, schemas, metadata, generators, and framework-independent utilities;
- `integration/native` — `ui-elements`, Custom Elements, DOM implementation, and native-surface integration;
- `integration/react` — React facade/package work;
- `integration/angular` — Angular facade/package work;
- `integration/vue` — Vue facade/package work;
- `integration/data-grid` — data-grid and optional data-management modules;
- `integration/docs` — documentation application, guides, examples/playground, and reader-facing documentation infrastructure;
- `integration/platform` — CI/CD, release tooling, repository automation, developer tooling, and cross-repository infrastructure.

Do not create a persistent branch for every package or component. Persistent lanes represent architectural ownership and parallel integration capacity, while package impact remains metadata/dependency driven.

## Task branches

Normal implementation work uses a short-lived branch from its owning integration lane, preferably named for the tracker item or bounded objective, for example:

- `feat/MFD-1302-vue-button` from `integration/vue`;
- `feat/MFD-1202-angular-button` from `integration/angular`;
- `feat/CF-2104-event-contract` from `integration/foundation`;
- `fix/GRID-3302-selection-regression` from `integration/data-grid`;
- `infra/ci-impact-planner` from `integration/platform`.

A task PR targets its owning integration lane, not `main`. Delete short-lived task branches after merge.

If work genuinely requires an unmerged prerequisite from another lane, a temporary stacked task branch is allowed. Record that dependency in the PR. Once the prerequisite is promoted through `main`, sync the owning integration lane from `main` and rebase/retarget the dependent task back to its normal lane.

## Lane synchronization

`main` is the cross-lane synchronization boundary. Persistent lanes regularly merge or rebase current `main` so they receive promoted shared changes.

Do not establish permanent dependency chains such as `foundation -> native -> react -> angular -> vue`. Framework lanes are peers. A shared capability is implemented in the appropriate shared lane, promoted to `main`, then consumed independently by the framework lanes.

Lane synchronization is repository state maintenance, not a new feature change. A synchronization push must not start another expensive CI run when the incoming commits have already crossed the required `main` validation boundary.

Lane freshness is enforced by the stable `ci-gate`, not by making framework lanes depend on one another. For every task PR targeting `integration/<lane>`, the target lane must already contain current `main` or have an identical tree to current `main` where squash promotion produced equivalent content with different commit ancestry. A `main` -> `integration/<lane>` synchronization PR is explicitly allowed even when the lane is stale. For every `integration/<lane>` -> `main` promotion PR, the lane head must contain the current `main` base or be tree-equivalent before promotion is allowed.

The tree-equivalence exception is intentionally narrow. It exists for cases such as a squash promotion where the lane and `main` have the same repository content but sibling commit identities. It must not be used to excuse missing `main` content or to force-move protected lane refs.

Weekly assurance also audits all persistent integration lanes against `main`. That audit is read-only: it detects idle-lane drift but does not bypass protected branches, mutate refs, or create privileged synchronization commits.

## Promotion to main

Changes reach `main` through a promotion PR from `integration/<lane>` to `main`.

A promotion PR may contain one or more completed task PRs from that lane, but it must be reviewable as an integrated change set. Promotion PRs always run full repository validation because `main` is the product-wide compatibility boundary.

Emergency hotfixes may target `main` directly only when explicitly identified as hotfixes. They receive the same full validation as lane promotions and must subsequently be synchronized back into every affected persistent lane.

`main` is the only branch from which production Pages deployments, npm publication, Git tags, or GitHub Releases may originate.

## Protected branch contract

Repository settings should protect `main` and every persistent `integration/*` lane.

For `main`:

- changes enter through promotion PRs or explicit emergency hotfix PRs;
- `ci-gate` is required;
- full repository validation is required before merge;
- the branch must be current before merge;
- unresolved review conversations block merge;
- force pushes and deletion are disabled;
- production deployment/release automation may consume only successful current-`main` delivery artifacts.

For persistent integration lanes:

- task changes enter through PRs;
- `ci-gate` is required;
- affected-scope validation is allowed;
- force pushes and deletion are disabled;
- task PRs are blocked when the target lane is stale relative to `main`;
- promotion PRs are blocked when the lane does not contain current `main` or an accepted tree-equivalent state;
- `main` -> lane synchronization PRs are the normal repair path for drift;
- production deployment and npm publication are forbidden.

Release tags remain immutable and separately protected.

GitHub branch/ruleset settings enforce PR entry, required checks, deletion protection, and non-fast-forward protection. Repository-owned CI additionally enforces lane freshness because the persistent lanes remain peers and are not configured as strict branch-update chains.

## CI execution model

CI is organized by responsibilities rather than copied once per framework.

1. **plan-change-impact** derives affected workspaces and repository surfaces from the diff and actual workspace dependency graph.
2. **quality** validates repository contracts and affected workspaces.
3. **integration** verifies packed consumers, browser behavior, documentation, examples/playground, fixtures, and deployable Pages artifacts when selected.
4. **security** validates dependency and workflow/security changes.
5. **ci-gate** is the stable merge-facing result, enforces integration-lane freshness for PRs, and fails when any selected responsibility fails.

Execution policy deliberately validates each lifecycle boundary once:

- task PR -> `integration/<lane>`: affected-scope validation plus lane-freshness enforcement at `ci-gate`;
- `main` -> `integration/<lane>` synchronization PR: affected-scope validation is allowed and lane-drift enforcement recognizes the PR as the repair path;
- merge/push on `integration/<lane>`: no second CI run; the accepted task/synchronization PR gate is authoritative and routine lane synchronization must not fan out duplicate workflow runs;
- `integration/<lane>` -> `main` promotion PR: full repository validation plus current-main containment/tree-equivalence enforcement;
- emergency PR -> `main`: full repository validation;
- push/merge on `main`: exact-main **delivery validation only** — rebuild package prerequisites plus docs/playground and create the commit-bound Pages artifact without rerunning quality, browser, consumer, or security suites already passed at the main-boundary PR;
- manual repository CI: full validation;
- scheduled weekly assurance: full quality/integration plus compatibility, security, and persistent-lane drift checks;
- unknown/unclassified task-PR paths: safe full validation.

The main push delivery run is intentionally not a second product-wide test gate. It exists to bind deployable artifacts and downstream release/deployment consumers to the exact commit that actually landed on `main`. A newer main push cancels an older in-progress delivery run so stale artifacts do not consume runner capacity.

Package impact must be discovered from actual `packages/*/package.json` manifests and VyrnForge dependency relationships. Do not add framework-specific CI booleans every time a first-class surface appears.

## Required change surfaces

Changing code does not automatically mean every documentation or example file must change, but public changes require an explicit and testable impact decision.

- **Internal implementation with no contract change:** affected package quality and tests.
- **Shared behavior or accessibility contract:** downstream framework adapters, browser/accessibility coverage, and shared contract evidence.
- **Public property, event, method, slot, model, or export:** canonical metadata/reference, affected framework surface, and docs.
- **New reusable component:** canonical contract, native/shared implementation as applicable, framework adapters, docs/reference, and representative example or playground coverage.
- **Token, theme, density, typography, motion, or visual-state change:** token/style verification, relevant docs, and browser/visual evidence.
- **Framework adapter change:** framework package, packed consumer, SSR/build checks where applicable, and representative cross-framework parity.
- **Package manifest or public-entrypoint change:** package build/pack, external consumer, package-boundary verification, and release lifecycle classification.
- **New publishable workspace:** workspace quality, repository inventory, dependency graph, consumer evidence, docs, and release lifecycle classification in the same change.
- **Authored docs only:** docs currentness/build/link validation.
- **Generated/reference metadata:** regenerate/verify and fail on drift.
- **Playground/example only:** playground lint/typecheck/build/smoke.
- **Workflow, shared CI script, root manifest, or toolchain change:** full repository validation.
- **Release metadata:** release-contract and artifact verification.

A publishable workspace may not exist in an unclassified release state. If publication is intentionally deferred, repository metadata must represent that staged lifecycle explicitly rather than relying on CI exceptions.

## Documentation and playground synchronization

CI distinguishes between building a surface and requiring that surface to change.

Generated documentation and metadata must be reproducible; verification should fail when regeneration leaves a tracked diff.

For authored guides and examples, the PR describes public impact and updates the canonical source where the change alters supported installation, usage, API, behavior, accessibility, theming, migration, or framework semantics. Do not duplicate the same guidance across multiple documents merely to satisfy CI.

The playground is a maintained consumer surface, not a dumping ground for every refactor. Update it for new or materially changed public capabilities, representative interaction patterns, themes/tokens, or framework-facing setup where an executable example adds value.

## Scheduled assurance and release

Scheduled assurance runs expensive compatibility, browser, security-drift, persistent-lane drift, and ecosystem checks that are not required on every task PR. Workflow names and schedules must agree; a weekly job must not be called nightly.

Deployment jobs consume artifacts bound to a successful current-`main` delivery run. Release jobs may perform their own release-candidate verification, but they must bind the candidate to a successful current-main delivery run and must not publish from an integration lane. Do not repeat the full promotion suite merely to obtain a deployable artifact.

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

This contract applies equally to React, Angular, Vue, Native HTML / Custom Elements, data-management modules, documentation, and future VyrnForge packages.

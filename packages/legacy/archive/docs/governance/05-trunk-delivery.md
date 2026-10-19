# Trunk Delivery

## Purpose

`main` is VyrnForge's canonical releasable branch. It must remain buildable, tested, publishable, and suitable to cut a release from at any time.

Normal implementation work happens on short-lived branches. Direct human commits to `main` are not part of the delivery model.

VyrnForge supports both mainline pull requests and bounded non-mainline pull requests when a real dependency exists. Non-mainline PRs are a development topology, not a second permanent development branch.

## Long-lived branches

Only `main` is permanently required.

Temporary `release/<major>.<minor>` branches may exist for release stabilization or supported maintenance lines. Permanent `develop`, `next`, framework-owned, or generic staging branches are not part of the default model.

Temporary `integration/<initiative>` branches are allowed only when several reviewed changes must be combined before the initiative can safely target `main`. They must have a named initiative, a bounded lifetime, explicit owners, and an exit condition.

## Branch classes

Use purpose-first branch names:

- `feat/<scope>` — new capability;
- `fix/<scope>` — defect correction;
- `refactor/<scope>` — structural change without intentional behavior change;
- `arch/<scope>` — architecture, package, contract, or repository model change;
- `a11y/<scope>` — accessibility-focused work;
- `perf/<scope>` — performance work;
- `docs/<scope>` — documentation-only work;
- `test/<scope>` — test infrastructure or coverage;
- `build/<scope>` — build, packaging, or bundling;
- `ci/<scope>` — CI/CD;
- `migration/<scope>` — deliberate migration or deprecation work;
- `deps/<scope>` — dependency updates;
- `release/<version>` — release stabilization;
- `backport/<version>/<scope>` — supported-line backport;
- `hotfix/<version>-<scope>` — urgent correction for a released version;
- `integration/<initiative>` — temporary initiative integration only.

Do not create permanent `react`, `angular`, `vue`, `components`, `dev`, or similar framework/silo branches. Framework surfaces are peers.

## Pull-request topology

### Mainline PR

A mainline PR targets `main`. Use it when the change is independently valid, has no unmerged prerequisite, passes the required gates, and leaves `main` releasable.

### Stacked PR

A stacked PR targets another short-lived work branch because it has a real prerequisite. The PR description must identify its dependency explicitly.

Example:

```text
main
  |
  +-- arch/tree-contract          PR A -> main
        |
        +-- feat/tree-core        PR B -> arch/tree-contract
              |
              +-- feat/tree-react   PR C -> feat/tree-core
              +-- feat/tree-angular PR D -> feat/tree-core
              +-- feat/tree-vue     PR E -> feat/tree-core
```

Once a prerequisite merges, dependent PRs should be retargeted or rebased toward the nearest valid base, normally `main`.

### Integration PR

An integration PR uses a temporary `integration/<initiative>` base when multiple independently reviewed changes must be exercised together before they can be merged to `main` safely.

Integration branches must not become persistent promotion lanes or an alternate `develop` branch.

### Release, backport, and hotfix PRs

Release stabilization targets the relevant `release/<version>` branch. Backports contain only the already-reviewed fix plus unavoidable compatibility adjustments. Hotfixes must also be reconciled with `main` so fixes do not live only on a maintenance line.

## Dependency rules

Branch and PR ordering must represent technical dependencies, not framework preference.

When several frameworks need the same capability, establish the reusable foundation once, then allow Native/Custom Elements, React, Angular, and Vue work to proceed in parallel after their actual prerequisites are available.

Do not serialize React -> Angular -> Vue, or any other framework order, unless a concrete implementation dependency requires it.

## PR classes

Every PR should identify its class when useful for review:

- independent;
- contract/foundation;
- framework adapter;
- stacked;
- integration;
- mechanical migration;
- generated-artifact;
- dependency;
- release fix;
- backport;
- hotfix.

One coherent architectural change may touch several packages and frameworks. "One package = one PR" is not a rule.

## Change impact

Each PR must state the affected surfaces and whether the change touches:

- shared/core foundations;
- Native HTML / Custom Elements;
- React;
- Angular;
- Vue;
- tokens/styles;
- accessibility;
- SSR/server safety;
- internationalization;
- public API;
- generated output;
- documentation;
- release lifecycle.

Framework-only PRs are allowed when the issue is genuinely framework-specific. Shared concepts must not be hidden inside one adapter package merely to keep the PR local.

## CI execution model

`main` remains the protected merge and release boundary.

- PRs targeting `main` run the protected merge suite and must satisfy the required merge-facing status.
- Non-mainline PRs must run enough validation to review the change safely. Their final merge path to `main` must still pass the full protected mainline gate.
- Pushes to `main` perform delivery work tied to the exact landed commit rather than silently substituting another branch.
- Expensive periodic assurance and controlled release checks remain separate lifecycle boundaries.
- Generated metadata/reference output must be reproducible and fail on drift.

The workflow implementation source of truth remains [`../engineering/ci-cd-architecture.md`](../engineering/ci-cd-architecture.md). That document and CI configuration must be updated when the branch-aware execution model is implemented.

## Merge policy

Squash merge is the default for normal PRs so `main` records coherent changes rather than development noise. Exceptions should be deliberate, for example when preserving a reviewed multi-commit history materially improves traceability.

No PR is merge-ready merely because its direct branch checks are green. Required dependency, compatibility, accessibility, package, generated-artifact, and migration evidence still applies.

## Release boundary

Production documentation and package publication originate from a verified `main` commit or an explicitly supported release line derived from it.

A green stacked, integration, prerelease, or framework-only branch does not authorize publication, maturity promotion, package renaming, or expansion of supported public scope.

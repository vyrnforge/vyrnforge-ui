# Validation Layers And Commands

## Purpose

This document defines VyrnForge validation layers and the normal command surface. It does not own GitHub Actions orchestration, branch topology, deployment, or release sequencing; those lifecycle details are owned by [`docs/engineering/ci-cd-architecture.md`](../engineering/ci-cd-architecture.md).

Canonical machine-readable validation ownership lives in [`docs/metadata/validation-layers.json`](../metadata/validation-layers.json).

## Contributor commands

```text
npm run check
npm run test
npm run build
npm run ci
```

- `check` runs current repository formatting, linting, CSS linting, metadata and architecture contracts, workflow contracts, and typechecking.
- `test` runs package unit and DOM tests.
- `build` builds publishable packages and current repository applications required by the build contract, including VyrnForge Reference.
- `ci` is the complete local full-repository validation path. It is useful before broad changes or when reproducing protected mainline validation locally.

Commands named `verify:*`, `test:*`, `build:*`, and scoped runners are implementation details used by repository automation. They are not alternative contributor workflows.

## Active contracts and historical evidence

Current repository contracts run through:

```text
npm run test:contracts
npm run verify:metadata
```

Completed gate, framework-adapter, accessibility, migration, and other retained closure evidence runs through:

```text
npm run test:historical-evidence
npm run verify:historical-evidence
```

Historical evidence is not part of normal `check` or `ci`. Pull-request automation selects it only when canonical retained evidence or the corresponding verifier changes, using the repository's change-impact plan.

This preserves audit evidence without treating historical sprint gates as current product workflow.

## Pull-request validation

### Mainline PRs

Pull requests targeting `main` run the full protected merge suite. That suite covers repository-level formatting and linting, package typechecks/tests/builds, package boundaries, documentation/reference currentness, packed consumer evidence, browser/accessibility contracts, generated-artifact checks, and security responsibilities according to the canonical validation model.

The stable merge-facing status is `ci-gate`.

### Stacked and other non-mainline PRs

Pull requests targeting a real short-lived prerequisite or bounded integration branch use change-impact-scoped validation against their declared base. This provides review evidence without pretending that a green stacked branch is final release evidence.

Before a change reaches `main`, its final mainline path must still pass the complete protected suite. Validation does not impose React, Angular, Vue, or Native sequencing; framework work follows actual technical dependencies.

## Exact-main delivery

A push to `main` is the exact landed commit and therefore owns commit-bound delivery work. It does not repeat the complete merge suite that the protected mainline PR already passed.

Exact-main delivery builds and verifies the deployable VyrnForge Reference artifact for that commit. Production Pages deployment consumes that verified artifact rather than rebuilding repository source.

## Weekly assurance

Weekly Assurance owns expensive ecosystem and drift checks such as full compatibility/browser matrices, dependency and security drift, CodeQL, workflow hardening, and other checks intentionally separated from normal pull-request latency.

Assurance is evidence only; it does not publish packages or deploy production artifacts.

## Release validation

Release owns release-specific validation only: current-main confirmation, release-group/version checks, package packing and size budgets, immutable artifact verification, publication dry run, trusted-publishing controls, registry/provenance verification, and release-record integrity.

Release must not become a second general-purpose CI suite.

## Ownership rule

A check has one canonical semantic owner and one normal execution path. The same underlying check may execute at more than one trust boundary only when the validation model records a concrete reason.

Use:

- `docs/metadata/validation-layers.json` for machine-readable validation ownership;
- this document for validation-layer and command semantics;
- `docs/engineering/ci-cd-architecture.md` for workflow orchestration and lifecycle boundaries;
- `.github/workflows/*` and repository scripts as executable implementation.

When those sources disagree, fix the drift rather than documenting both versions.

## Command graph

`npm run verify:validation-model` generates `test-results/validation-command-graph.json`. Verification fails when public commands are missing, deprecated aggregate aliases return, a script cycle exists, `npm run ci` reaches the same root script more than once, or historical evidence becomes reachable from normal validation.

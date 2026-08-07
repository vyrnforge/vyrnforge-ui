# Validation layers and commands

VyrnForge uses four validation layers. Every check has one owner and one normal execution path. A check may be repeated at a distinct trust boundary only when the canonical metadata records the reason.

The source of truth is [`docs/metadata/validation-layers.json`](../metadata/validation-layers.json).

## Contributor commands

```text
npm run check
npm run test
npm run build
npm run ci
```

- `check` runs current repository formatting, linting, CSS linting, metadata and architecture contracts, workflow contracts, and typechecking.
- `test` runs package unit and DOM tests.
- `build` builds every publishable package plus the documentation and playground applications.
- `ci` is the complete local equivalent of main-branch validation.

Commands named `verify:*`, `test:*`, `build:*`, and the scoped runner are implementation details used by repository automation. They are not alternative contributor workflows.

## Active contracts and historical evidence

Current repository contracts run through:

```text
npm run test:contracts
npm run verify:metadata
```

Completed G3, GMF, native-element, framework-adapter, accessibility, and migration closure evidence is retained through:

```text
npm run test:historical-evidence
npm run verify:historical-evidence
```

Historical evidence is not part of normal `check` or `ci`. Pull-request automation selects it only when canonical completed-sprint evidence or the corresponding verifier changes, using `CI_SCOPE_HISTORICAL_EVIDENCE=true`.

This preserves audit evidence without executing old sprint gates on every source-code change or rewriting historical metadata to describe the current command surface.

## Pull request

Pull requests run repository-level formatting and linting, then affected package typechecks and tests, affected browser contracts, package-boundary checks, required application builds, and scoped security checks. Completed historical evidence runs only for its dedicated scope.

## Main branch

Main validates the exact merged tree once. It runs current package tests and typechecks, package builds, packed-consumer verification, documentation and playground builds, browser contracts, and active repository metadata validation. It does not rerun historical closure evidence after every merge.

## Nightly

Nightly owns slow drift detection: the complete compatibility and browser matrices, dependency audit, CodeQL, package-size trends, and other expensive cross-framework checks.

## Release

Release owns only release-specific validation: successful current-main confirmation, release-group and version checks, package packing and size budgets, publication dry run, trusted-publishing checks, and registry/provenance verification. It must not become a second general-purpose CI run.

## Command graph

`npm run verify:validation-model` generates `test-results/validation-command-graph.json`. Verification fails when public commands are missing, deprecated aggregate aliases return, a script cycle exists, `npm run ci` reaches the same root script more than once, or historical evidence becomes reachable from normal validation.

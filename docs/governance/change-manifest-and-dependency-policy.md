---
title: VyrnForge UI Change Records and Dependency Policy
status: Stable
owner: Architecture
last_reviewed: 2026-08-11
canonical: true
---

# Change Records and Dependency Policy

## Purpose

Normal VyrnForge pull requests follow
[`CONTRIBUTING.md`](../../CONTRIBUTING.md) and the automatic pull-request
template. Contributors are not required to maintain a separate change manifest,
predict the CI package matrix, or translate ordinary work into internal planning
terminology.

A maintainer may still create a change record when a change needs durable
coordination beyond one pull request. Typical examples are a staged migration,
a dependency between several pull requests, a temporary exception, or work that
requires repository administration outside source control.

The change record is planning and review evidence. It does not replace branch
protection, CI, package metadata, release approval, or the canonical
architecture and governance documents.

## Normal pull requests

For ordinary code, documentation, test, or maintenance changes:

1. keep the change focused;
2. describe the user or repository problem and the intended result;
3. record public API, CSS, behavior, documentation, and migration impact where
   relevant;
4. run the contributor validation path from `CONTRIBUTING.md`; and
5. let `scripts/detect-ci-scope.mjs` determine the technical CI scope from the
   changed paths.

A pull request does not need a separate package matrix or workflow checklist.
The generated CI plan and `ci-gate` own that decision.

## When a maintainer change record is useful

Use a durable change record only when the work needs information that does not
fit cleanly in one pull request, such as:

- several dependent pull requests with a defined integration order;
- a temporary policy or compatibility exception;
- a staged public API or package migration;
- a repository setting or environment change that cannot be committed;
- a release or operational transition requiring explicit hand-off evidence.

The record may live in an issue, project item, design document, or another
repository-visible planning artifact. Do not create a second document when an
existing canonical planning record already owns the work.

## Recommended record

Keep the record small and use only the fields that are needed:

### Goal

State the intended outcome and why the work is necessary.

### Scope

List the affected packages, contracts, repository areas, and important
out-of-scope items.

### Dependencies

Record only real ordering constraints, required decisions, repository settings,
or preceding changes. Link the evidence that satisfies each dependency.

### Compatibility

Describe public API, package export, CSS, runtime/peer dependency, browser, or
migration impact when applicable. Canonical compatibility rules remain in
[Public vs Internal API](../api/public-vs-internal-api.md) and the relevant
architecture/release documents.

### Validation and evidence

Record the commands, reports, screenshots/traces, package or consumer evidence,
and known limitations needed for the change. Normal CI scope remains
planner-owned.

### Exception

When a policy exception is necessary, record:

- the requirement being excepted;
- why the normal rule cannot be followed;
- the risk and mitigation;
- the approving role or decision link; and
- the condition or date that ends the exception.

No silent exception is valid.

## Dependency rules

Dependencies should reflect actual technical or operational ordering rather
than administrative sequencing.

A later change may be developed in parallel when it does not rely on
unavailable behavior or an unresolved decision. A change must not merge while a
required predecessor, migration step, approval, or repository setting is still
unsatisfied.

Cross-package work must preserve the package boundaries in
[Package Boundaries](../architecture/01-package-boundaries.md). Public contract
changes remain subject to the ownership, compatibility, documentation, and
maturity policies that own those contracts.

## Source-of-truth rule

A change record must link to canonical sources instead of copying them. In
particular:

- component status and maturity come from `docs/metadata/components.json`;
- package/release identity comes from canonical release metadata;
- CI scope comes from `scripts/detect-ci-scope.mjs`;
- validation ownership comes from
  `docs/metadata/validation-layers.json`;
- package boundaries come from
  `docs/architecture/01-package-boundaries.md`.

When the coordinated work is complete, keep only the evidence that has lasting
planning or historical value. Do not turn normal contribution guidance into an
implementation-history log.

## Related documents

- [Contributing](../../CONTRIBUTING.md)
- [Documentation Governance](00-documentation-governance.md)
- [Ownership and Review Model](ownership-and-review-model.md)
- [Component Maturity Model](component-maturity-model.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [CI/CD Architecture](../engineering/ci-cd-architecture.md)

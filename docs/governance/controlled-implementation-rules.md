---
title: VyrnForge UI Controlled Implementation Rules
status: Stable
owner: Documentation
last_reviewed: 2026-09-27
canonical: true
---

# Controlled Implementation Rules

## Purpose

VyrnForge work is performed through controlled tasks, dependency gates, and
evidence-based review rather than opportunistic changes. This document owns the
durable task-execution checklist for contributors and coding agents.

It does **not** own current branch topology, package inventory, component
maturity, release classification, or active task status. Those facts belong to
their canonical sources listed below.

## Canonical execution sources

Before starting a task, use the source that owns the fact being checked:

| Question | Canonical source |
| --- | --- |
| Product identity, durable scope, and source-authority map | [Project Source Of Truth](01-project-source-of-truth.md) |
| Branch topology, task-branch targets, lane synchronization, promotion, and CI lifecycle | [Trunk and Integration-Lane Delivery Governance](05-trunk-delivery.md) |
| Package dependency rules | [Package Boundaries](../architecture/01-package-boundaries.md) and package manifests |
| Component catalog and maturity | [Component metadata](../metadata/components.json) |
| Package and release classification | [Release-group metadata](../metadata/release-groups.json) |
| Metadata ownership and regeneration | [Metadata README](../metadata/README.md) and [Metadata Maintenance](04-metadata-maintenance.md) |
| Active execution, task status, dependencies, and gates | Google Drive spreadsheet **VyrnForge Progress Tracker — Live Status** |
| Repository instructions for coding agents | [AGENTS.md](../../AGENTS.md) |

Do not copy changing facts from these sources into this checklist. Link to the
owner instead.

## Pre-task checks

Before implementation:

1. confirm the repository, current branch, and clean working tree;
2. update remote references;
3. read the tracker item and verify its predecessors and gates;
4. identify the owning integration lane from
   [Trunk and Integration-Lane Delivery Governance](05-trunk-delivery.md);
5. record permitted files, explicit out-of-scope areas, accountable owner,
   reviewer, acceptance criteria, and required evidence in the change manifest;
6. inspect existing VyrnForge components, primitives, behaviors, contracts,
   metadata, generators, tokens, utilities, and patterns before introducing a
   new abstraction.

Typical local checks are:

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short
git fetch origin
```

Use the
[Change Manifest and Dependency Policy](change-manifest-and-dependency-policy.md)
for dependency state, ownership, scope, review, and evidence requirements.

## Parallel-work rules

- Independent framework or package tasks may run in parallel after their real
  shared prerequisites and tracker gates are satisfied.
- Do not serialize React, Angular, and Vue merely because they are different
  framework surfaces.
- Do not run tasks concurrently when they modify the same core files or depend
  on an unpromoted shared contract.
- Implement reusable cross-framework foundations once in the appropriate shared
  layer before duplicating behavior in framework packages.
- Documentation, tests, configuration, and framework work may proceed
  independently only when their ownership and file scopes do not conflict.
- When a prerequisite is promoted, synchronize the owning integration lane as
  required by the delivery governance before continuing dependent work.

## Scope-control rules

- One task, or one coherent task group, belongs in each pull request.
- Do not include unrelated cleanup or opportunistic refactoring.
- Do not add dependencies without explicit approval.
- Do not change public APIs without documented impact and required review.
- Do not change CSS prefix or token contracts without ADR and task approval.
- Do not promote component maturity without the required evidence.
- Do not silently skip validation or commit generated or local artifacts.
- Keep reusable library concerns separate from consuming-application business
  logic.

## Architecture boundaries

Follow the current
[Project Source Of Truth](01-project-source-of-truth.md),
[Package Boundaries](../architecture/01-package-boundaries.md), and
[State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md).

Do not maintain a package inventory in this checklist. Package topology and
release classification change independently and are owned by the sources above.

Durable boundaries remain:

- shared tokens, styles, contracts, schemas, metadata, generators, and reusable
  framework-independent logic stay shared where practical;
- framework packages adapt shared VyrnForge foundations rather than becoming
  independent component libraries;
- VyrnForge packages remain application-store agnostic;
- consuming applications may use their preferred state-management tools, but
  VyrnForge must not require an application state library;
- large UI frameworks, styling systems, and similar foundational dependencies
  require explicit approval;
- prefer extending an existing VyrnForge foundation over creating a one-off
  application component.

## CSS and token rules

Follow [ADR-003: CSS Prefix Policy](../architecture/adr-003-css-prefix-policy.md)
and the current token metadata. Shared contracts use VyrnForge-owned token and
class conventions; do not introduce legacy terminology or duplicate token
systems. Documented CSS custom properties are consumer-facing contracts, so
broad migrations require a dedicated task and compatibility review.

## Implementation rules

- Preserve public behavior unless the task explicitly approves a change.
- Prefer small, reviewable, dependency-minimal changes.
- Preserve accessibility, keyboard, focus, internationalization, responsive,
  SSR/server-safe, compatibility, and performance requirements where applicable.
- Add tests proportionate to component complexity; never weaken tests merely to
  make a change pass.
- Prefer public-entrypoint and packed-package verification for consumer-facing
  changes.
- Keep documentation aligned with actual behavior and record limitations
  accurately.
- When CI fails, inspect and fix the cause rather than only explaining it.

## Review checklist

- [ ] Changed files match the approved task scope and required predecessors are
      complete.
- [ ] Shared foundations were reused or extended before introducing new
      abstractions.
- [ ] Cross-framework impact and any explicit framework exception were reviewed.
- [ ] Public API, package-boundary, compatibility, and migration impacts were
      reviewed.
- [ ] Required tests, accessibility, theme/density, SSR, browser, and performance
      evidence pass where applicable.
- [ ] Documentation and canonical metadata are current.
- [ ] Acceptance evidence is attached and no unrelated changes are included.
- [ ] The change manifest is complete.

Apply the [Ownership and Review Model](ownership-and-review-model.md) and
[Component Maturity Model](component-maturity-model.md) for required roles and
evidence.

## Merge and post-merge procedure

Use the branch target, synchronization path, validation boundary, and promotion
procedure defined by
[Trunk and Integration-Lane Delivery Governance](05-trunk-delivery.md). This
checklist intentionally does not duplicate branch names or merge topology.

After merge:

- remove completed short-lived task branches/worktrees as appropriate;
- synchronize affected integration lanes when required;
- update the live tracker and gate evidence when the task changes execution
  state;
- update canonical metadata or generated evidence when the task changes the
  facts those sources own;
- do not mark a task, maturity state, release state, or gate complete until its
  acceptance criteria and required evidence pass.

## Exceptions and waivers

Use the
[Change Manifest and Dependency Policy](change-manifest-and-dependency-policy.md).
Every waiver must be explicit, record its risk and approver, and create a
follow-up task where required. A waiver cannot silently redefine component
maturity, release readiness, architecture ownership, or gate status.

## Coding-agent instructions

> Verify repository and branch state before editing. Read the canonical
> governance and tracker sources for the task. Modify only permitted files and
> avoid unrelated improvements. Report changed files and validation performed.
> Do not commit automatically unless explicitly authorized. Distinguish facts
> from assumptions, and stop when scope is ambiguous.

## Related canonical documents

- [Project Source Of Truth](01-project-source-of-truth.md)
- [Trunk and Integration-Lane Delivery Governance](05-trunk-delivery.md)
- [Repository Inventory](repository-inventory.md)
- [Ownership and Review Model](ownership-and-review-model.md)
- [Component Maturity Model](component-maturity-model.md)
- [Change Manifest and Dependency Policy](change-manifest-and-dependency-policy.md)
- [Metadata Maintenance](04-metadata-maintenance.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)

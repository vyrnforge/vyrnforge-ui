---
title: VyrnForge UI Controlled Implementation Rules
status: Stable
owner: Documentation
last_reviewed: 2026-10-13
canonical: true
---

# Controlled Implementation Rules

## Purpose

VyrnForge work is performed through explicit scope, real dependency gates, and evidence-based review rather than opportunistic changes. This document owns the durable task-execution checklist for contributors and coding agents.

It does **not** own current branch topology, package inventory, component maturity, release classification, or active task status. Those facts belong to their canonical sources.

## Canonical execution sources

Before starting work, use the source that owns the fact being checked:

- **Product identity, durable scope, and source-authority map**: [Project Source Of Truth](01-project-source-of-truth.md).
- **Branch topology, stacked/mainline PR behavior, protected-main gate, and delivery flow**: [Trunk Delivery Governance](05-trunk-delivery.md).
- **Package dependency rules**: [Package Boundaries](../architecture/01-package-boundaries.md) and package manifests.
- **Component catalog and maturity**: [Component metadata](../metadata/components.json).
- **Package and release classification**: [Release-group metadata](../metadata/release-groups.json).
- **Metadata ownership and regeneration**: [Metadata README](../metadata/README.md) and [Metadata Maintenance](04-metadata-maintenance.md).
- **Documentation authority and lifecycle**: [Documentation Governance](documentation.md).
- **Active execution, task status, dependencies, and gates**: Google Drive spreadsheet **VyrnForge Progress Tracker — Live Status**.
- **Repository instructions for coding agents**: [AGENTS.md](../../AGENTS.md).

Do not copy changing facts from those sources into this checklist.

## Pre-task checks

Before implementation:

1. confirm the repository, current branch, and clean working tree;
2. update remote references;
3. inspect the tracker or bounded objective and verify real predecessors/gates;
4. select the correct short-lived branch base from [Trunk Delivery Governance](05-trunk-delivery.md): normally current `main`, or a real unmerged prerequisite, bounded `integration/<initiative>` branch, or applicable release line when required;
5. record scope, out-of-scope areas, dependencies, compatibility/migration impact, acceptance criteria, and required evidence in the pull request or existing planning record;
6. create a durable change record only when coordination extends beyond one pull request, a temporary exception is needed, repository/service administration is involved, or another case in [Change Records and Dependency Policy](change-manifest-and-dependency-policy.md) applies;
7. inspect existing VyrnForge components, primitives, behaviors, contracts, metadata, generators, tokens, utilities, and patterns before introducing a new abstraction.

Typical local checks are:

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short
git fetch origin
```

## Parallel-work rules

- Independent framework or package work may proceed in parallel after real shared prerequisites and applicable tracker gates are satisfied.
- Do not serialize Native HTML / Custom Elements, React, Angular, and Vue merely because they are different framework surfaces.
- Do not run changes concurrently when they modify the same core contract or depend on unresolved shared semantics.
- Implement reusable cross-framework foundations once in the appropriate shared layer before duplicating behavior in framework packages.
- Documentation, tests, configuration, and framework work may proceed independently when ownership and file scopes do not conflict.
- A stacked branch remains based on its real prerequisite while that prerequisite is unmerged. Once the prerequisite lands, retarget or rebase the dependent PR toward the nearest valid base, normally `main`.

## Scope-control rules

- One bounded change, or one coherent dependency unit, belongs in each pull request.
- Do not include unrelated cleanup or opportunistic refactoring.
- Do not add dependencies without explicit approval.
- Do not change public APIs without documented impact and required review.
- Do not change CSS prefix or token contracts without the required architecture/compatibility treatment.
- Do not promote component maturity without required evidence.
- Do not silently skip validation or hand-edit generated artifacts.
- Keep reusable library concerns separate from consuming-application business logic.

## Architecture boundaries

Follow [Project Source Of Truth](01-project-source-of-truth.md), [Package Boundaries](../architecture/01-package-boundaries.md), and [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md).

Durable boundaries remain:

- shared tokens, styles, contracts, schemas, metadata, generators, and reusable framework-independent logic stay shared where practical;
- framework packages adapt shared VyrnForge foundations rather than becoming independent component libraries;
- VyrnForge packages remain application-store agnostic;
- consuming applications may use their preferred state-management tools, but VyrnForge must not require an application state library;
- large UI frameworks, styling systems, and similar foundational dependencies require explicit approval;
- prefer extending an existing VyrnForge foundation over creating a one-off application component;
- framework-specific exceptions remain narrow, explicit, traceable, and tested.

## CSS and token rules

Follow [ADR-003: CSS Prefix Policy](../architecture/adr-003-css-prefix-policy.md) and canonical token metadata. Shared contracts use VyrnForge-owned token and class conventions; do not introduce duplicate token systems. Documented CSS custom properties are consumer-facing contracts, so broad migrations require compatibility review and appropriate migration evidence.

## Implementation rules

- Preserve public behavior unless the bounded objective explicitly approves a change.
- Prefer small, reviewable, dependency-minimal changes.
- Preserve accessibility, keyboard/focus behavior, internationalization, responsive behavior, SSR/server safety, compatibility, and performance where applicable.
- Add tests proportionate to changed behavior; never weaken tests merely to make a change pass.
- Prefer public-entrypoint, packed-package, and real-consumer verification for consumer-facing changes.
- Keep documentation aligned with actual behavior and record limitations accurately.
- Change canonical metadata or generator inputs rather than directly patching generated outputs.
- When CI fails, inspect and fix the cause rather than only explaining it.

## Review checklist

- [ ] Scope and real predecessors verified.
- [ ] Branch base and PR topology match the actual dependency graph.
- [ ] Existing shared foundations were reused or extended before adding parallel abstractions.
- [ ] Cross-framework impact and any framework-specific exception were reviewed.
- [ ] Public API, package, compatibility, and migration impact were reviewed.
- [ ] Required quality, accessibility, consumer, browser, and performance evidence passes where applicable.
- [ ] Documentation and canonical metadata are current.
- [ ] Required generated outputs are reproducible and current.
- [ ] A durable change record exists only when the coordination model requires one.

Apply the [Ownership and Review Model](ownership-and-review-model.md) and [Component Maturity Model](component-maturity-model.md) for required roles and evidence.

## Merge and post-merge procedure

Use the target branch, final protected-main validation boundary, and merge procedure defined by [Trunk Delivery Governance](05-trunk-delivery.md). This checklist intentionally does not duplicate branch names or CI topology.

After merge:

- remove completed short-lived branches/worktrees as appropriate;
- retarget or rebase dependent PRs as their prerequisites land;
- update the live tracker and gate evidence only when the work belongs to an approved tracked program and changes execution state;
- update canonical metadata or generated evidence when the change alters facts those sources own;
- do not mark a task, maturity state, release state, or gate complete until acceptance criteria and required evidence pass.

## Exceptions and waivers

Use [Change Records and Dependency Policy](change-manifest-and-dependency-policy.md) for temporary exceptions that require durable coordination. Every waiver must be explicit, record its risk and approving role/decision, and define an end condition. A waiver cannot silently redefine component maturity, release readiness, architecture ownership, or gate status.

## Coding-agent instructions

> Verify repository and branch state before editing. Read the canonical governance and tracker sources relevant to the work. Modify only the bounded scope and avoid unrelated improvements. Report changed files and validation performed. Distinguish facts from assumptions. Do not bypass failing gates or invent dependencies, tracker work, package APIs, or architecture not supported by repository evidence.

## Related canonical documents

- [Project Source Of Truth](01-project-source-of-truth.md)
- [Trunk Delivery Governance](05-trunk-delivery.md)
- [Documentation Governance](documentation.md)
- [Repository Inventory](repository-inventory.md)
- [Ownership and Review Model](ownership-and-review-model.md)
- [Component Maturity Model](component-maturity-model.md)
- [Change Records and Dependency Policy](change-manifest-and-dependency-policy.md)
- [Metadata Maintenance](04-metadata-maintenance.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)

---
title: VyrnForge UI Controlled Implementation Rules
status: Stable
owner: Documentation
last_reviewed: 2026-07-20
canonical: true
---

# Controlled Implementation Rules

## Purpose

VyrnForge UI improvement work is performed through controlled tasks,
dependency gates, and evidence-based review—not opportunistic changes. This
guide is the operational checklist for contributors and AI coding agents
before, during, and after every controlled task. It summarizes the workflow;
the linked documents remain the canonical policies.

## Branching model

- `main` remains protected and release-oriented.
- `improvement/controlled-hardening` is the integration branch for the current
  improvement program.
- Each controlled task uses its own task branch and merges into
  `improvement/controlled-hardening`, never directly into `main`.
- Use a dedicated worktree for each parallel task. Do not implement a task in
  the base worktree.

Examples: `task/VF-1001-eslint-foundation`,
`task/VF-2002-dialog-browser-tests`, and `task/VF-4002-grid-controller`.

## Pre-task checks

Before implementation, confirm the working directory, active branch, and clean
tree; update remote references; verify predecessor tasks are merged; and record
the permitted files, explicit out-of-scope areas, accountable owner, reviewer,
acceptance criteria, and required evidence in the change manifest.

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short
git fetch origin
```

Use the [Change Manifest and Dependency Policy](change-manifest-and-dependency-policy.md)
for dependency state, owner, review, scope, and evidence requirements.

## Parallel-work rules

- Independent tasks may run in parallel.
- Do not run tasks concurrently when they modify the same core files.
- Grid architecture work has stricter parallelism limits because its state,
  adapter, and rendering contracts are tightly coupled.
- Documentation, tests, and configuration may run separately only when file
  ownership does not overlap.
- Merge in predecessor order; rebase or otherwise update task branches after
  prerequisite pull requests merge.

## Scope-control rules

- One task, or one coherent task group, belongs in each pull request.
- Do not include unrelated cleanup or opportunistic refactoring.
- Do not add dependencies without explicit approval.
- Do not change public APIs without documented impact and required review.
- Do not change CSS prefix or token contracts without ADR and task approval.
- Do not promote component maturity without the required evidence.
- Do not silently skip validation or commit generated or local artifacts.

## VyrnForge architecture boundaries

Follow [Package Boundaries](../architecture/01-package-boundaries.md) and
[State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md).

| Package | Responsibility | Allowed dependencies |
| --- | --- | --- |
| `@vyrnforge/ui-core` | tokens, themes, density, shared utilities | none of the other VyrnForge packages |
| `@vyrnforge/ui-components` | reusable UI primitives and application components | `ui-core` |
| `@vyrnforge/ui-data-grid` | enterprise data-management grid capabilities | `ui-core`, `ui-components` |

VyrnForge packages remain store-agnostic. Consuming applications may use Redux,
but VyrnForge cannot require it. Do not add MUI, Tailwind, Radix, TanStack,
Redux, Zustand, or other large runtime dependencies without explicit approval.
Prefer reusing or extending VyrnForge before creating one-off application
components.

## CSS and token rules

Follow [ADR-003: CSS Prefix Policy](../architecture/adr-003-css-prefix-policy.md).
Shared contracts use `--vf-*` variables and `vf-*` classes. Data-grid-specific
internals alone may use `--udg-*` variables and `udg-*` classes. Do not
introduce legacy `dv-*` terminology. Documented CSS variables are
consumer-facing contracts; a broad migration requires a dedicated task.

## Implementation rules

- Preserve public behavior unless the task explicitly approves a change.
- Prefer small, reviewable commits and native-first, dependency-minimal work.
- Preserve accessibility and keyboard behavior.
- Add tests proportionate to component complexity; never weaken tests merely to
  make a change pass.
- Keep documentation aligned with actual behavior and record limitations
  honestly.

## Review checklist

- [ ] Changed files match the approved task scope and predecessors are complete.
- [ ] Public API and package-boundary impacts are reviewed.
- [ ] Required tests, accessibility, theme/density, and applicable performance
  review pass.
- [ ] Documentation is current and acceptance evidence is attached.
- [ ] No unrelated changes are included and the change manifest is complete.

Apply the [Ownership and Review Model](ownership-and-review-model.md) and the
[Component Maturity Model](component-maturity-model.md) for required roles and
evidence.

## Merge and post-merge procedure

Target `improvement/controlled-hardening`. Required checks must pass; squash
merge is preferred unless history requires otherwise. Delete completed task
branches and worktrees, synchronize the integration branch, and update the
sprint workbook or task status. Do not mark the sprint quality gate passed
until every required task and its evidence are complete.

## Exceptions and waivers

Use the [Change Manifest and Dependency Policy](change-manifest-and-dependency-policy.md).
Every waiver must be explicit, record its risk and approver, and create a
follow-up task where required. A waiver cannot silently redefine component
maturity or release readiness.

## AI coding-agent instructions

> Verify the worktree and branch before editing. Read the canonical governance
> documents. Modify only permitted files and avoid unrelated improvements.
> Report changed files and commands run. Do not commit automatically unless
> explicitly asked. Distinguish facts from assumptions, and stop when scope is
> ambiguous.

## Source-of-truth index

- [Repository Inventory](repository-inventory.md)
- [Repository Hygiene](repository-hygiene.md)
- [Ownership and Review Model](ownership-and-review-model.md)
- [Component Maturity Model](component-maturity-model.md)
- [Change Manifest and Dependency Policy](change-manifest-and-dependency-policy.md)
- [ADR-003: CSS Prefix Policy](../architecture/adr-003-css-prefix-policy.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)

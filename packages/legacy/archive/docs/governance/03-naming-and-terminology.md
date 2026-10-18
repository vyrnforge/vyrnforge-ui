# Naming And Terminology

## Purpose

This document owns durable VyrnForge terminology and naming conventions. It does
not own the current package inventory, release channels, or framework-support
evidence; those facts belong to canonical metadata, manifests, and the
[Project Source Of Truth](01-project-source-of-truth.md).

Branch and pull-request lifecycle rules are owned by
[Trunk Delivery](05-trunk-delivery.md). This document defines the terminology
used to describe that model without duplicating its procedures.

## Project naming

| Item          | Name           |
| ------------- | -------------- |
| Project       | VyrnForge UI   |
| Repository    | `vyrnforge-ui` |
| Package scope | `@vyrnforge`   |

Use canonical package names from `docs/metadata/packages.json`, release metadata,
and package manifests rather than maintaining a partial package list here.

## CSS prefixes

- `--vf-*`: VyrnForge shared design-token custom properties.
- `vf-*`: VyrnForge shared component classes.
- `--udg-*`: data-grid-specific custom properties.
- `udg-*`: data-grid-specific classes.

The precise compatibility and ownership rules for CSS prefixes are defined by
[ADR-003: CSS Prefix Policy](../architecture/adr-003-css-prefix-policy.md).

## Terms

- **Native HTML / Custom Elements**: First-class VyrnForge browser surface and current reusable browser implementation foundation where suitable. It does not own product-level component semantics.
- **Framework surface**: An idiomatic Native HTML / Custom Elements, React, Angular, or Vue consumer surface over shared VyrnForge foundations.
- **Store-agnostic**: VyrnForge does not require an application state-management library.
- **Controlled state**: Consuming application owns relevant UI state through the surface's public inputs/events.
- **Uncontrolled state**: The component owns supported local view state internally.
- **Adapter**: Explicit integration boundary between shared VyrnForge foundations and a framework, platform, persistence, server, export, or other external concern.
- **View state**: Reusable UI state such as filters, sort, pagination, density, or column setup.
- **Business state**: Application-owned state such as authentication, API data, permissions, tenant context, or product workflows.
- **Short-lived work branch**: Bounded branch for one coherent change or dependency unit. It normally starts from current `main`, but may start from a real unmerged prerequisite, a bounded `integration/<initiative>` branch, or an applicable release line when the delivery topology requires it.
- **Mainline PR**: Pull request targeting protected `main` whose change is independently valid and leaves `main` releasable.
- **Stacked PR**: Pull request targeting a short-lived prerequisite branch because the change has a real unmerged dependency. Its dependency and retarget plan are explicit.
- **Temporary integration branch**: Bounded `integration/<initiative>` branch used only when several reviewed changes must be exercised together before safely reaching `main`. It has an explicit initiative, lifetime, owners, and exit condition.
- **Persistent integration lane (retired)**: Historical permanent promotion-lane model in which integration branches acted as long-lived delivery stages. This model remains retired; a temporary bounded integration branch is not a persistent lane.
- **Framework-specific exception**: Narrow, explicit, traceable, tested divergence required by one framework while shared VyrnForge semantics remain canonical.
- **Pattern**: Reusable composition of VyrnForge capabilities; not automatically a distinct component or state model.

## Avoid terms

Do not describe VyrnForge as:

- only a data-grid library;
- a React-only, React-first, Native-first, Angular-first, or Vue-first product model;
- four unrelated framework component libraries;
- a CSS framework;
- a headless-only library;
- an application-state framework;
- a wrapper around another large UI ecosystem.

Do not use **integration lane** as shorthand for a temporary bounded
`integration/<initiative>` branch. The word **lane** refers to the retired
persistent promotion model unless historical context explicitly says otherwise.

VyrnForge is a general-purpose, multi-framework UI foundation. Detailed product
scope is owned by the [Project Source Of Truth](01-project-source-of-truth.md).

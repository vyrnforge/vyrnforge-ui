# Naming And Terminology

## Purpose

This document owns durable VyrnForge terminology and naming conventions. It does
not own the current package inventory, release channels, or framework-support
evidence; those facts belong to canonical metadata, manifests, and the
[Project Source Of Truth](01-project-source-of-truth.md).

## Project naming

| Item          | Name           |
| ------------- | -------------- |
| Project       | VyrnForge UI   |
| Repository    | `vyrnforge-ui` |
| Package scope | `@vyrnforge`   |

Use canonical package names from `docs/metadata/packages.json`, release metadata,
and package manifests rather than maintaining a partial package list here.

## CSS prefixes

| Prefix    | Owner                     | Usage                       |
| --------- | ------------------------- | --------------------------- |
| `--vf-*`  | VyrnForge shared styling | shared design-token contract |
| `vf-*`    | VyrnForge UI surfaces   | shared component classes    |
| `--udg-*` | data-grid internals      | grid-specific variables     |
| `udg-*`   | data-grid internals      | grid-specific classes       |

The precise compatibility and ownership rules for CSS prefixes are defined by
[ADR-003: CSS Prefix Policy](../architecture/adr-003-css-prefix-policy.md).

## Terms

| Term | Meaning |
| --- | --- |
| Native HTML / Custom Elements | First-class VyrnForge browser surface and canonical non-grid browser implementation where suitable. |
| Framework surface | An idiomatic Native HTML / Custom Elements, React, Angular, or Vue consumer surface over shared VyrnForge foundations. |
| Store-agnostic | VyrnForge does not require an application state-management library. |
| Controlled state | Consuming application owns relevant UI state through the surface's public inputs/events. |
| Uncontrolled state | The component owns supported local view state internally. |
| Adapter | Explicit integration boundary between shared VyrnForge foundations and a framework, platform, persistence, server, export, or other external concern. |
| View state | Reusable UI state such as filters, sort, pagination, density, or column setup. |
| Business state | Application-owned state such as authentication, API data, permissions, tenant context, or product workflows. |
| Integration lane | Persistent protected engineering branch for an architectural ownership area; not an alternate release trunk. |
| Pattern | Reusable composition of VyrnForge capabilities; not automatically a distinct component or state model. |

## Avoid terms

Do not describe VyrnForge as:

- only a data-grid library;
- a React-only or React-first product model;
- four unrelated framework component libraries;
- a CSS framework;
- a headless-only library;
- an application-state framework;
- a wrapper around another large UI ecosystem.

VyrnForge is a general-purpose, multi-framework UI foundation. Detailed product
scope is owned by the [Project Source Of Truth](01-project-source-of-truth.md).

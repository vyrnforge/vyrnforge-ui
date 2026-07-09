# Documentation Governance

## Purpose

This document prevents Dravyn UI documentation from becoming duplicated, conflicting, or multi-directional.

Dravyn UI has multiple concerns:

- native-first UI foundation
- component library
- design-system tokens
- specialized data grid
- playground / React docs app
- AI-friendly documentation

Without governance, every sprint can create another version of the same idea. This document defines how documentation should be owned.

## Core rules

### 1. One source of truth per topic

Do not create duplicate documents for the same decision.

| Topic | Canonical document |
| --- | --- |
| Project identity | `docs/governance/01-project-source-of-truth.md` |
| Package boundaries | `docs/architecture/01-package-boundaries.md` |
| State ownership | `docs/architecture/02-state-and-adapter-ownership.md` |
| Theming/styling | `docs/architecture/03-theming-and-styling.md` |
| Roadmap | `docs/roadmap/00-master-roadmap.md` |
| Component inventory | `docs/roadmap/01-component-inventory.md` |
| React docs app | `docs/react-docs/00-react-docs-app-spec.md` |
| AI context | `.ai/AI_CONTEXT.md` |

### 2. Archive instead of deleting

When a document becomes outdated:

1. Move it to `docs/archive/<yyyy-mm-topic>/`.
2. Add a note at the top saying why it was archived.
3. Link the replacement document.

### 3. Stable documents should have owners

Every stable document should include:

- status
- owner role
- last reviewed date
- replacement/related docs

### 4. Docs should serve humans and AI

Each major document should include:

- clear title
- purpose
- scope
- non-goals
- decisions
- examples
- AI usage notes when applicable

### 5. No hidden architectural decisions

If a decision affects package boundaries, state ownership, dependencies, theming, or public API, it belongs in docs.

## Document status values

| Status | Meaning |
| --- | --- |
| Draft | Not final; may change soon. |
| Proposed | Awaiting review/confirmation. |
| Stable | Approved baseline. |
| Deprecated | Still available but should not guide new work. |
| Archived | Historical only. |

## Required header for important docs

```md
---
title: <Document title>
status: Stable
owner: Dravyn UI maintainers
last_reviewed: YYYY-MM-DD
canonical: true
---
```

## When creating a new doc

Before creating a new doc, answer:

1. Does an existing doc already own this topic?
2. Is this a new topic or an update to an existing topic?
3. Is the doc for humans, AI, or both?
4. Should it be a stable doc, ADR, sprint doc, or template?
5. What old docs become outdated after this change?

## What should not happen

- Multiple roadmap files with different priorities.
- Multiple package architecture files with different package boundaries.
- Multiple Redux/state policy files with different guidance.
- Component docs that contradict package README.
- AI prompts that ignore the current architecture docs.

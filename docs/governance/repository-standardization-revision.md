# Repository Standardization Revision

## Status

Active architecture revision. This document controls the cleanup initiative itself; it does not replace the durable project source-of-truth documents.

## Objective

Standardize VyrnForge repository conventions, engineering workflow, documentation authority, terminology, branch/PR topology, and evidence requirements while removing obsolete or duplicate guidance.

The revision must reduce sources of truth rather than add another parallel documentation system.

## Principles

1. One authoritative source for each durable rule.
2. Generated material derives from canonical metadata or source files and is not hand-maintained in parallel.
3. Historical material never competes with current guidance.
4. Framework-neutral requirements are defined once and adapted consistently across Native/Custom Elements, React, Angular, and Vue.
5. CI should enforce standards that can be checked mechanically.
6. Repository cleanup must preserve useful historical traceability through Git history; an in-tree archive is optional and should exist only when history needs to remain directly browsable.
7. No document survives merely because another document links to it. Links must be updated to the new source of truth.

## Documentation disposition

Every non-generated documentation file must receive one disposition before cleanup merges:

- `KEEP` — authoritative and current; only minor cleanup required.
- `UPDATE` — authoritative but materially incomplete or inconsistent.
- `MERGE` — useful content belongs in another canonical document, after which the source is removed.
- `REPLACE` — concept remains valid but the document should be rewritten around a new canonical model.
- `ARCHIVE` — no longer current, but retaining an explicit historical copy has material value.
- `DELETE` — obsolete, duplicated, misleading, or recoverable from Git history without ongoing value.
- `GENERATED` — output owned by a generator or canonical metadata and must not become an independent source of truth.

A disposition must name the surviving authority when the file is `MERGE`, `REPLACE`, `ARCHIVE`, or `DELETE` because another source supersedes it.

## Target authority map

The target documentation system should be small and role-based. Existing paths may remain when they already satisfy this model; do not rename files for aesthetics alone.

### Product and architecture

Authoritative subjects:

- product identity and scope;
- package boundaries and dependency direction;
- framework model;
- component/behavior contract model;
- styling, tokens, and theming;
- accessibility and interaction requirements;
- public API and compatibility rules.

### Engineering

Authoritative subjects:

- branches, PR topology, dependencies, and merge policy;
- task/change lifecycle;
- CI and validation gates;
- testing strategy;
- package/public-entrypoint verification;
- release, versioning, deprecation, migration, and backport rules;
- documentation authoring and generated-source ownership.

### Metadata and generated reference

Canonical machine-readable metadata owns facts that must remain synchronized across frameworks, docs, generators, and tooling. Generated references must identify their owning source and fail CI on drift.

### Repository root

Keep root-level documents only when repository hosts expect them there or they are genuine entrypoints, such as README, CONTRIBUTING, SECURITY, LICENSE, and CHANGELOG. Root files must link to deeper canonical guidance rather than duplicate it.

## Branch and PR standard

The durable branch and PR topology is defined in `docs/governance/05-trunk-delivery.md`.

Key rules:

- `main` is canonical and releasable.
- work branches are short-lived and purpose-prefixed;
- stacked/non-mainline PRs are allowed when a real prerequisite exists;
- temporary `integration/<initiative>` branches are allowed only for bounded integration needs;
- permanent `develop`, `next`, framework, or generic staging branches are not default architecture;
- framework work proceeds in parallel after shared prerequisites rather than through a fixed React/Angular/Vue sequence;
- release/backport/hotfix branches exist only for explicit lifecycle needs;
- full protected validation is required before changes reach `main`.

## Standardization inventory

The first pass has identified these cleanup areas:

1. **Governance overlap** — documentation governance, document lifecycle, documentation ownership, documentation system, and authoring guidance currently span several files and need authority consolidation.
2. **Delivery contradiction** — prior trunk guidance required every normal PR to target `main`, while the PR template already modeled stacked dependencies. The branch/PR contract is being normalized first.
3. **PR templates** — both a default PR template and specialized templates exist. Their scope, shared fields, and source of truth need consolidation.
4. **Root vs docs duplication** — root README/CONTRIBUTING/MIGRATION/SECURITY plus deeper docs must be checked for duplicated rules and converted to entrypoints where appropriate.
5. **CI documentation** — `docs/ci`, `docs/engineering/ci-cd-architecture.md`, workflow YAML, and scripts must have clearly separated normative versus explanatory ownership.
6. **Generated/reference documentation** — `docs/generated`, metadata, Docs application pages, and generated registries must have one-way ownership and drift checks.
7. **AI context** — `.ai/AI_CONTEXT.md`, `AGENTS.md`, canonical metadata, and durable architecture docs must not maintain conflicting copies of the same facts.
8. **Naming and terminology** — branch names, PR classes, component terminology, framework surface terminology, package role names, and release lifecycle terms need one glossary/source.

## Execution sequence

### Phase 1 — Workflow foundation

- standardize branch names and PR classes;
- support stacked/non-mainline PRs without introducing permanent integration lanes;
- define impact/compatibility fields in the default PR template;
- align CI behavior with mainline versus non-mainline targets;
- remove contradictory workflow statements.

### Phase 2 — Documentation authority audit

- inventory all Markdown/documentation sources;
- assign a disposition to each;
- identify duplicate claims and conflicting rules;
- designate the surviving authority for every durable rule;
- update incoming links before removal.

### Phase 3 — Consolidation and deletion

- merge overlapping governance/engineering documents;
- delete obsolete task narratives and superseded architecture explanations unless an explicit archive need exists;
- reduce root documents to concise entrypoints where deeper authority exists;
- eliminate duplicate PR/document templates;
- keep generated content separate and clearly marked.

### Phase 4 — Mechanical enforcement

Add or strengthen checks for items that should not rely on reviewer memory, including where practical:

- branch/PR naming and topology validation;
- package dependency boundaries;
- generated-output drift;
- documentation link integrity;
- duplicate/forbidden terminology;
- package/public-entrypoint verification;
- framework parity metadata requirements;
- release lifecycle metadata;
- packed consumer verification.

### Phase 5 — Architecture normalization

After repository governance is stable, audit package boundaries, contracts, generators, tokens/styles, behaviors, framework adapters, and advanced modules against the standardized product model. Do not combine speculative package redesign with documentation cleanup unless a concrete repository inconsistency requires it.

## Merge criteria for this revision

The standardization initiative is not complete until:

- branch and PR rules have one authoritative definition;
- CI behavior matches those rules;
- every retained documentation rule has a clear authority;
- obsolete/duplicate documents are removed or explicitly archived;
- root entrypoints do not duplicate deeper normative guidance;
- generated outputs identify and follow canonical sources;
- framework parity and dependency sequencing are represented consistently in tracker/PR/CI conventions;
- links, tests, builds, packed-package checks, and applicable accessibility/browser gates pass;
- the live tracker is updated with the resulting dependencies and evidence.

## Non-goals

This revision must not:

- redesign public component APIs merely for consistency of appearance;
- rename packages without compatibility and migration justification;
- introduce a large external UI/styling/state-management dependency;
- make one framework the canonical product surface;
- preserve outdated documentation just to avoid deleting files;
- create a permanent integration branch as a substitute for explicit dependencies.

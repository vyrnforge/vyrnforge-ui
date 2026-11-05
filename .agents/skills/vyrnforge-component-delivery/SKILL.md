---
name: vyrnforge-component-delivery
description: Follow the VyrnForge component-delivery gates when introducing a component, migrating an existing component into the current product-unit architecture, implementing a new framework surface, or materially changing a component's semantics, API, accessibility, styling, or appearance. Use for NEW or MIGRATE work and substantial port/contract changes; do not treat a routine isolated typo or non-behavioral fix as a full component rollout.
---

# VyrnForge component delivery

This is the **execution procedure**, not a competing architecture specification, component registry, generator, testing framework, or approval authority. Canonical Google Drive documents govern intent; the repository at the inspected SHA governs implementation and available evidence. Read `AGENTS.md` and `CONTRIBUTING.md`. Do not assume connected Drive or GitHub access is available; when unavailable, identify which decisions cannot be verified and avoid invented claims.

Use two main work modes:
- **NEW**: a reusable component concept does not already have an accepted implementation.
- **MIGRATE**: an existing/legacy component is being reconciled with the current foundation, contract, ownership and package projections.

Treat a port extension, redesign or breaking API change as the relevant mode plus a scoped change type. Do not manufacture a new component merely to satisfy a request when native HTML, an existing VyrnForge component, a composition pattern, or application-owned UI is the better disposition.

## Gate 0 — Establish scope and authority

1. Identify task, user outcome, change type, target component ID, requested framework surfaces, consumers, and whether public compatibility is in scope.
2. Read the three canonical entry documents: Foundation Charter, ChatGPT Project Context, Documentation Map. Use the map for **only** the applicable component contract, component/public API, behavior, accessibility, CSS/token, Product Unit/Package Projection, docs, testing and versioning sources. Check relevant current design references when visual fidelity matters.
3. Inspect active repository code, Product Graph ownership, relevant dependencies, public exports, tests/docs/examples, recent related PRs/issues and the current branch SHA. Retired code is provenance, not a design contract.
4. Record discrepancies between Drive intent and live code and determine whether to fix documentation, implementation, or explicitly defer a decision. Do not silently adopt either side.

**Output:** short scope record with `Mode`, `Component`, `User goal`, `Surfaces`, `Canonical links`, `Repository SHA`, `Constraints`, `Conflicts/unresolved decisions`.

## Gate 1 — Decide whether the component should exist

For **NEW**, search native/platform alternatives, existing VyrnForge components, primitives, patterns, capabilities and package exports. Record `implement`, `use existing/native`, or `defer` with rationale. An alternate/native disposition is a valid finished analysis; do not write code to inflate catalog count.

For **MIGRATE**, inventory the actual existing behavior and consumers first. Classify each relevant piece as **retain, refactor, replace, remove, or defer**, with a reason:
- semantic purpose and whether the concept is still correct;
- public API, events/intents, controlled/default state, stable CSS/DOM hooks;
- keyboard, focus, forms, ARIA, accessibility and browser behavior;
- tokens, themes, responsive behavior, RTL/i18n, motion, visual states;
- framework-specific integration, SSR/activation, packages, exports and dependencies;
- docs/examples, tests, observed defects, unsupported assumptions and migration risk.

Never regard existing behavior as approved solely because code exists. A public breaking change needs compatibility classification and migration/rollback guidance under the versioning standard.

**Exit condition:** justified concept and disposition; component owner and retained/changed public commitments known. Otherwise stop at a documented decision instead of improvising an API.

## Gate 2 — Approve a framework-neutral component contract

Locate or establish the smallest canonical component contract before major coding. It defines (or states non-applicability of):
- purpose, when to use/not use, native semantic baseline, anatomy and composition;
- variants/sizes, value and state ownership, policies, intents/events and state transitions;
- pointer/keyboard/focus behavior, accessible name/relationships and assistive-tech responsibilities;
- forms, disabled/read-only/loading/invalid/error/async semantics as relevant;
- tokens, public styling hooks, theme, forced colors, reduced motion, constrained widths, zoom and RTL/locale;
- browser/SSR/activation effects, framework mapping, public exports, compatibility and migration;
- observable acceptance scenarios, evidence requirements and supported-surface boundaries.

Reference canonical rules; never duplicate or redefine them in the skill. A framework port must map the same semantic outcomes idiomatically, not become the shared source of truth.

**Exit condition:** contract scope and acceptance examples are reviewable. Mark missing decisions explicitly; do not ship an unresolved public contract as though approved.

## Gate 3 — Plan the smallest coherent vertical slice

Place authoring in the existing `product/components/<id>/` unit when applicable and project deliverables through the existing Product Graph into the proper public packages. Pure portable logic belongs in Core only when justified; Web owns canonical CSS/browser foundations; sibling framework ports remain independent. Do not force every port or invent a new package, runtime, registry, DSL or generator for symmetry.

Plan implementation, tests, docs, examples, package/consumer evidence and version intent **together**. For migration, include removal/cutover and a consumer-facing old→new mapping when public behavior changes. For new work, start from the correct native/semantic baseline and complete at least one honest, consumable vertical slice; future ports remain labeled unimplemented.

**Exit condition:** files/owners, supported and deferred surfaces, dependency effects, release intent and test strategy are identified.

## Gate 4 — Implement against the contract

Implement only justified shared abstractions. Preserve native behavior whenever it is correct. Keep app routing/data/auth/transactions outside the library. Use shared tokens and canonical Web styling instead of framework-local visual forks. Keep public APIs intentional and package entrypoints deliberate.

After each meaningful implementation step, synchronize affected product-owned docs, executable examples, port adapters, fixtures and tests rather than allowing independent copies to drift. For graphical/SVG work, keep authoritative geometry editable in the asset and check that renderers/fixtures use the same source data; raster mockups are references, not substitutes.

**Exit condition:** scope implemented and documented without unsupported support claims.

## Gate 5 — Verify behavior and human-visible outcomes

Use `pnpm impact:plan` / `pnpm check:changed` and the repository's impact-driven CI, not a hard-coded list of every component test. Use the cheapest reliable layer plus the required real-browser and packed-consumer evidence.

Applicable proof may include:
- unit/behavior and controlled/uncontrolled/intent scenarios;
- actual public-port browser keyboard, focus, pointer, forms, native semantics, reduced motion, forced colors, RTL/locale, and automated accessibility;
- cross-port semantic conformance only for implemented/supported ports;
- type/public-API and export-map checks, SSR/import/hydration safety where applicable;
- built-and-packed package, clean consumer and tree-shaking/side-effect checks when relevant;
- docs build and runnable examples;
- visual screenshots at **actual consumer dimensions**, relevant scales/themes/states and meaningful zoom crops; before/after comparison for a migration or redesign;
- assistive-technology/manual expert evidence for applicable higher-risk interactions.

For any visible UI redesign, illustration or icon change, green CI is **not** visual acceptance. Present actual rendering to the requester/design reviewer and record explicit approval before merging the visual change. Do not substitute enlarged mockups or claim visual approval from a passing screenshot test. Never weaken an assertion just to make CI green.

Track each required evidence item as `passed`, `failed`, `not applicable — reason`, or `deferred — owner/trigger`, with exact commit and links. A skipped CI lane is not a pass.

**Exit condition:** required tests and reviewer signoffs actually passed for the declared scope. Otherwise keep the PR unmerged/draft and state the blocker.

## Gate 6 — Review, merge and reconcile

Use the repository PR template. Include `NEW` or `MIGRATE`, disposition, canonical contract, affected Product Graph nodes/ports, supported/deferred scope, compatibility/migration, evidence links and unresolved decisions. For a migration, show the before→after and retain/refactor/replace/remove decision. For a visual change, link actual-size screenshots and record human visual acceptance explicitly.

Determine package change significance under Versioning & Compatibility; add an appropriate Changeset or explain a repository-only/no-version decision. Verify the **current PR head** and CI result immediately before merge; do not infer approval from an older green SHA. Do not merge a draft or visually rejected change. A merge is not publication, deployment, production readiness, blanket framework support or blanket WCAG acceptance.

After merge, verify the intended files/exports on `main` and report PR, SHA, exact validated scope, remaining manual/deferred evidence and release status. Reconcile canonical decisions and operational tracking when in scope; trackers record status, not architectural truth.

## Response contract

For substantial work, communicate four concise artifacts as work proceeds: **decision/contract**, **implementation scope**, **evidence by surface**, and **merge/release status**. Distinguish proposed, documented, implemented, tested, visually accepted, merged and released. If blocked, name the exact next decision; never call code complete merely because it builds.

# ADR-005: Canonical Web Implementation Model

- Status: Accepted target architecture
- Task: MFD-1002
- Scope: Non-grid web component implementation strategy
- Depends on: MFD-1001
- Current-state reference: [ADR-004](adr-004-multi-framework-web-support.md)

## Context

VyrnForge now targets four first-class supported web surfaces: React, native
HTML, Angular, and Vue. First-class support is a product and distribution
commitment; it does not require four independently maintained renderers.

The current repository already has two substantial implementation surfaces:

- the React renderer currently published through `@vyrnforge/ui-components`;
- the browser-native Custom Element renderer currently published through
  `@vyrnforge/ui-elements`.

Angular and Vue currently consume the native element surface with reference
framework adapters. Maintaining that model by adding independent handwritten
Angular and Vue component implementations would multiply behavior, styling,
accessibility, focus, event, form, and bug-fix ownership across the catalog.

The S10-S15 program therefore needs one implementation default before contract
expansion, generation, framework distribution, and React convergence begin.

## Decision

For non-grid web components, the **canonical browser implementation is the
native DOM / Custom Element implementation**.

Framework surfaces should use that canonical implementation through generated
or generic facades and integration layers wherever the framework can preserve
VyrnForge's public semantics, accessibility behavior, performance requirements,
and framework-native developer experience.

This is an implementation default, not a requirement that every public
framework API expose raw Custom Elements or raw DOM event names.

The target model is:

```text
canonical component contracts
          |
   ui-core / tokens
          |
    ui-behaviors
          |
canonical native/DOM implementation
          |
 +--------+----------+----------+----------+
 |                   |          |          |
Native              React     Angular     Vue
public surface      facade    facade      facade
```

Package dependency boundaries and the exact package topology are decided by
MFD-1003 and MFD-1004. This ADR does not by itself change any current package
manifest or dependency edge.

## Canonical implementation responsibilities

The canonical native/DOM implementation owns reusable browser behavior that
must not be reimplemented independently by each framework surface, including:

- DOM structure and semantic element selection;
- ARIA relationships and accessibility-state projection;
- canonical `vf-*` event dispatch and event details;
- property/attribute reflection and public imperative methods;
- Light DOM composition and canonical slot semantics;
- form association and browser form behavior where applicable;
- package-owned component styling based on shared VyrnForge tokens;
- DOM-level focus, overlay, observer, and browser lifecycle integration where
  those concerns are not already owned by framework-neutral behaviors.

Framework-neutral state transitions and reusable decision logic remain in
`ui-behaviors`; tokens and theme foundations remain in `ui-core`.

## Framework facade responsibilities

A framework facade may translate the canonical implementation into native
framework conventions without duplicating component behavior. Examples include:

- React props, callbacks, refs, children, controlled/uncontrolled conventions,
  and lifecycle integration;
- Angular inputs/outputs, content projection, directives, Forms/CVA integration,
  and Angular typing;
- Vue props/emits, slots, refs, `v-model`, plugin/component registration, and
  Vue typing;
- native HTML registration and direct DOM usage.

Facade code should be generated or generic wherever contract metadata can
express the mapping. Repeated per-component handwritten forwarding code is not
the default architecture.

## Dedicated renderer exception

A dedicated framework-specific renderer is allowed only when a concrete
technical constraint prevents the canonical implementation plus facade from
meeting required behavior.

Valid exception classes include evidence-backed problems such as:

- framework SSR or hydration requirements that cannot be satisfied by the
  canonical-backed facade;
- unacceptable measured runtime or rendering performance;
- framework composition semantics that cannot preserve the public contract;
- accessibility, focus, or form semantics that cannot be preserved through the
  canonical implementation;
- an imperative/ref contract that cannot be exposed safely through the facade.

Preference, familiarity, stylistic differences, or avoiding generator work are
not sufficient reasons for a dedicated renderer.

Every exception must eventually use the explicit framework-exception metadata
mechanism defined by MFD-1009 and record its framework, reason, scope, owner,
validation evidence, and migration or exit criteria.

## React convergence

The existing React renderer is not rewritten wholesale by this decision.

React convergence must be incremental and compatibility-preserving. Existing
React public ergonomics remain the contract unless a separately approved public
API change says otherwise. Components may remain on the existing implementation
until their canonical-backed facade passes the API, SSR/hydration, accessibility,
performance, and rollback criteria defined by MFD-1012 and S14.

This makes the current React implementation a migration source, not evidence
that dual independent renderers remain the long-term default.

## Native HTML

Native HTML remains a first-class public surface rather than an internal
implementation detail. Consumers must retain a direct, typed, documented native
usage path even when the same canonical implementation also powers framework
facades.

## Angular and Vue

Angular and Vue become first-class distributions without copying VyrnForge
component implementations into consuming applications. Their framework-native
forms/model, events, composition, registration, typing, and ref integration are
framework facade responsibilities derived from canonical contracts wherever
practical.

## Non-grid scope

This decision applies to the non-grid web component catalog in the S10-S15
program. It does not make `@vyrnforge/ui-data-grid` multi-framework and does not
change the grid's current React-only implementation or release track.

## Consequences

Benefits:

- one browser implementation receives most DOM, accessibility, form, styling,
  and browser-behavior fixes;
- Angular and Vue first-class support does not require separate handwritten
  component libraries;
- React can converge incrementally instead of forcing a flag-day rewrite;
- generation has a clear default target and a clear exception boundary;
- native HTML remains directly consumable rather than becoming a hidden
  internal renderer.

Costs and risks:

- React facade quality must be proven against existing React ergonomics and
  performance;
- SSR and hydration require explicit testing rather than assumption;
- some components may need narrow documented exceptions;
- contract metadata must become complete enough to generate framework mappings
  without component-name conditionals.

## Rejected alternatives

### Four independently maintained renderers

Rejected because it duplicates behavior and accessibility ownership, increases
framework drift, and conflicts with the program goal of generated or generic
framework integration.

### Preserve React and native as permanent independent canonical renderers

Rejected as the default because it leaves VyrnForge with two implementation
sources for the full catalog and gives Angular/Vue no clear canonical source.
Selected React exceptions remain possible when evidence justifies them.

### Make React the canonical implementation

Rejected because native HTML, Angular, and Vue must not acquire a hidden React
runtime dependency, and the repository already has a browser-native renderer
with framework-neutral behavior foundations.

### Framework-neutral virtual renderer as a new runtime layer

Not selected for S10. Introducing another rendering runtime would add a new
abstraction before the existing canonical native implementation and generation
model are proven insufficient.

## Acceptance mapping

MFD-1002 requires a documented default implementation strategy in which
dedicated framework renderers require an explicit technical exception.

This ADR establishes the native/DOM implementation as the default canonical
non-grid web implementation, framework facades as the normal distribution
mechanism, and evidence-backed explicit exceptions as the only path to dedicated
framework renderers.

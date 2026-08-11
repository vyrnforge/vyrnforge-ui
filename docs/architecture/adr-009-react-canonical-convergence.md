# ADR-009: React Canonical-Renderer Convergence Strategy

- Status: Accepted target migration strategy
- Task: MFD-1012
- Depends on: MFD-1002, MFD-1008, MFD-1009
- Target sprint: S14
- Public package: `@vyrnforge/ui-components`

## Context

`@vyrnforge/ui-components` is already a public React renderer with established
exports, props, callbacks, refs, composition conventions, accessibility
behavior, tests, and consumer expectations. ADR-005 establishes the native
DOM/Custom Element implementation as the default canonical non-grid browser
implementation, but explicitly rejects a flag-day React rewrite.

React therefore needs an incremental convergence strategy that can replace
implementation ownership without silently replacing the public React API.

## Decision

React convergence happens in **small, reversible component batches**. A
component moves from the current dedicated React implementation to a
canonical-backed React facade only after that batch proves API compatibility,
behavior/accessibility parity, SSR/hydration safety, acceptable performance,
and rollback readiness.

The public package name remains `@vyrnforge/ui-components`.

## Baseline ownership

Before a component batch begins, its React baseline is captured from canonical
current sources, including as applicable:

- current public exports and TypeScript declarations from
  `@vyrnforge/ui-components`;
- canonical component metadata and schema-v2 component contracts;
- current React tests and browser/a11y evidence;
- documented props, callbacks, composition regions, methods, and refs;
- SSR/bundler behavior where the component participates in those surfaces.

The baseline is evidence, not a permanent implementation constraint. A desired
public breaking change requires its own approved migration decision and must not
be smuggled into convergence work.

## Batch model

A batch should be the smallest coherent set that can be validated and rolled
back independently. Prefer one component or one tightly coupled component
family. Do not migrate the full catalog in a single implementation branch.

Each batch records:

- component ids and public exports;
- old implementation paths;
- canonical element/tag and contract ids;
- generated/generic facade output paths;
- any active ADR-008 exception ids;
- validation evidence;
- rollback mechanism and owner;
- final migration status.

## Required batch gates

A component batch may switch its default React implementation only when all of
the following are satisfied.

### 1. Public API compatibility

- existing package import path remains valid;
- existing public export names remain valid;
- required props and callbacks preserve names and compatible TypeScript shapes;
- controlled/uncontrolled semantics remain compatible;
- children/render-region behavior remains compatible unless an approved public
  migration explicitly changes it;
- ref and imperative method contracts remain compatible.

A generated API snapshot or equivalent deterministic public-type comparison is
required for the batch.

### 2. Canonical contract parity

The React facade must map the schema-v2 canonical properties, events, slots,
model/form semantics, refs, methods, and accessibility obligations according to
MFD-1006 through MFD-1008. React-specific behavior must not be rediscovered from
implementation source.

### 3. Accessibility and focus parity

Keyboard behavior, focus order/restoration, labels/descriptions, disabled and
invalid states, overlay focus behavior, and other recorded accessibility
obligations must be equivalent or better than the baseline.

### 4. SSR and hydration safety

Importing the React package in an SSR environment must remain safe. Where a
component is server rendered or hydrated, the canonical-backed facade must not
introduce hydration errors, duplicate registration, browser-global access at
module evaluation, or unstable initial output.

A genuine incompatibility must become an ADR-008 exception rather than a hidden
React-only branch.

### 5. Performance budget

The batch must compare relevant render/update cost and package impact against
the current React baseline. A regression outside the approved S14 budget blocks
cutover unless an explicit performance exception is approved.

Performance evidence must be measured; architectural preference is not evidence.

### 6. Package and consumer evidence

The packed `@vyrnforge/ui-components` artifact must preserve declared exports,
peer dependencies, CSS integration, and consumer behavior. Validation must use
the packed artifact rather than relying only on workspace source resolution.

### 7. Exception review

Any handwritten React integration, component-specific generator branch, or
dedicated React renderer remaining after the batch must have an active or
retiring `framework-exceptions.json` record with owner, evidence, and exit
criteria.

### 8. Rollback readiness

Before cutover, the batch must have a defined way to restore the prior React
implementation without changing the public package/API contract. Rollback may
be a source-level implementation switch or another deliberately designed
mechanism, but it must not require consumers to change imports.

Rollback evidence is retained until the batch has passed the S14 stabilization
window and G14 requirements.

## Migration states

Each React component may be tracked through these states:

1. `legacy-react` — current dedicated implementation is authoritative;
2. `candidate` — canonical facade exists but is not the default;
3. `parity-proving` — batch evidence is being collected;
4. `canonical-default` — facade is the default React implementation with
   rollback retained;
5. `converged` — stabilization is complete and obsolete implementation/rollback
   code may be removed;
6. `exception` — an ADR-008 record deliberately keeps narrower handwritten or
   dedicated React behavior.

Moving backward is allowed when regression evidence requires rollback.

## Removal rule

The old React implementation for a component must not be deleted in the same
step that first makes the canonical facade the default unless the approved
batch plan proves an equally fast rollback path. Cleanup follows stabilization,
not initial cutover.

## Styling and DOM compatibility

React consumers depend on documented VyrnForge styling contracts, not on an
undocumented identical DOM tree. Convergence may adopt the canonical DOM
structure when public API, styling hooks, accessibility semantics, browser
behavior, and documented selectors remain compatible.

If a documented React DOM/CSS contract cannot be preserved through the
canonical implementation, treat that as migration compatibility evidence and
resolve it explicitly rather than forking silently.

## Sequence guidance for S14

Start with low-risk components whose canonical contracts and composition are
simple, then move to stateful controls, forms, navigation/composites, and
finally overlays or components with complex focus/SSR behavior. Exact batches
must be selected from repository evidence at S14 execution time rather than
hard-coded in this S10 ADR.

## G14 relationship

MFD-1014 defines G14 evidence categories. React convergence is not complete
merely because every component has a facade. G14 requires the packed React
surface to prove public API compatibility, canonical behavior/accessibility,
SSR/bundler safety, measured performance, documented exceptions, and rollback
coverage across the migrated catalog.

## Rejected approaches

### Flag-day rewrite

Rejected because it removes isolation and rollback, makes regressions difficult
to attribute, and unnecessarily risks the existing public React surface.

### Preserve two permanent full renderers

Rejected as the default because ADR-005 establishes canonical DOM ownership and
requires dedicated renderers to be evidence-backed exceptions.

### Change the React package name during convergence

Rejected by ADR-006. Implementation convergence does not rename
`@vyrnforge/ui-components`.

## Acceptance mapping

MFD-1012 requires a React convergence migration strategy. This ADR defines an
incremental, reversible batch model with explicit public API, canonical parity,
accessibility, SSR/hydration, performance, packed-package, exception, and
rollback gates while preserving the existing React package identity.

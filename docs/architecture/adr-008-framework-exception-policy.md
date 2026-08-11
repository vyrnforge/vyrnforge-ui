# ADR-008: Framework Exception Policy

- Status: Accepted target architecture
- Task: MFD-1009
- Depends on: MFD-1005
- Registry: `docs/metadata/framework-exceptions.json`

## Decision

Generated or generic canonical-backed framework integration remains the default. Any handwritten framework adapter, component-specific generator branch, or dedicated framework renderer requires an explicit exception record.

An exception is technical debt with an owner and exit condition, not an alternate architecture path.

## Required exception data

Every exception records:

- stable exception id;
- framework;
- affected component(s) or package scope;
- exception class and concrete technical reason;
- implementation owner;
- source paths owned by the exception;
- validation/tests or evidence that justify and protect it;
- migration/exit criteria;
- review status and review milestone.

Preference, familiarity, historical implementation, avoiding generator work, or minor syntax differences are not valid exception reasons.

## Allowed exception classes

The registry may classify evidence-backed exceptions such as:

- SSR/hydration incompatibility;
- measured performance regression;
- inaccessible or incorrect focus/form semantics through the canonical facade;
- framework composition incompatibility;
- imperative/ref incompatibility;
- framework compiler/type-system limitation;
- temporary migration compatibility requirement.

A dedicated renderer is the highest-cost exception and must document why a narrower adapter cannot satisfy the requirement.

## Scope rules

Exceptions should be as narrow as possible. Prefer one property/event/composition adapter over a whole-component exception, and a whole-component exception over a package-wide renderer fork.

An exception must not move shared tokens, behavior contracts, accessibility rules, or business logic into framework-specific code.

## Source ownership

Source paths listed in an exception may be handwritten. Generated-source paths remain governed by MFD-1011 and must not be edited merely because an exception exists; the generator consumes exception metadata and emits or omits the appropriate output.

## Verification design

A future verifier must fail when:

- handwritten framework-specific implementation exists without a matching active exception;
- an exception omits owner, evidence/tests, or exit criteria;
- source paths escape the declared scope;
- a closed exception still owns active handwritten source;
- generator code contains undeclared component-name conditionals that should be represented as exception metadata.

## Lifecycle

Exception states are `proposed`, `active`, `retiring`, or `closed`.

Only `active` and narrowly-scoped `retiring` exceptions may justify handwritten target implementation. Closing an exception requires either canonical/generic support or removal of the affected public surface.

## Acceptance mapping

This policy makes every handwritten framework implementation or dedicated renderer explicit by framework, reason, scope, owner, tests/evidence, and migration/exit criteria while keeping generated/thin integration as the default.

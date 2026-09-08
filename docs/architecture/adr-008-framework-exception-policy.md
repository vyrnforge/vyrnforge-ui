# ADR-008: Framework Exception Policy

- Status: Accepted
- Scope: Narrow framework-specific deviations from canonical/generated integration
- Registry: `docs/metadata/framework-exceptions.json`

## Decision

Generated or generic canonical-backed framework integration is the default. Any
handwritten framework adapter, component-specific generator branch, or dedicated
framework renderer that changes the normal shared path requires an explicit
exception record.

An exception is a bounded technical deviation with an owner, evidence, review
criteria, and exit condition. It is not an alternate architecture path.

## Required exception data

Every active exception records:

- stable exception id;
- framework;
- affected component(s), API surface, or package scope;
- exception class and concrete technical reason;
- implementation owner;
- source paths owned by the exception;
- validation/tests or evidence that justify and protect it;
- migration or exit criteria;
- review state and review trigger/milestone.

Preference, familiarity, historical implementation, avoiding generator work, or
minor syntax differences are not valid exception reasons.

## Allowed exception classes

Evidence-backed exception classes may include:

- SSR/hydration incompatibility;
- measured performance regression;
- inaccessible or incorrect focus/form semantics through the canonical facade;
- framework composition incompatibility;
- imperative/ref incompatibility;
- framework compiler/type-system limitation;
- temporary compatibility requirement with a defined retirement condition.

A dedicated renderer is the highest-cost exception and must document why a
narrower adapter cannot satisfy the requirement.

## Scope rules

Exceptions are as narrow as practical. Prefer one property/event/composition
adapter over a whole-component exception, and a whole-component exception over a
package-wide renderer fork.

An exception must not move shared tokens, behavior contracts, accessibility
rules, application state, or business logic into framework-specific code.

## Generated and handwritten source ownership

Generated framework source remains generated. An exception is represented in
canonical exception metadata and generator behavior where applicable; generated
files are not manually edited merely because an exception exists.

Handwritten framework-specific source must be traceable to either:

- normal framework integration responsibility documented by package boundaries;
  or
- a matching active exception record.

## Verification

Current verification must fail when:

- exception metadata omits required scope, owner, evidence, or exit/review
  criteria;
- declared source paths escape the exception scope;
- a closed exception still owns active exception-only source;
- framework-specific component conditionals that alter shared semantics exist
  without an appropriate declared exception;
- an exception attempts to justify duplicated shared product semantics.

Repository checks should validate exception metadata together with current
framework/package tests rather than rely on closed migration-task ledgers.

## Lifecycle

Exception states are `proposed`, `active`, `retiring`, or `closed`.

Only `active` and narrowly scoped `retiring` exceptions may justify exception-only
handwritten implementation. Closing an exception requires canonical/generic
support or removal of the affected public surface, followed by removal of source
that existed solely for the exception.

## Review rule

S16 and later cleanup must not preserve an exception merely because an old
migration required it. Every surviving exception must still protect a current
compatibility, developer-experience, SSR, accessibility, performance, or
framework-correctness guarantee and must remain tested.

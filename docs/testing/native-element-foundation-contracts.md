# Native Element Foundation Contracts

This document records the executable S6 foundation established by EL-6001
through EL-6004. It does not claim native component parity or GMF3 completion.

## Registration contract

`@vyrnforge/ui-elements` supports single-definition, per-element factory,
definition-list, and explicit register-all registration. Registration is
idempotent. Package-root import performs no global registration; only
`@vyrnforge/ui-elements/register` invokes register-all as a module side effect.

## Base-element contract

`VyrnForgeElement` provides pre-definition property upgrade, inherited property
declarations, derived observed attributes, primitive parsing and optional
reflection, property-only object state, microtask-batched updates, reconnect
deferral, changed-property tracking, and `updateComplete`.

## Typed event contract

Native public events use lowercase dash-cased `vf-*` names. The event utilities
provide:

- runtime event-name validation;
- bubbling and composed defaults;
- explicit cancellation and propagation overrides;
- generic creation and dispatch helpers;
- typed component-specific event dispatcher factories;
- a canonical detail map for value, open, selection, checked, pressed, action,
  dismiss, invalid, and reset events.

Event details contain domain values and stable reasons. They do not expose
React synthetic events, Vue instances, Angular emitters, or controller objects.

## Form-associated contract

`VyrnForgeFormAssociatedElement` declares form association and lazily attaches
`ElementInternals`. It exposes native form, labels, validity, validation
message, `checkValidity()`, `reportValidity()`, and `setCustomValidity()`.

Concrete controls use protected utilities to:

- submit a string, File, FormData, or null value plus restoration state;
- capture the documented initial reset state;
- handle association and effective disabled-state changes;
- restore browser-provided state without a user-originated change event;
- request associated form submission or reset for future submitter elements;
- emit canonical `vf-invalid` and `vf-reset` events.

When ElementInternals is unavailable, the base preserves deterministic validity
and public-method behavior without adding a hidden-input implementation.

## Browser evidence

`tests/browser/native-form-foundation.spec.ts` verifies real Chromium:

- initial and updated FormData submission;
- omission while disabled;
- reset to the captured initial state;
- required validity and canonical invalid-event detail.

## Ownership boundaries

The foundation does not own component rendering, public component values,
framework adapters, application state, focus management, overlay placement, or
component-specific behavior. Public native component tags begin with EL-6005.

## Evidence

```text
packages/ui-elements/src/events.ts
packages/ui-elements/src/events.test.ts
packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.ts
packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.test.ts
apps/regression-fixtures/src/nativeFormFoundation.ts
tests/browser/native-form-foundation.spec.ts
scripts/verify-native-element-foundations.mjs
scripts/verify-native-element-foundations.test.mjs
docs/metadata/native-element-foundations.json
```

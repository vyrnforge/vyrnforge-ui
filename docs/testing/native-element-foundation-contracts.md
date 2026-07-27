# Native Element Foundation Contracts

This document records the executable S6 foundation established by EL-6001 and
EL-6002. It does not claim native component parity or GMF3 completion.

## Registration contract

`@vyrnforge/ui-elements` supports three registration levels:

1. `defineVyrnForgeElement()` for a concrete `vf-*` tag;
2. `createVyrnForgeElementRegistration()` for a reusable per-element register
   entry point;
3. `registerVyrnForgeElements()` for the explicit register-all entry point.

Registration is deterministic and idempotent. A duplicate definition is a
no-op instead of an exception. Importing the package root performs no global
registration. Only `@vyrnforge/ui-elements/register` invokes register-all as a
module side effect.

The definition catalog is intentionally empty until approved public tags land
in EL-6005 and later tasks.

## Base-element contract

`VyrnForgeElement` provides framework-independent Custom Element lifecycle
utilities while concrete elements retain ownership of rendering and browser
integration.

The base supports:

- pre-definition property upgrade;
- inherited property declarations;
- derived `observedAttributes`;
- Boolean, finite-number, and string parsing;
- opt-in primitive property reflection;
- object and array values as property-only state;
- microtask-batched updates;
- changed-property tracking;
- update deferral while disconnected;
- deterministic reconnect behavior;
- an `updateComplete` promise for tests and adapters.

Subclasses expose public reactive properties through accessors that call
`getPropertyValue()` and `setPropertyValue()`. They implement Light DOM output
in `update()` and browser-specific work in concrete lifecycle hooks.

## Ownership boundaries

The base class does not own:

- Shadow DOM;
- application state;
- component-specific behaviors;
- form association;
- focus management;
- overlay placement;
- global document listeners.

Form association remains EL-6004. Typed event expansion remains EL-6003.
Public component renderers begin with EL-6005.

## Evidence

```text
packages/ui-elements/src/base/VyrnForgeElement.test.ts
packages/ui-elements/src/registry.test.ts
scripts/verify-native-element-foundations.mjs
scripts/verify-native-element-foundations.test.mjs
docs/metadata/native-element-foundations.json
```

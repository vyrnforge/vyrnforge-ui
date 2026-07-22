# Multi-Framework Consumer Fixture Strategy

This document defines the MF-4008 fixture foundation and the evidence that
becomes mandatory at GMF4.

## Fixture locations

```text
tests/consumers/react/
tests/consumers/native-html/
tests/consumers/angular/
tests/consumers/vue/
```

`tests/consumers/manifest.json` is the fixture registry.

## S4 claim

The S4 fixtures are **architecture fixtures only**. They record package usage,
registration, event syntax, compiler/schema configuration, and ownership. They
do not claim that planned packages exist or that a framework build passes.

`npm run verify:multi-framework` verifies the fixture contract. Actual clean
installation and runtime verification begins after `@vyrnforge/ui-elements`
exists and is required for GMF4.

## Required final evidence

Each supported consumer must eventually run from a clean dependency graph and
prove:

1. package installation;
2. production build;
3. type checking;
4. package import without premature DOM access;
5. property and attribute handling;
6. canonical events;
7. slots/composition;
8. themes and density;
9. form participation where applicable;
10. browser keyboard, focus, and accessibility scenarios.

## React fixture

The React fixture covers both:

```tsx
import { Button } from "@vyrnforge/ui-components";
```

and native element use after explicit registration:

```tsx
import "@vyrnforge/ui-elements/register";

<vf-button variant="primary">Save</vf-button>;
```

The first path remains the recommended React beta path.

## Native HTML fixture

The no-framework fixture must run with only browser APIs and VyrnForge package
artifacts. It is the primary proof that the native renderer does not carry a
hidden React, Vue, or Angular runtime.

## Angular fixture

The Angular fixture records Custom Element schema configuration, property and
DOM-event binding, projection, and later forms-adapter scenarios. Framework
forms integration is verified separately from the native form-association
contract.

## Vue fixture

The Vue fixture records `vf-*` Custom Element compiler recognition, property
and DOM-event binding, slots, and later `v-model` adapter scenarios.

## CI ownership

Changes under `tests/consumers/` require consumer and metadata verification.
Runtime fixture jobs may be split by framework later, but the stable `ci-gate`
must aggregate every required result.

No framework may be marked supported because an example compiles locally. The
support claim comes only from the versioned compatibility matrix and GMF4
evidence.

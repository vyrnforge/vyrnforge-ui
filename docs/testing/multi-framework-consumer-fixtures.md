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

## Current claim

The original S4 fixtures recorded architecture only. CF-7001 and CF-7002 now
upgrade native HTML and React to packed runtime evidence. CF-7003 upgrades
Angular to `packed-angular-runtime-verified`. CF-7004 adds the
`angular-forms-adapter-verified` reference integration. CF-7005 upgrades Vue to
`packed-vue-runtime-ready`; the claim remains runtime-pending until the clean
build and Chromium matrix pass. Vue `v-model` translation remains CF-7006 work.

`npm run verify:multi-framework` verifies fixture claims and structure.
`npm run verify:consumer-foundations:runtime` performs clean tarball
installation, type checking, production builds, and Chromium evidence for the
native HTML, React, Angular, and Vue fixtures. See
`docs/testing/consumer-foundation-contracts.md` and
`docs/testing/angular-consumer-contract.md` and
`docs/testing/vue-consumer-contract.md`.

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

CF-7003 verifies the Angular 22 fixture from clean packed dependencies with
Custom Element schema configuration, property and DOM-event binding, named
Light DOM composition, native form submission, production build, and Chromium
evidence. CF-7004 adds a thin opt-in Forms directive for reactive and
template-driven value, touched, disabled, and validation integration without
duplicating the native renderer.

## Vue fixture

CF-7005 supplies the Vue 3 fixture and runtime verifier for clean packed
dependencies, `vf-*` compiler recognition, forced DOM property binding,
canonical DOM events, named Light DOM composition, native form submission,
production Vite output, and Chromium interaction. The clean build and browser
run remain required evidence. CF-7006 owns the thin `v-model` translation
adapter.

## CI ownership

Changes under `tests/consumers/` require consumer and metadata verification.
Runtime fixture jobs may be split by framework later, but the stable `ci-gate`
must aggregate every required result.

No framework may be marked supported because an example compiles locally. The
support claim comes only from the versioned compatibility matrix and GMF4
evidence.

# Multi-Framework Consumer Fixture Strategy

This document defines the current clean-consumer fixture strategy used to verify
VyrnForge framework support from packed package artifacts.

## Fixture locations

```text
tests/consumers/react/
tests/consumers/native-html/
tests/consumers/angular/
tests/consumers/vue/
```

`tests/consumers/manifest.json` is the fixture registry.

## Current support evidence

React and native HTML are first-class renderer surfaces. Angular and Vue are
verified consumers of the shared native renderer while their dedicated
first-class package cutovers remain governed by G12 and G13 respectively.
Angular Forms and Vue `v-model` integration remain thin adapters over shared
VyrnForge behavior and native-element contracts rather than independent
component implementations.

Current evidence includes clean packed installation, strict type checking,
production builds, Chromium interaction, canonical property/event/slot
behavior, native form participation, framework adapters, SSR/bundler checks,
cross-framework browser coverage, automated accessibility coverage, reviewed
assistive-technology evidence, and migration guidance. The data grid remains
outside the non-grid beta release group.

`npm run verify:multi-framework` verifies framework topology and fixture claims.
`npm run verify:consumer-foundations:runtime` performs clean tarball
installation, type checking, production builds, and Chromium evidence for the
native HTML, React, Angular, and Vue fixtures. See
`docs/testing/consumer-foundation-contracts.md`,
`docs/testing/angular-consumer-contract.md`, and
`docs/testing/vue-consumer-contract.md`.

## Required consumer evidence

Each supported consumer must prove:

1. package installation from packed or published artifacts;
2. production build;
3. type checking;
4. package import without premature DOM access;
5. property and attribute handling;
6. canonical events;
7. slots and composition;
8. themes and density;
9. form participation where applicable;
10. browser keyboard, focus, and accessibility scenarios.

## React fixture

The React fixture verifies the normal first-class React package path. Application
code imports React components, types, and styling from
`@vyrnforge/ui-components` and does not import or register native packages.
Shared VyrnForge implementation packages may be installed transitively by the
React package, but they are not consumer-facing setup requirements.

```tsx
import { Button } from "@vyrnforge/ui-components";
import "@vyrnforge/ui-components/styles/index.css";

<Button variant="primary">Save</Button>;
```

Direct Custom Element consumption remains a separate native/web-platform
surface, verified by `tests/consumers/native-html`; it is not part of the normal
React fixture path.

## Native HTML fixture

The no-framework fixture runs with browser APIs and VyrnForge package artifacts.
It proves that the native renderer does not carry a hidden React, Vue, or Angular
runtime dependency.

## Angular fixture

The Angular fixture verifies clean packed dependencies, Custom Element schema
configuration, property and DOM-event binding, named Light DOM composition,
native form submission, production build, Chromium behavior, and the thin Forms
adapter for reactive and template-driven integration.

## Vue fixture

The Vue fixture verifies clean packed dependencies, `vf-*` compiler
recognition, DOM property binding, canonical DOM events, named Light DOM
composition, native form submission, production Vite output, Chromium
interaction, and the thin `v-model` adapter.

## CI ownership

Changes under `tests/consumers/` require consumer and metadata verification.
The stable `ci-gate` aggregates every required result selected by the CI
planner.

No framework support claim comes from an example compiling locally. Current
support levels are defined by versioned repository metadata and must be backed by
the corresponding clean-consumer, package, browser, accessibility, and release
evidence.

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

React, Native HTML, Angular, and Vue are first-class non-grid consumption
surfaces. React uses `@vyrnforge/ui-components`, Native HTML uses
`@vyrnforge/ui-elements`, Angular uses `@vyrnforge/ui-angular`, and Vue uses
`@vyrnforge/ui-vue`. Angular and Vue facades adapt the same canonical Custom
Elements rather than reimplementing VyrnForge rendering, accessibility, forms,
styles, or shared behavior.

Current automated evidence includes clean packed installation, strict type
checking, production builds, server-safe import, Chromium interaction,
canonical property/event/slot behavior, native form participation, framework
forms/model integration, cross-framework browser coverage, and automated
accessibility coverage. Manual assistive-technology completion and external
trusted-publisher configuration remain separately governed and are not implied
by these automated fixture claims. The data grid remains outside the non-grid
beta release group.

`npm run verify:multi-framework` verifies framework topology and fixture claims.
`npm run verify:consumer-foundations:runtime` performs clean tarball
installation, type checking, production builds, and Chromium evidence for the
Native HTML, React, Angular, and Vue fixtures. See
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
6. canonical events and framework-facing event translation where applicable;
7. slots and composition;
8. themes and density;
9. form participation where applicable;
10. browser keyboard, focus, and automated accessibility scenarios.

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

Direct Custom Element consumption remains a separate Native HTML/web-platform
surface, verified by `tests/consumers/native-html`; it is not part of the normal
React fixture path.

## Native HTML fixture

The no-framework fixture runs with browser APIs and VyrnForge package artifacts.
It proves that the native renderer does not carry a hidden React, Vue, or Angular
runtime dependency.

## Angular fixture

The Angular fixture verifies the public `@vyrnforge/ui-angular` package from
packed artifacts, including package-owned registration, generated selectors and
types, input/output behavior, named Light DOM composition, native form
submission, Angular Forms integration, SSR-safe import, production build, and
Chromium behavior. The fixture must not rely on copied generated wrappers or
fixture-local framework adapters.

## Vue fixture

The Vue fixture verifies the public `@vyrnforge/ui-vue` package from packed
artifacts. Normal application setup uses `VyrnForgeVue`; application code uses
generated `Vf*` components, `v-model` mappings, typed emits, slots, and refs
rather than copied generated wrappers or fixture-local model adapters.

Evidence covers the supported Vue peer line, clean package installation, strict
`vue-tsc`, production Vite output, SSR-safe import/server rendering, canonical
and Vue-facing events, named Light DOM composition, typed imperative methods,
native form submission, Chromium interaction, and automated accessibility
checks. Raw `<vf-*>` use remains a deliberate interoperability escape hatch, not
the normal Vue facade path.

## CI ownership

Changes under `tests/consumers/` require consumer and metadata verification.
The stable `ci-gate` aggregates every required result selected by the CI
planner. Promotion pull requests to `main` select the repository's full protected
validation scope.

No framework support claim comes from an example compiling locally. Current
support levels are defined by versioned repository metadata and must be backed by
the corresponding clean-consumer, package, browser, accessibility, and release
evidence.

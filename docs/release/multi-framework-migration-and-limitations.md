# Multi-Framework Migration and Limitations Guide

This guide explains how to choose and integrate VyrnForge across React, native
HTML, Angular, and Vue.

Canonical component status lives in `docs/metadata/components.json`; generated
framework/component usage lives in `docs/generated/component-reference.json`.

## Choose a framework surface

Use `@vyrnforge/ui-components` in React applications when a first-class React
component exists.

Use `@vyrnforge/ui-elements` for Native HTML, other web frameworks, or an
interoperability boundary that specifically needs Custom Elements.

Use `@vyrnforge/ui-angular` for the supported Angular facade. It adapts the same
canonical Custom Elements rather than reimplementing VyrnForge behavior or
styling.

Use `@vyrnforge/ui-vue` for the supported Vue facade. It provides generated
Vue-native components, models, events, slots, and refs over the same canonical
Custom Elements rather than creating a separate Vue implementation.

These surfaces share VyrnForge tokens, behavior contracts, accessibility
expectations, and component semantics. They are not separate design systems.
Do not create one-off framework wrappers when an existing VyrnForge facade,
primitive, or native element already provides the required contract.

## React

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta
```

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";

import { Button } from "@vyrnforge/ui-components";
```

React applications may also consume native elements at explicit interop
boundaries, but should not create a parallel wrapper library without a verified
reusable need.

## Native HTML

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta
```

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-elements/register";
```

Assign arrays and objects as DOM properties and listen for canonical `vf-*`
`CustomEvent` values.

## Angular

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-angular@beta
```

Use `provideVyrnForge()` once at the application boundary, then consume the
generated Angular facade instead of configuring application-owned Custom Element
schemas or copying fixture adapters. Applications that need Angular Forms use
the package-owned `@vyrnforge/ui-angular/forms` entrypoint; applications that do
not use Forms do not need the optional `@angular/forms` peer.

The normal migration from a direct native-element Angular integration is:

1. add the Angular facade and keep the shared `ui-core` / `ui-elements` style
   imports;
2. replace copied registration or schema helpers with `provideVyrnForge()`;
3. replace copied CVA/Validator adapters with the package Forms directive where
   Forms integration is needed;
4. preserve canonical events, composition, and component state rather than
   renaming or reimplementing them in application wrappers;
5. replace private DOM queries with generated typed references and public
   imperative methods;
6. keep business validation, routing, data fetching, workflow state, and
   application stores outside VyrnForge.

The public native element package remains a supported interoperability escape
hatch. It does not justify a second application-specific Angular component
library.

See [Angular Package](../packages/ui-angular.md) for setup, Forms, events,
composition, typed references, SSR behavior, limitations, and detailed migration
guidance.

## Vue

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-vue@beta vue
```

Use `VyrnForgeVue` once at the application boundary, then consume the generated
`Vf*` facade instead of configuring application-owned Custom Element compiler
rules or copying fixture adapters.

The normal migration from the pre-package Vue/native-element fixture pattern is:

1. add `@vyrnforge/ui-vue` and keep shared `ui-core` / `ui-elements` style
   imports;
2. replace facade-only `@vyrnforge/ui-elements/register` setup with
   `app.use(VyrnForgeVue)`;
3. replace fixture-local `modelValue` bridges with generated `v-model` mappings;
4. replace copied generated wrappers and declaration bridges with public package
   components and types;
5. use Vue slots and typed refs instead of private DOM traversal or wrapper-only
   composition conventions;
6. keep raw `<vf-*>` elements only where the application deliberately needs the
   Native HTML contract;
7. keep business validation, routing, data fetching, workflow state, and
   application stores outside VyrnForge.

The supported Vue peer range is `>=3.5 <4`. The package verifies SSR-safe import,
Vue server rendering, generated model/type coverage, packed production builds,
browser interaction, native forms, slots, and accessibility automation.

See [Vue Package](../packages/ui-vue.md) for detailed setup, models, events,
slots, typed refs, SSR behavior, limitations, and migration guidance.

## Current guarantees

The non-grid beta model verifies:

- shared design tokens and package-owned CSS;
- framework-neutral behavior contracts;
- first-class React, Native HTML, Angular, and Vue non-grid consumption paths;
- generated Angular and Vue facades over canonical elements;
- canonical properties/events and composition;
- framework forms/model translation where applicable;
- packed-package installation and production builds;
- server-safe package imports and supported bundler output;
- browser and accessibility behavior covered by the repository's current
  automated evidence model.

Component maturity is still evaluated per component. A beta package channel does
not make every public component stable.

Repository verification does not itself claim completed manual screen-reader
review or completed external trusted-publisher configuration. Those controls
remain separately governed release evidence.

## Current limitations

- The data grid remains React-only on its independent alpha track.
- Angular is supported through `@vyrnforge/ui-angular` on the validated Angular
  `>=22 <23` peer range; a new Angular major requires an explicit compatibility
  update.
- Vue is supported through `@vyrnforge/ui-vue` on the validated Vue `>=3.5 <4`
  peer range; a new Vue major requires an explicit compatibility update.
- Framework form/model adapters translate canonical control contracts; they are
  not arbitrary business-form abstractions.
- Mobile-native renderers are outside the current web support model.
- Server-safe import does not mean browser-only Custom Element internals are
  server-rendered.
- Framework-specific styling forks are unsupported; use shared VyrnForge tokens
  and package CSS.
- VyrnForge packages do not require an application state manager.

## Migrating one-off wrappers

1. Identify whether the wrapper only registers an element, forwards properties,
   translates an already-supported framework convention, or renames canonical
   events.
2. Replace wrappers that duplicate supported facade behavior with
   `@vyrnforge/ui-angular` or `@vyrnforge/ui-vue`; remove wrappers in other
   surfaces when they add no framework value.
3. Keep thin adapters only for a real framework convention not already owned by
   VyrnForge.
4. Keep business validation, data fetching, state ownership, and workflow
   decisions in the consuming application.
5. Compare behavior against the generated component reference and current
   consumer/browser evidence.
6. Preserve an incremental rollback path through supported public package APIs.

## Upgrade path

During `0.x`, use explicit prerelease channels, review the changelog and
migration guidance, and follow the deprecation policy before upgrading.

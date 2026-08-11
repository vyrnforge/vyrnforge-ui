# Multi-Framework Migration and Limitations Guide

This guide explains how to choose and integrate VyrnForge across React, native
HTML, Angular, and Vue.

Canonical component status lives in `docs/metadata/components.json`; generated
framework/component usage lives in `docs/generated/component-reference.json`.

## Choose React components or native elements

Use `@vyrnforge/ui-components` in React applications when a first-class React
component exists.

Use `@vyrnforge/ui-elements` for native HTML, Angular, Vue, other web frameworks,
or an interoperability boundary that specifically needs Custom Elements.

The two renderers share VyrnForge tokens, behavior contracts, accessibility
expectations, and component semantics. They are not separate design systems.

Do not wrap every native element by default. Keep framework-local adapters only
where they add real framework integration value.

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

Angular consumes the native element package.

Configure Custom Element recognition, use property bindings for complex values,
and bind canonical DOM events directly. Use the thin Angular Forms reference
pattern only when Angular form-state translation is needed.

The adapter does not create a separate VyrnForge Angular component library and
does not make NgRx or another application store a package requirement.

## Vue

Vue consumes the native element package.

Configure the Vue compiler to recognize the `vf-*` namespace, use DOM property
binding for complex values, and listen for canonical events. Use the thin
`v-model` reference adapter only when model translation improves application
ergonomics.

The adapter does not create a separate VyrnForge Vue component library.

## Current guarantees

The non-grid beta model verifies:

- shared design tokens and package-owned CSS;
- framework-neutral behavior contracts;
- React and native HTML renderer integration;
- Angular and Vue consumption of native elements;
- canonical properties/events and composition;
- representative framework forms/model translation;
- packed-package installation and production builds;
- server-safe package imports and supported bundler output;
- browser and accessibility behavior covered by the repository's current
  evidence model.

Component maturity is still evaluated per component. A beta package channel does
not make every public component stable.

## Current limitations

- The data grid remains React-only on its independent alpha track.
- No published Angular or Vue component library is provided.
- Framework form/model adapters are reference integrations, not arbitrary
  business-form abstractions.
- Mobile-native renderers are outside the current web support model.
- Server-safe import does not mean browser-only Custom Element internals are
  server-rendered.
- Framework-specific styling forks are unsupported; use shared VyrnForge tokens
  and package CSS.
- VyrnForge packages do not require an application state manager.

## Migrating one-off wrappers

1. Identify whether the wrapper only registers an element, forwards properties,
   or renames canonical events.
2. Remove wrappers that add no framework value.
3. Keep thin adapters only for a real framework convention.
4. Keep business validation, data fetching, state ownership, and workflow
   decisions in the consuming application.
5. Compare behavior against the generated component reference and current
   consumer/browser evidence.
6. Preserve an incremental rollback path.

## Upgrade path

During `0.x`, use explicit prerelease channels, review the changelog and
migration guidance, and follow the deprecation policy before upgrading.

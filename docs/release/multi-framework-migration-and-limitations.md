# Multi-Framework Migration and Limitations Guide

CF-7013 explains how to choose and adopt VyrnForge across React, Native HTML,
Angular, and Vue during the multi-framework beta. Canonical component status and
detailed contracts remain in `docs/metadata/components.json`,
`docs/metadata/component-contracts.json`, and the generated component reference.

## Choose React components or native elements

Use `@vyrnforge/ui-components` in a React application when a first-class React
component already exists. It provides the React-oriented API, composition model,
and TypeScript experience while preserving shared VyrnForge tokens, behavior,
and accessibility contracts.

Use `@vyrnforge/ui-elements` when the host is Native HTML, Angular, Vue, another
web framework, or a React interoperability boundary that specifically needs
Custom Elements. Native elements are not a second design system: they adapt the
same shared foundations and use canonical `vf-*` DOM events.

Do not wrap every element by default. Add a thin consumer-local adapter only
when a framework convention cannot be represented directly, such as Angular
Forms or Vue `v-model` translation.

## React migration

Prefer the first-class React package:

```tsx
import { Button, TextInput } from "@vyrnforge/ui-components";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

A React application may consume `@vyrnforge/ui-elements` directly for an
interop boundary. In that case, register the elements once, use DOM properties
for object-valued data, and listen for canonical CustomEvents. Do not create a
parallel React wrapper library unless a verified reusable gap exists.

## Native HTML migration

Register the element catalog once and import package-owned CSS in order:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-elements/register";
```

```html
<vf-button action="save">Save</vf-button>
<vf-text-input name="owner" value="Operations"></vf-text-input>
```

Assign arrays and objects as DOM properties rather than serializing them into
attributes. Handle `vf-*` events as native `CustomEvent` instances. Form-
associated elements participate through `ElementInternals` where the canonical
component contract declares form association.

## Angular integration

Angular consumes the same Custom Elements package. Register the elements from
application bootstrap and allow Custom Elements in the consuming component or
application schema:

```ts
schemas: [CUSTOM_ELEMENTS_SCHEMA];
```

Use Angular property bindings for complex values and template event bindings
for canonical events. Do not rename shared events to Angular-only APIs.

The CF-7004 `vfFormControl` implementation is a thin consumer-local reference
adapter for reactive and template-driven Forms. It is not a published Angular
component library, and VyrnForge does not require NgRx or another application
state-management solution.

## Vue integration

Configure Vue/Vite to recognize the `vf-*` namespace as Custom Elements:

```ts
compilerOptions: {
  isCustomElement: (tag) => tag.startsWith("vf-"),
}
```

Use `.prop` when Vue must assign an object or array as a DOM property. Listen for
canonical element events without inventing Vue-specific event contracts.

CF-7006 supplies a thin consumer-local reference adapter for translating
`modelValue` to the canonical value or checked property/event pair. It does not
create a published Vue component package and should be copied or extended only
for controls that need `v-model` ergonomics.

## Beta guarantees

The beta program verifies a consistent design-token system, package-owned CSS,
framework-neutral behavior contracts, canonical element properties/events,
keyboard behavior, accessibility expectations, packed-package installation,
production builds, server-safe imports, and representative browser behavior.

React and Native HTML are first-class beta targets. Angular and Vue have packed
consumer, browser, and adapter evidence, but per-component support status remains
canonical in `components.json` until the GMF4 compatibility gate closes. A
framework-level fixture pass is not permission to promote every component
record automatically.

## Current exclusions and limitations

- VyrnForge does not provide a mobile-native renderer.
- The server contract guarantees safe imports and supported bundler output; it does not claim server rendering of browser-only Custom Element internals.
- Angular and Vue use the shared Custom Elements package. No published Angular or Vue component package is guaranteed in this beta.
- Consumer-local Forms and `v-model` adapters cover verified representative value categories, not arbitrary business-specific controls.
- Framework-specific styling forks are unsupported. Use VyrnForge tokens and package CSS.
- VyrnForge packages do not require Redux, Zustand, Pinia, NgRx, or another application store.

## Data-grid scope

`@vyrnforge/ui-data-grid` remains on its independent React alpha track. The GMF4
non-grid compatibility claim does not promise Angular, Vue, or Native HTML data-
grid renderers. Applications may keep grid usage in a React surface or defer a
cross-framework grid migration. Do not infer grid parity from non-grid Custom
Element evidence.

## Migrating existing one-off wrappers

1. Identify whether the wrapper only registers a VyrnForge element, forwards properties, or renames canonical events.
2. Remove wrappers that add no framework value and consume the shared element directly.
3. Keep thin adapters only for a verified framework convention such as Angular Forms or Vue `v-model`.
4. Move business validation, data fetching, state ownership, and workflow decisions back to the consuming application.
5. Compare behavior against the generated component reference and the packed cross-framework browser matrix.
6. Preserve an incremental rollback path; do not migrate every application surface in one release solely to standardize syntax.

## Versioning and upgrade path

During `0.x`, pin exact VyrnForge versions, review `CHANGELOG.md`, and follow
`MIGRATION.md` plus the deprecation and migration policy before upgrading.
Public API changes should include a compatibility path, but prerelease minor
versions may still contain breaking changes.

## Source-of-truth links

- `docs/generated/component-reference.json` — generated framework usage and available contract fields.
- `docs/metadata/cross-framework-browser-matrix.json` — CF-7009 browser evidence.
- `docs/metadata/cross-framework-accessibility-review.json` — CF-7010 accessibility evidence state.
- `docs/architecture/adr-004-multi-framework-web-support.md` — approved architecture.
- `docs/release/deprecation-and-migration-policy.md` — compatibility and removal rules.
- `docs/metadata/multi-framework.json` — current framework support and release topology.

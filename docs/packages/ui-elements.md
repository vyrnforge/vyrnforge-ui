# `@vyrnforge/ui-elements` - Native Renderer Current

## Purpose

`@vyrnforge/ui-elements` is VyrnForge's browser-native renderer for public
non-grid components and plain HTML consumers. It adapts shared tokens and
framework-neutral behavior contracts to standards-based Custom Elements.

## Implemented through EL-6017

The package contains the EL-6001 through EL-6004 foundations and 54 public
`vf-*` tags. The first wave covers display/layout, actions, native form
controls, value controls, field composition, and navigation. The advanced wave
adds Autocomplete, MultiSelect, Transfer List, modal and anchored overlays,
Menu, Tooltip, Toast, ConfirmDialog, AppShell, PageHeader, and PageToolbar.

Adapters use Light DOM, VyrnForge tokens and CSS custom properties, canonical
typed events, shared behavior controllers, and native browser form semantics.
They introduce no React, Angular, Vue, application-state, or third-party
component-library dependency.

## Registration

Package-root import is side-effect free. Consumers choose explicit registration:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";
registerVyrnForgeElements();
```

```ts
import "@vyrnforge/ui-elements/register";
```

`vyrnForgeElementDefinitions` is the canonical 54-tag catalog and
`vyrnForgeElementRegistrations` exposes reusable per-tag registration
functions.

## Evidence

- `docs/metadata/native-element-foundations.json`
- `docs/metadata/native-core-elements.json`
- `docs/metadata/native-advanced-elements.json`
- `tests/browser/native-core-elements.spec.ts`
- `tests/browser/native-advanced-elements.spec.ts`
- `scripts/verify-native-core-elements.mjs`
- `scripts/verify-native-advanced-elements.mjs`

## Remaining S6 work

EL-6018 closes GMF3 with complete API, form, browser, accessibility, theme,
density, package, and consumer evidence across all public non-grid native
elements.

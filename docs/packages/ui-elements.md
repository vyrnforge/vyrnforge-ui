# `@vyrnforge/ui-elements` - Native Core In Progress

## Purpose

`@vyrnforge/ui-elements` is the browser-native renderer for public non-grid
VyrnForge components and plain HTML consumers. It adapts shared tokens and
framework-neutral behavior contracts to standards-based Custom Elements.

## Implemented through EL-6011

The package contains the EL-6001 through EL-6004 foundations plus 40 public
native core tags:

- display, typography, layout, and state surfaces;
- buttons, button groups, toolbar actions, and toggle actions;
- text, textarea, search, number, date, and datetime inputs;
- checkbox, radio, radio group, switch, and select controls;
- slider, rating, toggle groups, and segmented controls;
- field and validation composition;
- tabs, breadcrumbs, and side navigation.

The adapters use Light DOM, `vf-*` classes, VyrnForge CSS custom properties,
canonical typed events, shared behavior controllers, and native browser form
semantics. They do not introduce React, Angular, Vue, application-state, or
third-party component-library dependencies.

## Registration

Package-root import is side-effect free. Consumers choose one of:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";
registerVyrnForgeElements();
```

```ts
import "@vyrnforge/ui-elements/register";
```

`vyrnForgeElementDefinitions` is the canonical 40-tag catalog and
`vyrnForgeElementRegistrations` exposes reusable per-tag registration
functions.

## Evidence

- `docs/metadata/native-core-elements.json`
- `tests/browser/native-core-elements.spec.ts`
- `apps/regression-fixtures/src/nativeCoreElements.tsx`
- `scripts/verify-native-core-elements.mjs`

## Still pending

EL-6012 through EL-6017 implement advanced collections, overlays, feedback,
and application composition. EL-6018 closes GMF3 with complete API, form,
browser, accessibility, theme, density, package, and consumer evidence.

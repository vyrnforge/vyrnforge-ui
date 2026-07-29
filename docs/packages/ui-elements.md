# `@vyrnforge/ui-elements` - Native Renderer GMF3 Complete

## Purpose

`@vyrnforge/ui-elements` is VyrnForge's browser-native renderer for public
non-grid components and plain HTML consumers. It adapts shared tokens and
framework-neutral behavior contracts to standards-based Custom Elements.

## Implemented through EL-6018

EL-6001 through EL-6018 provide:

- deterministic, explicit registration for 58 lowercase `vf-*` tags;
- Light DOM lifecycle, property reflection, typed events, and update scheduling;
- `ElementInternals`-backed form submission, reset, disabled, and validity
  behavior;
- display, action, form, value, navigation, collection, overlay, feedback, and
  enterprise composition elements;
- four GMF3 completion tags: `vf-icon`, `vf-inline-message`, `vf-skeleton`, and
  `vf-top-nav`;
- documented renderer mappings for `Alert`, `Dropdown`, `ToastAction`,
  `ToastProvider`, and `useToast`.

Adapters use VyrnForge tokens and CSS custom properties, canonical typed events,
shared behavior controllers, and native browser semantics. They introduce no
React, Angular, Vue, application-state, or third-party component-library
dependency.

## Registration

Package-root import is side-effect free. Consumers choose explicit registration:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```ts
import "@vyrnforge/ui-elements/register";
```

`vyrnForgeElementDefinitions` is the canonical 58-tag catalog and
`vyrnForgeElementRegistrations` exposes reusable per-tag registration
functions.

## Styles

Consumers load core tokens before native renderer styles:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
```

Native advanced selectors are scoped to Custom Element hosts so the native and
React renderers can coexist in one document without class-name leakage.

## Renderer mappings

| React API       | Native contract                                                                 |
| --------------- | ------------------------------------------------------------------------------- |
| `Alert`         | `vf-inline-message`                                                             |
| `Dropdown`      | `vf-popover` with `vf-dropdown` content                                         |
| `ToastAction`   | `vf-toast[action-label]`                                                        |
| `ToastProvider` | `vf-toast-viewport`                                                             |
| `useToast`      | `VyrnForgeToastViewportElement.add`, `updateToast`, `dismiss`, and `dismissAll` |

## Evidence

- `docs/metadata/gmf3-closure.json`
- `docs/testing/gmf3-native-parity-gate.md`
- `docs/metadata/native-element-foundations.json`
- `docs/metadata/native-core-elements.json`
- `docs/metadata/native-advanced-elements.json`
- `tests/browser/native-parity.spec.ts`
- `scripts/verify-gmf3-closure.mjs`
- `docs/metadata/angular-consumer.json`
- `tests/consumers/angular/fixture.json`
- `scripts/verify-angular-consumer.mjs`

GMF3 is complete. CF-7001 and CF-7002 provide clean packed-package runtime
verification for native HTML and React 19 Custom Element consumers. CF-7008
adds the typed 58-tag DOM map, canonical event listener declarations, and the
public Custom Elements Manifest. CF-7003 verifies a clean Angular 22 packed
consumer with property/event binding, named Light DOM composition, native form
submission, and Chromium evidence. Vue runtime verification remains later S7 /
GMF4 work.

Editor metadata is exported from `@vyrnforge/ui-elements/custom-elements.json`.

# `@vyrnforge/ui-elements`

Browser-native VyrnForge Custom Elements for framework-neutral enterprise UI.

EL-6001 through EL-6018 provide:

- explicit register-all and reusable per-element registration utilities;
- duplicate-registration safety for the lowercase `vf-*` namespace;
- a server-safe Light DOM base with property/attribute reflection and batched
  updates;
- canonical typed, bubbling, composed `vf-*` DOM events;
- an `ElementInternals`-backed form-associated base;
- 58 public native tags covering core controls, advanced collections, overlays,
  feedback, renderer-completion surfaces, and enterprise composition;
- renderer mappings for Alert, Dropdown, ToastAction, ToastProvider, and
  `useToast`;
- VyrnForge token-driven styles with no runtime dependency on React or
  `@vyrnforge/ui-components`.

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
import {
  registerVyrnForgeElements,
  type VyrnForgeTabItem,
} from "@vyrnforge/ui-elements";

registerVyrnForgeElements();

const tabs = document.createElement("vf-tabs");
tabs.items = [
  { id: "summary", label: "Summary", content: "Summary content" },
  { id: "activity", label: "Activity", content: "Activity content" },
] satisfies readonly VyrnForgeTabItem[];
```

For explicit side-effect registration:

```ts
import "@vyrnforge/ui-elements/register";
```

Package-root import performs no global registration. The package root and explicit
registration entry point are designed to remain import-safe when browser DOM globals are
unavailable; CF-7007 verifies the clean ESM/CommonJS server-import evidence. Light DOM remains
the portable default. The package depends only on `@vyrnforge/ui-core` and
`@vyrnforge/ui-behaviors` at runtime.

GMF3 native non-grid parity is complete. CF-7001 and CF-7002 verify clean
packed native HTML and React 19 Custom Element consumers. CF-7003 verifies
Angular 22 and CF-7004 verifies the Angular Forms reference adapter. CF-7005
supplies the Vue 3 packed-consumer fixture and verifier; clean build and
Chromium evidence remain pending. Vue `v-model` translation remains CF-7006
work.

Typed DOM consumers receive `VyrnForgeHTMLElementTagNameMap`,
`VyrnForgeElementForTagName<TTagName>`, and canonical event listener overloads.
Editor tooling can load the public Custom Elements Manifest from:

```text
@vyrnforge/ui-elements/custom-elements.json
```

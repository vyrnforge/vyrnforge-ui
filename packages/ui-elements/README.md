# `@vyrnforge/ui-elements`

Browser-native VyrnForge Custom Elements for framework-neutral enterprise UI.

EL-6001 through EL-6011 now provide:

- explicit register-all and reusable per-element registration utilities;
- duplicate-registration safety for the lowercase `vf-*` namespace;
- a server-safe Light DOM base with property/attribute reflection and batched updates;
- canonical typed, bubbling, composed `vf-*` DOM events;
- an `ElementInternals`-backed form-associated base;
- 40 public native core tags covering display/layout, actions, inputs, selection,
  value controls, field composition, and navigation;
- VyrnForge token-driven styles with no runtime dependency on React or
  `@vyrnforge/ui-components`.

```ts
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

Package-root import performs no global registration. Light DOM remains the
portable default. The package depends only on `@vyrnforge/ui-core` and
`@vyrnforge/ui-behaviors` at runtime.

Advanced collection controls, overlays, feedback surfaces, application
composition elements, and the GMF3 parity gate remain later S6 work.

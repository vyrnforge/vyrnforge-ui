# `@vyrnforge/ui-elements`

Browser-native Custom Element renderer foundations for VyrnForge UI.

EL-6001 through EL-6004 provide:

- explicit register-all and reusable per-element registration utilities;
- duplicate-registration safety for the `vf-*` namespace;
- a server-safe `VyrnForgeElement` Light DOM base;
- inherited property declarations and derived `observedAttributes`;
- pre-definition property upgrade and primitive reflection;
- microtask-batched updates and `updateComplete`;
- canonical bubbling and composed `vf-*` CustomEvent helpers;
- typed per-component event dispatchers;
- an ElementInternals-backed form-associated base;
- disabled, validity, reset, and state-restoration utilities;
- deterministic fallbacks when ElementInternals is unavailable.

```ts
import "@vyrnforge/ui-elements/styles/index.css";
import {
  VyrnForgeElement,
  VyrnForgeFormAssociatedElement,
  createVyrnForgeEventDispatcher,
  createVyrnForgeElementRegistration,
  type VyrnForgePropertyDeclarations,
} from "@vyrnforge/ui-elements";
```

```ts
import "@vyrnforge/ui-elements/register";
```

The register-all catalog remains empty until approved public component tags are
implemented later in S6. Package-root import performs no global registration.

Light DOM is the default. This package does not depend on React, React DOM,
Vue, Angular, `@vyrnforge/ui-components`, or `@vyrnforge/ui-data-grid`.

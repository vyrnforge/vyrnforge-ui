# `@vyrnforge/ui-elements`

Browser-native Custom Element renderer foundations for VyrnForge UI.

EL-6001 and EL-6002 provide:

- explicit register-all and reusable per-element registration utilities;
- duplicate-registration safety for the `vf-*` namespace;
- a server-safe `VyrnForgeElement` Light DOM base;
- inherited property declarations and derived `observedAttributes`;
- pre-definition property upgrade;
- typed Boolean, number, and string attribute parsing;
- opt-in primitive property reflection;
- property-only object and array values;
- microtask-batched updates and `updateComplete`.

```ts
import "@vyrnforge/ui-elements/styles/index.css";
import {
  VyrnForgeElement,
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

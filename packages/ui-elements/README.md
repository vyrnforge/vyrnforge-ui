# `@vyrnforge/ui-elements`

Browser-native Custom Element foundations for VyrnForge UI.

The S4 package foundation provides a server-safe base class, idempotent
registration helpers, canonical bubbling/composed event helpers, an explicit
`register` entry point, and package-level CSS. Public non-grid component
renderers are implemented during S6 after shared behavior parity.

```ts
import "@vyrnforge/ui-elements/styles/index.css";
import {
  VyrnForgeElement,
  defineVyrnForgeElement,
} from "@vyrnforge/ui-elements";
```

```ts
import "@vyrnforge/ui-elements/register";
```

Light DOM is the default. This package does not depend on React, React DOM,
Vue, Angular, `@vyrnforge/ui-components`, or `@vyrnforge/ui-data-grid`.

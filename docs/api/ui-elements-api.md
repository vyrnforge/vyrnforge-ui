# `@vyrnforge/ui-elements` API

The S4 foundation establishes server-safe Custom Element infrastructure. Public
non-grid component tags are introduced during S6 after GMF2.

## Public exports

- `VyrnForgeElement`
- `defineVyrnForgeElement(tagName, constructor, registry?)`
- `getVyrnForgeElementRegistry()`
- `registerVyrnForgeElements(registry?)`
- `createVyrnForgeEvent(name, detail, options?)`
- `dispatchVyrnForgeEvent(target, name, detail, options?)`
- `vyrnForgeUiElementsVersion`

## Entry points

```ts
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-elements/register";
```

The register-all entry point is intentionally empty until S6 adds approved
public element definitions. Registration is idempotent and server-safe.

# `@vyrnforge/ui-elements` API

EL-6001 and EL-6002 establish the registration, lifecycle, property, attribute,
and update foundation used by later native component ports.

## Base element

- `VyrnForgeElement`
- `VyrnForgeAttributeType`
- `VyrnForgeChangedProperties`
- `VyrnForgePropertyDeclaration`
- `VyrnForgePropertyDeclarations`

Concrete elements declare reactive properties with `static properties` and
accessors backed by `getPropertyValue()` and `setPropertyValue()`. The base
derives `observedAttributes`, upgrades pre-definition properties, parses
primitive attributes, optionally reflects primitive properties, batches
updates, and exposes `updateComplete`.

Object and array values remain property-only. They are never serialized to
attributes by the base.

## Registration

- `assertVyrnForgeElementTagName(tagName)`
- `defineVyrnForgeElement(tagName, constructor, registry?)`
- `registerVyrnForgeElement(definition, registry?)`
- `registerVyrnForgeElementDefinitions(definitions, registry?)`
- `createVyrnForgeElementRegistration(definition)`
- `getVyrnForgeElementRegistry()`
- `registerVyrnForgeElements(registry?)`
- `vyrnForgeElementDefinitions`
- `VyrnForgeElementDefinition`
- `VyrnForgeElementRegistration`
- `VyrnForgeElementRegistry`
- `VyrnForgeElementTagName`

Registration accepts only lowercase `vf-*` tags, is idempotent, and returns
whether each definition was newly registered. The package-root import has no
registration side effect.

## Events

- `createVyrnForgeEvent(name, detail, options?)`
- `dispatchVyrnForgeEvent(target, name, detail, options?)`
- `VyrnForgeEventName`
- `VyrnForgeEventOptions`

EL-6003 expands typed event contracts for component-specific event detail maps.

## Entry points

```ts
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-elements/register";
```

The register-all definition catalog is intentionally empty until public native
component tags are approved in later S6 tasks.

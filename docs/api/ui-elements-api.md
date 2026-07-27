# `@vyrnforge/ui-elements` API

EL-6001 through EL-6004 establish the registration, lifecycle, property,
event, and form-association foundations used by later native component ports.

## Base element

- `VyrnForgeElement`
- `VyrnForgeAttributeType`
- `VyrnForgeChangedProperties`
- `VyrnForgePropertyDeclaration`
- `VyrnForgePropertyDeclarations`

Concrete elements declare reactive properties with `static properties` and
accessors backed by `getPropertyValue()` and `setPropertyValue()`. The base
derives `observedAttributes`, upgrades pre-definition properties, parses and
optionally reflects primitive values, batches updates, and exposes
`updateComplete`.

## Form-associated base

- `VyrnForgeFormAssociatedElement`
- `VyrnForgeFormAssociationMode`
- `VyrnForgeFormInternals`
- `VyrnForgeFormState`
- `VyrnForgeFormStateRestoreMode`
- `VyrnForgeFormValue`
- `VyrnForgeValidityFlags`

The base declares `static formAssociated = true`, attaches `ElementInternals`
lazily, and exposes native form, labels, validity, validation message, and
validation methods. Concrete controls use protected utilities to forward form
values and restoration state, capture initial reset state, and translate form
association, disabled, reset, and restoration callbacks.

`name`, `disabled`, and `required` are shared reflected properties. Object and
array component values remain property-only and concrete controls decide their
submitted `string`, `File`, or `FormData` shape.

## Events

- `assertVyrnForgeEventName(name)`
- `createVyrnForgeEvent(name, detail, options?)`
- `dispatchVyrnForgeEvent(target, name, detail, options?)`
- `createVyrnForgeEventDispatcher<TEvents>()`
- `vyrnForgeEventDispatcher`
- canonical detail interfaces and `VyrnForgeCanonicalEventDetailMap`

Events use lowercase dash-cased `vf-*` names. They bubble and are composed by
default; cancelability and propagation may be overridden only where the
component contract requires it. The typed dispatcher factory lets a concrete
element define its own detail map without introducing a framework event type.

## Registration

- `assertVyrnForgeElementTagName(tagName)`
- `defineVyrnForgeElement(tagName, constructor, registry?)`
- `registerVyrnForgeElement(definition, registry?)`
- `registerVyrnForgeElementDefinitions(definitions, registry?)`
- `createVyrnForgeElementRegistration(definition)`
- `getVyrnForgeElementRegistry()`
- `registerVyrnForgeElements(registry?)`
- `vyrnForgeElementDefinitions`

Registration accepts only lowercase `vf-*` tags, is idempotent, and returns
whether each definition was newly registered. Package-root import has no
registration side effect.

## Entry points

```ts
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-elements/register";
```

The register-all definition catalog is intentionally empty until public native
component tags are approved in later S6 tasks.

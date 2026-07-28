# Custom Elements, Light DOM, And Form Association

This document is the canonical human-readable contract for MF-4006 and MF-4007.

## Native element direction

`@vyrnforge/ui-elements` will use browser-native Custom Elements and remain
runtime dependency-minimal. A large component runtime is not approved by this
architecture batch.

Registration must be explicit:

```js
import "@vyrnforge/ui-elements/register";
```

Per-element registration entry points may be added for tree-shaken consumers.
Registration must be idempotent and safe when multiple application bundles
attempt to register the same tag.

## Light DOM default

VyrnForge uses Light DOM by default because enterprise consumers require:

- inherited `--vf-*` theme and density variables;
- predictable `vf-*` class ownership;
- application typography inheritance;
- straightforward overlay roots and focus inspection;
- testing and emergency application-level overrides;
- compatibility with existing S0-S3 CSS contracts.

Shadow DOM requires a component-level ADR or explicit architecture approval.
The approval must define public parts, slots, CSS variables, focus behavior,
overlay behavior, testing selectors, and server-rendering consequences.

## S6 registration and base-element implementation

EL-6001 and EL-6002 implement the shared registration and lifecycle foundation.
The package exposes deterministic single-definition, definition-list,
per-element registration-factory, and register-all utilities. Only the explicit
`@vyrnforge/ui-elements/register` entry point performs module-import
registration.

`VyrnForgeElement` derives observed attributes from inherited declarations,
upgrades pre-definition properties, parses primitive attributes, supports
opt-in primitive reflection, preserves object and array values as properties,
and batches connected updates in a microtask. Changes made while disconnected
are retained and processed after reconnect.

EL-6003 adds canonical typed `vf-*` event dispatchers. Events bubble and are
composed by default, while concrete contracts may opt into cancellation or a
more restrictive propagation policy.

EL-6004 adds `VyrnForgeFormAssociatedElement`, which lazily attaches
`ElementInternals`, reflects shared form properties, forwards form values and
restoration state, exposes native validity APIs, and translates reset,
disabled, association, and restoration callbacks. A deterministic fallback
preserves the public validity contract when ElementInternals is unavailable;
it does not create a hidden-input second form model.

This foundation does not introduce Shadow DOM, focus management, or
component-specific rendering.

## Attribute and property lifecycle

A base element must support:

1. property values assigned before the element is defined;
2. property values assigned before connection;
3. typed Boolean, number, and string attribute parsing;
4. update batching without framework reactivity;
5. deterministic disconnect and reconnect behavior;
6. no global DOM work at module-import time.

Object and array values remain properties. They must not be serialized into
attributes.

## Form-associated elements

Form-capable native elements use `ElementInternals` and declare form
association. The canonical form contract includes:

- `name`;
- `value` where the component submits a value;
- `disabled`;
- `required` where applicable;
- `form` access;
- `checkValidity()`;
- `reportValidity()`;
- validity state and validation message;
- form association, disabled, reset, and state-restore callbacks.

Two modes are recognized:

| Mode        | Use                                                    |
| ----------- | ------------------------------------------------------ |
| `value`     | Inputs and selection controls that contribute a value. |
| `submitter` | Button-like controls that submit or reset a form.      |

`none` is used for components that do not participate in forms.

## Value serialization

The component contract must define its submitted value shape. Scalar controls
normally submit one string value. Multi-value controls must define whether they
submit repeated entries, a serialized value, or use a `FormData` value. The
choice must be stable and documented before beta.

## Reset and restoration

A reset restores the documented initial value, checked state, selection, and
validation state. Form state restoration must not emit a user-originated change
reason.

## Validation

Native validity is the source for HTML form participation. VyrnForge may expose
additional framework adapters, but those adapters must translate the same
contract rather than maintain a second validation model.

## Angular and Vue integration

Native form association should cover plain HTML submission and browser
validity. Thin adapters are allowed where a framework's form model requires
additional integration:

- Angular ControlValueAccessor or directive integration;
- Vue `modelValue`/`update:modelValue` mapping.

These adapters may translate values and state. They must not re-render the
component or duplicate keyboard, focus, or accessibility logic.

## Browser support and fallback

A fallback may be introduced only for a documented target-browser gap. It must
preserve the same properties, methods, events, submission shape, reset
behavior, and validation outcomes. A hidden-input workaround is not the default
architecture.

## Native core renderer wave

EL-6005 through EL-6011 implement the first approved public native component
wave. Concrete elements remain thin DOM adapters over shared VyrnForge tokens,
behavior controllers, and form contracts. They use Light DOM and the same
`vf-*` class namespace as the design system; they do not depend on the React
renderer package.

The public catalog is explicit and deterministic. Object-valued APIs such as
items and options are properties, while stable primitive state may reflect to
attributes. Native controls retain browser keyboard and form semantics, and
composite navigation delegates portable state decisions to shared behavior
controllers.

## Native advanced renderer wave

EL-6012 through EL-6017 complete the pre-GMF3 native renderer catalog.
Autocomplete, MultiSelect, and Transfer List adapt shared collection controllers
and use ElementInternals for scalar or repeated-entry form submission. Dialog,
Drawer, Popover, Menu, Tooltip, Toast, and ConfirmDialog keep portable state and
decision contracts in `@vyrnforge/ui-behaviors`; the native layer owns Light DOM,
focus execution, event translation, and browser lifecycle wiring. AppShell,
PageHeader, and PageToolbar reuse the shared token and class system for enterprise
composition without introducing a framework-specific runtime.

The canonical registration catalog now contains 54 deterministic `vf-*` tags.
EL-6018 remains responsible for the complete GMF3 parity decision rather than
adding another renderer architecture.

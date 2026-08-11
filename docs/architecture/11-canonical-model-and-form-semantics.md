# Canonical Model And Form Semantics

- Task: MFD-1006
- Status: Accepted target contract
- Depends on: MFD-1005
- Machine-readable source: `docs/metadata/component-contracts.json`

## Purpose

This contract defines how canonical component state and native form behavior map into React controlled APIs, Angular Forms, Vue `v-model`, and direct native HTML consumption. Framework adapters translate these semantics; they do not own a second component state model.

## Canonical state kinds

Every stateful component uses one explicit model kind from the canonical contract: `value`, `checked`, `selection`, `open`, `pressed`, `custom`, or `none`.

For a stateful model the contract records:

- the canonical state property;
- the optional default/uncontrolled property;
- the canonical change event;
- whether framework control is supported;
- disabled-state ownership;
- touched semantics;
- form association where applicable.

A facade must not infer these values by reading renderer source.

## Controlled and uncontrolled ownership

There is one active state owner at a time.

- In controlled mode, the framework/application owns the public value and writes the canonical property.
- In uncontrolled mode, the canonical implementation owns the live value after initialization from the documented default property.
- A facade may translate naming and lifecycle conventions, but must not introduce a second hidden state machine.
- Canonical change events report completed transitions. A controlled facade must not treat event receipt as authority to mutate application-owned state.

React maps this to the existing controlled/default-property convention. Angular Forms maps control writes through `writeValue`/disabled state and listens to canonical change events. Vue maps the canonical property and event to `modelValue`/`update:modelValue` where a model is declared.

## Value semantics

`value` is used for scalar or collection values submitted or selected by a component. The canonical metadata must declare the value type. `null`, empty string, empty collection, and undefined/default are distinct when the public contract distinguishes them; facades must not normalize them silently.

Programmatic writes and user transitions use the same canonical property shape. The canonical change event records the resulting value and a reason; framework adapters may expose the value directly when their public API specifies that mapping.

## Checked semantics

`checked` is Boolean unless a component explicitly declares a mixed/indeterminate companion state. Angular and Vue form/model adapters map Boolean checked state rather than string attributes. Attribute presence is only the declarative serialization form and is not the framework model value.

## Selection semantics

Selection state must declare its canonical data shape: single value, ordered list, or set-like collection. Facades preserve that shape unless the framework mapping explicitly declares a conversion. Selection equality and ordering remain canonical behavior concerns, not adapter-local rules.

## Open and pressed semantics

`open` and `pressed` are state models even when they are not form values. They follow the same controlled/uncontrolled ownership rule and use canonical change events. Framework facades may expose idiomatic two-way APIs, but must not create independent open/pressed state.

## Disabled semantics

The canonical `disabled` property is the authority for component disabled state. Framework adapters translate their disabled APIs into that property.

- Angular `setDisabledState` writes the canonical disabled property.
- Vue and React props write the same canonical property.
- Native HTML uses the property/attribute contract defined by the component schema.

Disabled state must remain reflected in accessibility and form behavior by the canonical implementation.

## Touched semantics

Touched state is framework integration state, not canonical component business state. The contract declares one touched trigger: `none`, `blur`, `interaction`, or `framework-owned`.

Angular Forms normally maps `blur`/focus departure to `onTouched`. Vue has no mandatory library-owned touched model. React does not gain a VyrnForge touched state unless its public API explicitly defines one.

## Validity semantics

For form-associated components, validity remains owned by the canonical implementation and native form contract.

- `checkValidity()` and `reportValidity()` expose canonical/native validity.
- `validity` and `validationMessage` are read from the canonical element where supported.
- `vf-invalid` represents the canonical invalid event where declared.
- Framework adapters may translate validity into framework error structures, but must not duplicate validation rules or messages.

Angular validators therefore project canonical validity into Angular errors rather than reimplementing VyrnForge validation. Vue and React may expose validity through documented refs/methods or events.

## Form association and submission

The canonical form mode is one of `none`, `value`, or `submitter`.

For `value` controls, metadata declares the name/value/disabled/required properties and validity/reset behavior. For `submitter` controls, activation participates in form submission according to the canonical native implementation. Framework packages must not replace browser form participation with framework-only behavior.

## Reset semantics

When reset is supported, metadata declares what canonical properties are restored and which reset event is emitted. A framework adapter must synchronize its framework-facing model with the post-reset canonical state without creating a second reset policy.

## Exceptional cases

A component that cannot fit these generic rules must be recorded through the MFD-1009 framework-exception mechanism. The exception must identify the affected framework and semantic area rather than adding an undocumented component-name conditional to a generator.

## Acceptance mapping

This contract makes value, checked, selection, open, validity, touched, disabled, submitter, and reset semantics explicit enough for Angular Forms, Vue `v-model`, React controlled APIs, and native HTML mappings to derive behavior from shared metadata. Exceptional mappings remain explicit rather than implicit source-reading rules.

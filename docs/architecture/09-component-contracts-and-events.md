# Canonical Multi-Framework Component Contracts

This document is the canonical human-readable contract model for non-grid web
components. The machine-readable source is
`docs/metadata/component-contracts.json`, validated by
`docs/metadata/component-contract.schema.json`.

MFD-1005 expands the contract from representative string lists into structured
metadata that can drive framework generation without reading React, Angular, or
Vue implementation source.

## Contract ownership

The canonical contract describes VyrnForge semantics independently from any one
framework syntax:

```text
canonical component contract
  typed properties and defaults
  declarative attributes and reflection
  canonical events and typed detail
  semantic composition regions
  public imperative methods
  browser form semantics
  value/model state semantics
  ref/element exposure
  accessibility obligations
  per-framework facade mappings
        |
        +-- native HTML
        +-- React facade
        +-- Angular facade
        +-- Vue facade
```

Shared metadata must not contain application business logic, framework runtime
objects, private controller instances, backend concerns, or application state.
Framework mappings describe public translation rules, not separate component
implementations.

## Properties

Every property is a structured record containing at least:

- canonical camel-cased name;
- value kind and optional public type name;
- required/optional status;
- mutability;
- canonical default;
- optional controlled/uncontrolled semantics;
- optional read-only status and description.

Objects, arrays, callbacks, templates, and element references remain properties
rather than serialized attributes. Defaults are contract data so generators do
not infer them from framework source.

## Attributes

Attributes are the serializable declarative subset of properties. Every
attribute record states:

- dash-cased public name;
- canonical property target;
- primitive/enum value kind;
- reflection direction;
- removal behavior.

Attribute removal semantics are explicit: restore the canonical default, set a
Boolean false, or set a nullable value to null. Generators must not stringify
`undefined` or `null` accidentally.

## Canonical events

Native elements emit `CustomEvent` values in the `vf-*` namespace. Event
vocabulary entries define:

- canonical name and purpose;
- bubbling, composition, and cancellation behavior;
- typed detail fields and requiredness;
- optional stable reason vocabulary.

A component references canonical events with a source classification such as
controller transition, canonical-element behavior, form integration, or direct
user action.

Framework mappings then define the public translation explicitly. For example,
`vf-value-change` can map to a React callback, Angular output, Vue
`update:modelValue`, or remain a DOM event for native HTML without changing the
canonical event meaning.

## Composition and slots

VyrnForge standardizes semantic composition regions rather than framework
syntax. The shared vocabulary includes regions such as `default`, `label`,
`description`, `prefix`, `suffix`, `trigger`, `content`, `header`, `footer`,
`actions`, `item`, `empty`, and `loading`.

Each component slot record states whether the region is required, whether it can
accept multiple nodes, and its content class. Framework mappings then select an
idiomatic mechanism:

- native named/default slots;
- React children or explicit render/content props;
- Angular content projection or templates;
- Vue slots.

This makes composition deterministic without requiring identical DOM trees.

## Methods

Public methods are structured with parameters, return type, async status, and an
optional description. They are reserved for imperative behavior that cannot be
represented reliably through properties and events, such as `focus`, `show`,
`close`, `checkValidity`, and `reportValidity`.

Internal controller mutation methods are never public contract methods.

## Form semantics

The root form-association foundation continues to define the browser contract
for `none`, `value`, and `submitter` modes and the ElementInternals lifecycle.

Each component additionally records its own form mapping:

- association mode;
- name/value/disabled/required properties where applicable;
- validity support, methods, and invalid event;
- reset support, reset event, and restored state.

MFD-1006 builds the detailed cross-framework forms/model contract on top of this
representation. MFD-1005 only ensures the schema can express the required data
without framework-source inference.

## Value and model semantics

Every component has an explicit model record, even when the kind is `none`.
Supported model classes include value, checked, selection, open, pressed, and
custom state.

The model record identifies:

- controlled-state behavior;
- canonical state property;
- optional uncontrolled/default property;
- canonical change event;
- disabled-state property when applicable;
- touched semantics.

This is the shared input for later React controlled API, Angular Forms, and Vue
`v-model` mappings rather than three independently maintained interpretations.

## Ref and imperative exposure

Every component declares whether consumers receive no imperative surface, the
canonical element, or a facade handle. It also declares the method set and
optional canonical element type.

Framework mappings select the idiomatic exposure mechanism, such as a forwarded
React ref, Angular view-child reference, Vue template ref/exposed handle, or the
native element itself.

## Framework mappings

Every canonical component contract contains explicit mappings for all four
supported web surfaces:

- `native`;
- `react`;
- `angular`;
- `vue`.

A framework mapping records:

- public package and implementation status (`current`, `target`, `migration`, or
  explicit `exception`);
- public export or native tag;
- property/input/prop/model translations;
- event callback/output/emit/model-update translations;
- slot/children/template/content-projection translations;
- value/model integration mode;
- ref exposure mode;
- optional setup requirements.

The mapping describes facade behavior. It must not become a place to embed
component-specific renderer code.

## Accessibility obligations

Accessibility remains an outcome contract. Each component records semantic and
interaction obligations such as native semantics, accessible names,
relationships, keyboard navigation, focus containment/restoration, disabled and
invalid state, and live-region behavior where applicable.

Framework generation may change syntax but may not weaken those obligations.

## Source-reading rule

Once a component is contract-complete, a framework generator should be able to
determine its public facade shape from canonical metadata and generator rules.
It must not inspect React/Angular/Vue component implementation source to discover
missing props, events, slot names, form behavior, or ref semantics.

During S10, MFD-1010 inventories the full supported non-grid catalog and marks
each component `contract-complete`, `needs-data`, or `exception-required`.
Unknown fields must be surfaced explicitly rather than guessed from source.

## Current representative records

Schema v2 is populated first for representative action, navigation, form, and
overlay components:

- Button;
- Tabs;
- Autocomplete;
- Dialog.

These records prove that the schema can represent properties, attributes,
events, composition, methods, forms, model state, refs, accessibility, and all
four framework mappings in one canonical structure. Full catalog population is
MFD-1010 after MFD-1006 through MFD-1008 define the detailed semantic mapping
rules.

## Compatibility and migration

The schema describes both implemented and target states. Native mappings are
currently implemented; React mappings may be marked as migration while S14
converges them; Angular and Vue mappings may be target-state until their
first-class packages are implemented.

Metadata status must never be used to claim a target package is already shipped.
Current package manifests and release metadata remain authoritative for the
implemented distribution state.

# Multi-Framework Component Contracts And Events

This document is the canonical human-readable contract for MF-4003, MF-4004,
and MF-4005. The machine-readable source is
`docs/metadata/component-contracts.json`.

## Contract layers

Every public non-grid component is described independently from its renderer:

```text
component contract
  properties and attributes
  events
  semantic composition regions
  public methods
  accessibility obligations
  form-association mode
        |
        +-- React renderer
        +-- native Custom Element renderer
        +-- Angular consumer mapping
        +-- Vue consumer mapping
```

The shared contract must not contain React nodes, Vue slots, Angular templates,
framework event objects, dependency-injection objects, or DOM element
instances.

## Properties and attributes

Properties are the complete typed runtime surface. Attributes are the
serializable declarative subset.

Rules:

1. Primitive string, number, and Boolean values should reflect when reflection
   is unambiguous and useful.
2. Objects, arrays, callbacks, and templates are properties only.
3. Dash-cased attributes map to camel-cased properties.
4. Attribute removal restores the documented default; it must not stringify
   `undefined` or `null`.
5. Properties assigned before connection or upgrade must be preserved.
6. Controlled and uncontrolled behavior is defined by the shared controller,
   not independently by each renderer.

## Canonical DOM events

Native elements emit `CustomEvent` values using the `vf-*` namespace. Public
component events bubble and cross composition boundaries unless a contract
explicitly documents otherwise.

Canonical event names are:

| Event                 | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `vf-value-change`     | Value transition.                              |
| `vf-open-change`      | Open/closed transition.                        |
| `vf-selection-change` | Single or multiple selection transition.       |
| `vf-checked-change`   | Checked or mixed-state transition.             |
| `vf-pressed-change`   | Pressed/selected tool transition.              |
| `vf-action`           | Primary action invocation.                     |
| `vf-dismiss`          | Dismissal request with a reason.               |
| `vf-invalid`          | Invalid form state.                            |
| `vf-reset`            | Reset to the initial form or controller state. |

Event payloads include domain values and a stable reason. They must not expose
React synthetic events, Vue component instances, Angular event emitters, or
private controller objects.

Renderer mapping is idiomatic rather than textually identical:

| Canonical DOM event   | React               | Vue                                      | Angular                                |
| --------------------- | ------------------- | ---------------------------------------- | -------------------------------------- |
| `vf-value-change`     | `onValueChange`     | `update:modelValue` or explicit listener | `valueChange` or DOM event binding     |
| `vf-open-change`      | `onOpenChange`      | `update:open` or explicit listener       | `openChange` or DOM event binding      |
| `vf-selection-change` | `onSelectionChange` | explicit listener                        | `selectionChange` or DOM event binding |

React public callbacks remain stable while internals migrate to shared
controllers. Native DOM events are not forced into React's existing prop names.

## Composition vocabulary

Frameworks compose content differently. VyrnForge therefore standardizes
semantic regions, not framework syntax.

Canonical regions include:

```text
default
label
description
prefix
suffix
trigger
content
header
footer
actions
item
empty
loading
```

React may implement a region with children or a render callback. Vue may use a
slot, Angular may use content projection or a template, and a Custom Element
may use a named slot. The meaning and accessibility relationship remain the
same.

Do not create framework-only region names when a canonical region already
expresses the intent.

## Methods

Public methods are reserved for imperative behavior that cannot be represented
reliably through properties and events, such as `focus`, `show`, `close`,
`checkValidity`, and `reportValidity`.

Methods must be renderer-safe, documented, and typed. Do not expose internal
controller mutation methods.

## Accessibility obligations

The contract records semantic outcomes rather than implementation details. A
renderer must provide equivalent:

- roles and native semantics;
- accessible names and descriptions;
- keyboard transitions;
- focus order, containment, and restoration;
- disabled and invalid states;
- live-region behavior where required.

Equivalent behavior does not require identical DOM trees.

## Current representative records

S4 records Button, Tabs, Autocomplete, and Dialog as representative contracts.
They prove the schema across action, navigation, form-control, and overlay
families. They do not claim that the native elements are implemented.

MF-4011 expands the schema across the complete component catalog. S5 and S6
supply behavior and renderer evidence before any beta maturity promotion.

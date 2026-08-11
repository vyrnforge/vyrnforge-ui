# Canonical Event And Ref Mapping Contract

- Task: MFD-1008
- Status: Accepted target contract
- Depends on: MFD-1005
- Machine-readable source: `docs/metadata/component-contracts.json`

## Purpose

This contract defines how canonical `vf-*` events, event detail, element references, and public imperative methods map into Native HTML, React, Angular, and Vue facades.

The mapping is metadata-driven. Framework generators must not inspect renderer source or add component-name conditionals to discover event payload or imperative APIs.

## Canonical events

The canonical event name, bubbling/composition/cancelability, detail fields, reason vocabulary, and event source are defined in component-contract metadata.

Framework mappings may rename the public API, but may not silently change event meaning.

## Native HTML

Native consumers receive the canonical DOM event. The public event object remains a `CustomEvent` with the declared detail contract. Imperative access is the canonical element instance and its declared public methods.

## React

A canonical event normally maps to an idiomatic callback such as `onValueChange`, `onOpenChange`, or `onSelectionChange` when that is the public package contract.

The mapping metadata declares whether the callback receives:

- the event object;
- the canonical detail object;
- the primary value; or
- an explicitly mapped payload.

React refs expose either the underlying canonical element or an explicit facade handle. Every exposed imperative method must correspond to a declared canonical method or a documented compatibility adapter. Ref forwarding must not expose private controller objects.

## Angular

Canonical events map to typed outputs or direct DOM-event binding according to metadata. Output naming is explicit and may be idiomatic (`valueChange`, `openChange`) without changing canonical semantics.

Angular element access uses a declared element/ViewChild or facade-handle contract. Public imperative methods forward to canonical methods. CVA/Form integration may subscribe to canonical events but does not replace their public semantics.

## Vue

Canonical events map to typed emits, including `update:*` model events where the model contract declares that translation. The metadata records whether the emitted payload is canonical detail, a primary value, or another explicit mapping.

Template refs expose the canonical element or a declared facade handle. Public methods remain typed and derive from canonical method metadata.

## Cancellation and propagation

When a canonical event is cancelable, a facade must preserve the ability for consumer code to cancel the corresponding action when the framework API supports it. A facade must not convert a cancelable canonical request into an informational callback that cannot influence the underlying action unless an explicit exception is recorded.

Canonical bubbling/composed behavior remains a DOM concern of the canonical implementation. Framework callbacks/outputs/emits are projections of that event, not separately dispatched semantic events.

## Imperative methods

Methods are used only for behavior that cannot be expressed reliably through state properties/events. Common categories include focus, overlay open/close operations, and form validity methods.

A framework facade must:

- expose only declared public methods;
- preserve parameter and return semantics;
- preserve async behavior where declared;
- avoid exposing private renderer/controller state;
- use one generic forwarding mechanism when possible.

## Exceptional mappings

Any event or ref mapping that cannot use the generic schema modes must be registered through MFD-1009 with framework, component scope, technical reason, tests/evidence, owner, and exit criteria.

## Acceptance mapping

This contract makes canonical event conversion and ref/imperative exposure predictable across all four supported surfaces. Public framework naming can remain idiomatic while event meaning, payload, cancellation behavior, and method ownership stay canonical and metadata-driven.

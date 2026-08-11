# Canonical Composition Mapping Contract

- Task: MFD-1007
- Status: Accepted target contract
- Depends on: MFD-1005
- Machine-readable source: `docs/metadata/component-contracts.json`

## Purpose

VyrnForge standardizes semantic composition regions, not one framework's syntax. The canonical slot vocabulary and per-component slot records are the source for framework composition mappings.

Generators and facades must not inspect React JSX, Angular templates, Vue SFCs, or Custom Element implementation source to discover composition behavior.

## Canonical rules

Each composition region declares its canonical name, requiredness, multiplicity, content kind, and description. Region meaning and accessibility relationships remain stable even when framework syntax differs.

A framework mapping selects one of the schema-defined mapping modes rather than introducing component-name special cases.

## Native HTML

Canonical regions map to Light DOM default or named slots. Direct native consumers use the canonical slot name. Complex values that are not DOM content remain properties rather than serialized slots.

## React

React composition maps deterministically to one of:

- `children` for the canonical default region;
- a named prop for a single semantic region;
- a render/content prop when the canonical region is template-like or requires data/context.

React public naming may remain compatible with the existing package API, but the mapping must be recorded in metadata. A generated facade must not create a second DOM implementation merely to support `children` or a named content prop.

## Angular

Angular composition maps deterministically to one of:

- content projection for DOM/component content;
- a typed template input/directive for template regions that require context.

The public Angular package owns framework-facing selectors/directives/templates, while the canonical implementation owns rendered semantics, focus relationships, and accessibility behavior. Consumers must not copy projection helpers into applications.

## Vue

Vue composition maps canonical regions to default or named Vue slots. Scoped/template-like regions use a declared slot contract rather than per-component wrapper logic. Vue slot names may be idiomatic aliases only when the canonical-to-public mapping is explicit in metadata.

## Deterministic representative mappings

The following representative classes must be expressible without implementation-source discovery:

- action: Button default label plus prefix/suffix;
- form: Autocomplete label, description, prefix/suffix, item, empty, loading;
- navigation: Tabs default collection composition;
- collection: item/template regions with explicit multiplicity and template semantics;
- overlay: Dialog trigger, header, content, actions, footer.

These classes establish the mapping patterns that MFD-1010 applies across the non-grid catalog.

## Accessibility and ownership

Composition mapping may change syntax but must preserve canonical semantic relationships such as accessible name/description, trigger-to-popup ownership, list/item relationships, and labelled regions. Framework packages do not duplicate those browser semantics when the canonical element already owns them.

## Unsupported mappings

If a framework cannot preserve a canonical region through the declared generic mapping modes, the component/framework pair must use the MFD-1009 exception mechanism. The exception records the technical reason, evidence, ownership, and exit criteria.

## Acceptance mapping

This contract defines deterministic native slot, React children/prop, Angular projection/template, and Vue slot mappings for representative action, form, navigation, collection, and overlay patterns. Handwritten component-specific mapping remains an explicit exception rather than a default.

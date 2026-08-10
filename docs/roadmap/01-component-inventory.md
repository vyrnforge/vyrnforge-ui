# Component Inventory

VyrnForge does not maintain a second hand-written component/status table in the
roadmap.

## Canonical catalog

The canonical structured component catalog is:

[`../metadata/components.json`](../metadata/components.json)

It owns component identity, package ownership, public-export status, maturity,
routes, evidence, framework-parity metadata, and per-component known
limitations.

## Generated views

Use generated views when a human- or tool-friendly projection is needed:

- [`../generated/component-reference.json`](../generated/component-reference.json)
  for generated framework/component reference data;
- [`../governance/repository-inventory.md`](../governance/repository-inventory.md)
  for the generated repository/component evidence inventory.

Those views must derive from canonical metadata rather than introduce another
manually maintained status list.

## Planning rule

Roadmap work may reference component IDs from the canonical catalog, but changes
to component availability or maturity must update `components.json` and its
required evidence first.

Potential future components remain `planned` in canonical metadata until an
approved implementation makes them public.

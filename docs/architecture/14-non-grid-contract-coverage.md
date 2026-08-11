# Non-Grid Canonical Contract Coverage

- Task: MFD-1010
- Depends on: MFD-1005, MFD-1006, MFD-1007, MFD-1008
- Canonical catalog: `docs/metadata/components.json`
- Canonical contract source: `docs/metadata/component-contracts.json`
- Exception source: `docs/metadata/framework-exceptions.json`

## Purpose

S11 generation must not discover public component semantics by reading React,
Angular, Vue, or Custom Element implementation source. Before generation begins,
every supported public non-grid component therefore needs an explicit coverage
classification against the schema-v2 canonical contract model.

The inventory is **derived from canonical sources**, not maintained as another
handwritten component list.

## Inventory scope

A component is in MFD-1010 scope when all of the following are true in
`docs/metadata/components.json`:

1. `publicExport` is `true`;
2. the package is `@vyrnforge/ui-components`;
3. `frameworkParity.betaScope` is `included`;
4. the component is not a data-grid or grid-feature record.

The inventory intentionally excludes `@vyrnforge/ui-data-grid` and all grid
features. Multi-framework data-grid work remains outside S10-S15.

## Coverage states

Each in-scope component resolves to exactly one state:

### `contract-complete`

A schema-v2 record exists in `component-contracts.json` and contains the
canonical property, attribute, event, composition, method, form/model, ref,
accessibility, and four-surface framework-mapping structures required by
MFD-1005 through MFD-1008.

### `exception-required`

The component is intentionally not representable by the normal canonical
contract/generator path and has a matching active or retiring record in
`framework-exceptions.json` whose scope names that component.

This is not a shortcut for incomplete contract work. The exception must satisfy
ADR-008 and have technical evidence, ownership, tests/evidence, and exit
criteria.

### `needs-contract-data`

The component is part of the supported public non-grid catalog but does not yet
have a complete schema-v2 record and is not covered by an allowed framework
exception.

This state is valid for the inventory while S10 is being completed, but **G10
cannot close while any component remains in this state**.

## Deterministic classification

For each scoped component id:

1. find the same id in `componentContracts`;
2. if a complete schema-v2 record exists, classify `contract-complete`;
3. otherwise find active/retiring exception records whose declared scope covers
   the component;
4. if such an exception exists, classify `exception-required`;
5. otherwise classify `needs-contract-data`.

Unknown contract ids or exception scopes that do not refer to a scoped catalog
component are verifier failures. Duplicate component ids are verifier failures.
A component may not be both contract-complete and exception-required unless the
exception scope is narrower than the whole component and explicitly identifies
that narrower surface.

## Completeness rule

MFD-1010 is inventory-complete when every scoped catalog record can be
classified deterministically. **G10 contract readiness is stricter:** every
scoped record must resolve to `contract-complete` or to a valid, narrowly scoped
`exception-required` state.

This distinction prevents missing components from disappearing from reports
while also preventing the presence of an inventory row from being mistaken for
contract readiness.

## Required report

The verifier/report must expose at least:

- total scoped non-grid components;
- count and ids for `contract-complete`;
- count and ids for `exception-required`;
- count and ids for `needs-contract-data`;
- unknown contract ids;
- unknown exception scopes;
- duplicate or ambiguous classifications.

The result must be sorted by canonical component id so identical repository
inputs produce identical output.

## Source-of-truth rule

Do not copy the full component list into this document or a second manually
maintained metadata array. The catalog owns component existence and support
scope; canonical contracts own semantics; the exception registry owns approved
technical divergence. Coverage is their deterministic join.

## Acceptance mapping

MFD-1010 requires a complete non-grid contract coverage inventory. This
contract defines the entire supported non-grid catalog as the inventory domain,
assigns every record a deterministic coverage state, rejects unknown or
ambiguous records, and makes zero unresolved contract-data entries a G10
readiness requirement.

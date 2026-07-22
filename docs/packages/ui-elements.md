# `@vyrnforge/ui-elements` — Planned

## Purpose

`@vyrnforge/ui-elements` is the approved native Custom Element renderer for
public non-grid VyrnForge components. The package does not exist yet;
implementation begins after shared behavior parity.

## Planned ownership

- `vf-*` Custom Elements;
- explicit and per-element registration entry points;
- typed properties and attribute reflection;
- canonical bubbling/composed `vf-*` DOM events;
- Light DOM rendering;
- form-associated element integration;
- native focus and overlay adapters.

## Boundary

The package may depend on `@vyrnforge/ui-core` and
`@vyrnforge/ui-behaviors`. It must not depend on React, React DOM, Vue,
Angular, `@vyrnforge/ui-components`, or `@vyrnforge/ui-data-grid`.

Light DOM is the default. Shadow DOM requires explicit component-level
approval.

## Release direction

The package is included in the planned coordinated non-grid beta release group.
Angular and Vue support claims require clean consumer and browser evidence under
GMF4.

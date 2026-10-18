# VyrnForge

VyrnForge is being rebuilt as a framework-neutral UI foundation with idiomatic React, Angular, Vue, Custom Elements, and Native Web surfaces.

## Rebuild status

The repository is in foundation bootstrap. Legacy implementation is quarantined in `packages/legacy` and is not an architectural source of truth.

The initial public package topology is:

- `@vyrnforge/core`
- `@vyrnforge/web`
- `@vyrnforge/react`
- `@vyrnforge/angular`
- `@vyrnforge/vue`
- `@vyrnforge/elements`

No component implementation should be added until its canonical contract and required foundation work are established.

## Repository areas

- `packages/` — public package skeletons plus the temporary private legacy quarantine.
- `documentation/` — repository-owned public documentation sources.
- `examples/` — executable public usage examples as they are introduced.
- `fixtures/` — repository-only consumer and validation fixtures.
- `tooling/` — repository-only architecture, impact analysis, verification, and quality infrastructure.

Canonical architecture and standards live in the VyrnForge Google Drive documentation.

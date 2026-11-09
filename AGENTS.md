# VyrnForge repository guidance

Canonical VyrnForge architecture and standards live in the connected Google Drive documentation, not in retired repository implementations.

The repository is being rebuilt from zero conceptually. Retired implementations in Git history are historical reference only.

Public package direction:

- `@vyrnforge/core`
- `@vyrnforge/web`
- `@vyrnforge/icons`
- `@vyrnforge/react`
- `@vyrnforge/angular`
- `@vyrnforge/vue`
- `@vyrnforge/elements`

Repository implementation roots are intentionally limited to `packages/`, `product/`, `apps/`, `documentation/`, and `tooling/`. Shared component authoring lives under the approved layered product-unit hierarchy `product/components/<layer>/<optional-category>/<id>/`. Product-owned framework/Web implementation sources are projected into stable public package paths; package shells, package-wide metadata, and package verification remain package-owned.

Repository tooling is private, organized by durable function, and need-driven rather than a fixed directory checklist. Each top-level tooling capability owns a local `README.md`, and `tooling/README.md` defines the placement rules. Do not create random top-level tooling buckets, catch-all `scripts`/`utils` areas, or placeholder roots. Quality-specific reusable validation infrastructure belongs beneath `tooling/testing/` when that is the correct recurring owner.

Do not introduce sibling-port dependencies, a universal component runtime, framework-specific shared contracts, or application business architecture.

Before substantial work, inspect the relevant canonical documentation and current repository state.

For new component implementations, existing-component migrations, new framework ports, or material component behavior/API/visual changes, follow the repository skill at `.agents/skills/vyrnforge-component-delivery/SKILL.md`. Classify NEW vs MIGRATE and complete the contract, ownership, implementation, evidence and approval gates. Canonical Drive standards remain authoritative; the skill is an operational procedure, not another component contract. Do not auto-merge a user-facing visual redesign without actual-size evidence and explicit visual acceptance.

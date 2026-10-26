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

Repository implementation roots are intentionally limited to `packages/`, `product/`, `apps/`, `documentation/`, and `tooling/`. Shared cross-package component ownership lives under `product/<component>/`; runtime implementation remains in the owning package.

Repository tooling is organized only by durable function: `build/`, `ci/`, `docs/`, `impact/`, `release/`, `testing/`, `tokens/`, and `verify/`. Do not create random top-level tooling buckets, catch-all `scripts`/`utils` areas, or placeholder roots. Quality-specific reusable validation infrastructure belongs beneath `tooling/testing/`.

Do not introduce sibling-port dependencies, a universal component runtime, framework-specific shared contracts, or application business architecture.

Before substantial work, inspect the relevant canonical documentation and current repository state.

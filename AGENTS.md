# VyrnForge repository guidance

Canonical VyrnForge architecture and standards live in the connected Google Drive documentation, not in legacy repository code.

The repository is being rebuilt from zero conceptually. Treat `packages/legacy` as historical reference only.

Public package direction:

- `@vyrnforge/core`
- `@vyrnforge/web`
- `@vyrnforge/react`
- `@vyrnforge/angular`
- `@vyrnforge/vue`
- `@vyrnforge/elements`

Do not introduce sibling-port dependencies, a universal component runtime, framework-specific shared contracts, or application business architecture.

Before substantial work, inspect the relevant canonical documentation and current repository state.

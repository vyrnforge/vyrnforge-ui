# Migration Guide

VyrnForge is still in the `0.x` release line. Until `1.0.0`, breaking changes may occur in minor releases while public contracts are finalized.

Consumers should pin exact versions during beta adoption and review the changelog and release notes before upgrading.

## Canonical migration guidance

For React, Native HTML, Angular, and Vue migration guidance, supported integration boundaries, and current limitations, use:

```text
docs/release/multi-framework-migration-and-limitations.md
```

For deprecation timelines, compatibility expectations, and public API removal policy, use:

```text
docs/release/deprecation-and-migration-policy.md
```

For package versions and prerelease compatibility rules, use:

```text
docs/release/versioning-policy.md
```

## Architecture constraints

Migrations must preserve VyrnForge's shared design system and framework-independent foundations. React and native HTML are first-class web targets; Angular and Vue consume the verified Custom Element foundation unless a future accepted architecture decision introduces a first-class framework package.

VyrnForge remains dependency-minimal and store-agnostic. Do not introduce application state-management or heavyweight UI-framework dependencies into shared packages as part of a migration.

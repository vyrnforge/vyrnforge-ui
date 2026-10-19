# Migration Guide

VyrnForge is still in the `0.x` release line. Until `1.0.0`, breaking changes may occur in minor releases while public contracts are finalized.

Consumers should pin exact versions during beta adoption and review the changelog and release notes before upgrading.

## Canonical migration guidance

For Native HTML / Custom Elements, React, Angular, and Vue migration guidance, supported integration boundaries, and current limitations, use:

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

Native HTML / Custom Elements, React, Angular, and Vue are equal first-class VyrnForge surfaces over the same design system, canonical component contracts, shared behavior and accessibility model, styling foundation, terminology, and support expectations. Internal reuse of the Custom Element implementation does not make Angular or Vue secondary surfaces.

Migrations should preserve framework-idiomatic public APIs while reusing shared VyrnForge foundations wherever practical. Prefer existing VyrnForge packages, contracts, behaviors, generators, and extension points over application-owned wrappers.

VyrnForge remains dependency-minimal and store-agnostic. Do not introduce application state-management or heavyweight UI-framework dependencies into shared packages as part of a migration.

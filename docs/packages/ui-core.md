# `@vyrnforge/ui-core`

## Purpose

`@vyrnforge/ui-core` is the lowest-level framework-neutral design foundation.

It provides:

- primitive and semantic design tokens;
- themes and theme contracts;
- density contracts;
- typography roles;
- motion and reduced-motion behavior;
- deterministic layer levels;
- shared utility classes;
- typed token and theme helper contracts.

It does not own framework renderers, component behavior controllers, data-grid
behavior, application state, adapters, or business workflows.

## Multi-framework role

All first-class VyrnForge surfaces consume the same token and styling
foundation. `ui-core` remains framework-neutral and must not depend on a
framework renderer or application-state runtime.

The package may expose framework-neutral TypeScript values and functions. It
must not execute browser-global behavior at module import time.

Exact package dependency edges are owned by
[`../metadata/packages.json`](../metadata/packages.json), package manifests, and
[Package Boundaries](../architecture/01-package-boundaries.md); do not maintain a
second dependency matrix here.

## Ownership

- `--vf-*` primitive and semantic variables;
- shared non-component `vf-*` utility classes;
- theme presets and complete theme-scoped token maps;
- density sizing and compatibility aliases;
- typography, motion, focus, status, and layer roles.

The machine-readable token source is
[`../metadata/design-tokens.json`](../metadata/design-tokens.json).

## Import

```ts
import "@vyrnforge/ui-core/styles/index.css";
```

Import core styles before renderer or grid styles when the consuming surface
requires explicit stylesheet management.

## Release and compatibility

Release-group membership, versions, and compatibility classification are owned
by canonical release metadata and package manifests. This package guide
intentionally does not duplicate the current release channel.

See:

- [Semantic Token Contract](../architecture/08-semantic-token-contract.md)
- [Multi-Framework Web Support](../architecture/adr-004-multi-framework-web-support.md)
- [Package metadata](../metadata/packages.json)
- [Release documentation](../release/README.md)

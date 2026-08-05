# `@vyrnforge/ui-core`

## Purpose

`@vyrnforge/ui-core` is the lowest-level framework-neutral design foundation.

It provides:

- primitive and semantic design tokens;
- light, dark, enterprise, and system themes;
- compact, balanced, and spacious density contracts;
- typography roles;
- motion and reduced-motion behavior;
- deterministic layer levels;
- shared utility classes;
- typed token and theme helper contracts.

It does not own React components, Custom Element renderers, behavior
controllers, grid behavior, application state, adapters, or business workflows.

## Multi-framework role

Both the React and native element renderers consume the same token and CSS
contract. `ui-core` must not depend on React, React DOM, Vue, Angular,
`ui-behaviors`, `ui-components`, `ui-elements`, or `ui-data-grid`.

The package may expose framework-neutral TypeScript values and functions. It
must not execute browser-global behavior at module import time.

## Ownership

- `--vf-*` primitive and semantic variables;
- shared non-component `vf-*` utility classes;
- theme presets and complete theme-scoped token maps;
- density sizing and compatibility aliases;
- typography, motion, focus, status, and layer roles.

The machine-readable token source is
`docs/metadata/design-tokens.json`.

## Import

```ts
import "@vyrnforge/ui-core/styles/index.css";
```

Import core styles before renderer or grid styles.

## Density names

Canonical:

- `compact`
- `balanced`
- `spacious`

Compatibility:

- `standard` -> `balanced`
- `comfortable` -> `spacious`

## Release direction

`@vyrnforge/ui-core` is part of the coordinated non-grid beta release group.

See:

- `../architecture/08-semantic-token-contract.md`
- `../architecture/adr-004-multi-framework-web-support.md`
- `../metadata/multi-framework.json`

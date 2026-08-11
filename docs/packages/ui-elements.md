# `@vyrnforge/ui-elements`

## Purpose

`@vyrnforge/ui-elements` is VyrnForge's first-class browser-native Custom
Element renderer for the public non-grid foundation.

It provides explicit registration, Light DOM rendering, typed canonical
`vf-*` events, form-associated element foundations, package-owned styles, and
editor metadata without a React, Angular, or Vue runtime dependency.

## Install

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta
```

## Register

The package root is side-effect free:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";

import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

Applications may instead opt into explicit side-effect registration:

```ts
import "@vyrnforge/ui-elements/register";
```

Registration is deterministic and idempotent.

## Renderer contract

The native renderer:

- uses Light DOM by default;
- consumes shared `--vf-*` tokens;
- keeps arrays and objects as DOM properties;
- uses canonical typed `vf-*` events;
- participates in native forms through the documented form-association contract;
- keeps package-root imports safe when browser globals are unavailable.

Angular and Vue are verified consumers of this same native renderer. Framework
forms/model adapters are thin integration layers and do not duplicate rendering
or accessibility behavior.

## Public surface

Use [ui-elements API](../api/ui-elements-api.md) and the
[generated component reference](../generated/component-reference.json).

Editor tooling can consume:

```text
@vyrnforge/ui-elements/custom-elements.json
```

## Release channel

`@vyrnforge/ui-elements` is part of the synchronized non-grid `beta` release
group.

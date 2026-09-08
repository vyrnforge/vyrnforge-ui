# @vyrnforge/ui-elements

First-class browser-native Custom Elements for the VyrnForge enterprise UI
foundation.

## Install

```bash
npm install @vyrnforge/ui-elements@beta
```

Shared VyrnForge foundations are package dependencies and are installed
transitively. Native HTML applications do not need to install or coordinate the
internal foundation graph separately.

## Register and use

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

The public package entrypoint loads the Native HTML surface styling. Hosts that
intentionally manage stylesheet loading can import the public surface CSS
explicitly:

```ts
import "@vyrnforge/ui-elements/styles/index.css";
```

The package root does not register Custom Elements automatically. Applications
may instead opt into the explicit registration side-effect entrypoint:

```ts
import "@vyrnforge/ui-elements/register";
```

The native renderer uses Light DOM, canonical `vf-*` events, shared VyrnForge
tokens, and the documented native form-association model. It has no React,
Angular, or Vue runtime dependency.

Angular and Vue are first-class facades over this canonical renderer. Normal
Angular and Vue applications should consume `@vyrnforge/ui-angular` or
`@vyrnforge/ui-vue` rather than assembling the native implementation packages
themselves.

Canonical documentation:

- `docs/packages/ui-elements.md`
- `docs/api/ui-elements-api.md`
- `docs/generated/component-reference.json`
- `docs/architecture/10-custom-elements-and-form-association.md`

Editor tooling can consume:

```text
@vyrnforge/ui-elements/custom-elements.json
```

The package is part of the synchronized non-grid `beta` release group.

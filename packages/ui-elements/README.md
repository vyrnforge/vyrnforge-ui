# @vyrnforge/ui-elements

First-class browser-native Custom Elements for the VyrnForge enterprise UI
foundation.

## Install

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta
```

## Register and use

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";

import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

The package root is side-effect free. Applications may instead use:

```ts
import "@vyrnforge/ui-elements/register";
```

The native renderer uses Light DOM, canonical `vf-*` events, shared VyrnForge
tokens, and the documented native form-association model. It has no React,
Angular, or Vue runtime dependency.

Angular and Vue are verified consumers of this native renderer. Their
forms/model integrations remain thin consumer adapters.

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

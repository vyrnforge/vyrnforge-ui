# `@vyrnforge/ui-components`

## Purpose

`@vyrnforge/ui-components` is VyrnForge's first-class React renderer for
reusable primitives and enterprise application components.

It owns React props, callbacks, hooks, refs, JSX composition, renderer-specific
DOM adapters, and React component styling. Portable behavior is delegated to
`@vyrnforge/ui-behaviors` where it is shared with the native renderer.

## Install

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta
```

## Import

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";

import { Button } from "@vyrnforge/ui-components";
```

## Dependencies

The package may depend on:

- `@vyrnforge/ui-core`;
- `@vyrnforge/ui-behaviors`;
- React and React DOM as peer dependencies.

It must not depend on `@vyrnforge/ui-elements`,
`@vyrnforge/ui-data-grid`, an application store, or a large third-party UI
runtime.

React is a first-class renderer, not the implementation runtime for native
HTML, Angular, or Vue consumers.

## Public surface

Use [ui-components API](../api/ui-components-api.md) and the
[generated component reference](../generated/component-reference.json) for the
current public component surface. Component maturity and known limitations are
canonical in [`../metadata/components.json`](../metadata/components.json);
do not duplicate that catalog here.

## Release channel

`@vyrnforge/ui-components` is part of the synchronized non-grid `beta` release
group.

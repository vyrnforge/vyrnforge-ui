# @vyrnforge/ui-behaviors

Framework-neutral controller and behavior primitives for VyrnForge UI.

The package owns portable state transitions and interaction decisions used by
renderers. It does not render UI, execute DOM operations, manage application
business state, or require React, Angular, Vue, or an application store.

## Install

```bash
npm install @vyrnforge/ui-behaviors@beta
```

## Use

```ts
import {
  createCollectionController,
  createControllableState,
  createSelectionController,
} from "@vyrnforge/ui-behaviors";
```

The public surface includes shared controller families for state, collections,
selection, navigation, overlays, form-related behavior, feedback, and reasoned
events.

`@vyrnforge/ui-behaviors` may depend on `@vyrnforge/ui-core` only and owns no
CSS.

Canonical documentation:

- `docs/packages/ui-behaviors.md`
- `docs/api/ui-behaviors-api.md`
- `docs/architecture/02-state-and-adapter-ownership.md`

The package is part of the synchronized non-grid `beta` release group.

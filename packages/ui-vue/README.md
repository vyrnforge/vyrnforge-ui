# @vyrnforge/ui-vue

First-class Vue facade workspace for VyrnForge.

`@vyrnforge/ui-vue` is a thin Vue adapter over the canonical native implementation in `@vyrnforge/ui-elements`. It owns Vue-facing component definitions and typing, while rendering, accessibility behavior, styling, and shared state semantics remain in VyrnForge's framework-agnostic/native foundations.

## Initial public surface

MFD-1301 promotes the proven S11 generated Vue vertical slices into the public package workspace:

- `VfButton`
- `VfDialog`
- `VfTabs`
- `VfTextInput`

These exports intentionally match the generated S11 adapters. Full non-grid catalog generation is tracked separately so this workspace does not invent hand-written Vue implementations ahead of the shared generator work.

```ts
import { VfButton, VfDialog, VfTabs, VfTextInput } from "@vyrnforge/ui-vue";
```

The low-friction Vue setup/plugin path, complete generated catalog, generalized `v-model` mapping, and package-consumer fixture cutover are subsequent Vue-lane tasks. Until those land, this package is the public workspace boundary and generated facade source of truth, not a second rendering implementation.

## Development

```bash
npm run build --workspace @vyrnforge/ui-vue
npm run typecheck --workspace @vyrnforge/ui-vue
npm run test --workspace @vyrnforge/ui-vue
```

The package depends on `@vyrnforge/ui-elements`; Vue is a peer runtime and is externalized from the bundle. The supported peer range is validated separately by the dedicated Vue peer-dependency-policy task.

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Package metadata uses `SEE LICENSE IN LICENSE`, and the package-local `LICENSE` matches the repository root license.

# @vyrnforge/ui-vue

First-class Vue facade workspace for VyrnForge.

`@vyrnforge/ui-vue` is a thin Vue adapter over the canonical native implementation in `@vyrnforge/ui-elements`. It owns Vue-facing component definitions and typing, while rendering, accessibility behavior, styling, and shared state semantics remain in VyrnForge's framework-agnostic/native foundations.

## Setup

Use the Vue plugin in normal applications:

```ts
import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";
import App from "./App.vue";

createApp(App).use(VyrnForgeVue).mount("#app");
```

The plugin registers VyrnForge's canonical custom elements and the public `Vf*` Vue facade components. Consumers using those facade components do not need to copy `@vyrnforge/ui-elements/register` imports or configure Vue's template compiler to recognize `vf-*` tags.

For advanced hosts that provide a custom element registry, use `createVyrnForgeVue({ elementRegistry })` or `installVyrnForgeVue(app, { elementRegistry })`.

## Initial public surface

- `VfButton`
- `VfDialog`
- `VfTabs`
- `VfTextInput`

Full non-grid catalog generation is tracked separately so this workspace does not invent hand-written Vue implementations ahead of the shared generator work.

## Development

```bash
npm run build --workspace @vyrnforge/ui-vue
npm run typecheck --workspace @vyrnforge/ui-vue
npm run test --workspace @vyrnforge/ui-vue
```

The package depends on `@vyrnforge/ui-elements`; Vue is a peer runtime and is externalized from the bundle. The supported peer range is validated separately by the dedicated Vue peer-dependency-policy task.

The workspace remains marked `private` during the staged Vue lane so it is not accidentally treated as release-ready before the dedicated release-integration task adds package/release verification and publication metadata.

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Package metadata uses `SEE LICENSE IN LICENSE`, and the package-local `LICENSE` matches the repository root license.

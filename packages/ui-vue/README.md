# @vyrnforge/ui-vue

First-class Vue facade package for VyrnForge.

`@vyrnforge/ui-vue` is a thin Vue adapter over the canonical native implementation in `@vyrnforge/ui-elements`. It owns Vue-facing component definitions, typing, `v-model` mappings, slots, refs, events, and setup helpers while rendering, accessibility behavior, forms, styling, and shared state semantics remain in VyrnForge's framework-agnostic/native foundations.

The supported Vue peer range is `>=3.5 <4`. Vue is not bundled into the package.

## Install

The package is part of the synchronized `non-grid-beta` release group and is consumed through the explicit beta channel:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-vue@beta vue
```

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

Public components can also be imported directly from `@vyrnforge/ui-vue`. Direct component imports still require canonical element registration before browser interaction; the plugin is the normal application path because it handles both responsibilities consistently.

## Public surface

The package exposes the generated canonical non-grid component catalog rather than a four-component proof slice. Vue facade names, props, emits, model mappings, slot metadata, imperative methods, and ref types derive from shared VyrnForge metadata and generators.

Representative usage:

```vue
<script setup lang="ts">
import { VfButton, VfDialog, VfTextInput } from "@vyrnforge/ui-vue";
</script>

<template>
  <VfTextInput v-model="owner" label="Owner" />
  <VfDialog v-model:open="open">
    <template #actions>
      <VfButton action="save">Save</VfButton>
    </template>
  </VfDialog>
</template>
```

Use Vue-facing emits and `v-model` for normal facade integration. Canonical `vf-*` DOM events and raw `<vf-*>` elements remain supported interoperability escape hatches when an application intentionally needs the native platform contract.

## Forms, refs, slots, and SSR

- `v-model` mappings are generated from canonical model metadata.
- Named Vue slots preserve canonical Light DOM slot composition.
- Typed component refs expose supported canonical imperative methods directly.
- Native form association and validity remain implemented by the custom elements through `ElementInternals`.
- Importing the package is server-safe; browser element registration is deferred when browser globals are unavailable.

See [`docs/packages/ui-vue.md`](../../docs/packages/ui-vue.md) for the complete setup, model, event, slot, typed-ref, form, SSR, raw-element escape-hatch, and migration contract.

## Migration from fixture-local adapters

Do not copy generated Vue wrappers, model adapters, or fixture-local declaration bridges into application code. The supported path is the package-owned generated facade from `@vyrnforge/ui-vue`. The packed Vue consumer fixture exercises that public path from real package tarballs.

## Development

```bash
npm run build --workspace @vyrnforge/ui-vue
npm run typecheck --workspace @vyrnforge/ui-vue
npm run test --workspace @vyrnforge/ui-vue
```

Release verification additionally covers package contents, declarations, size budgets, clean tarball consumption, compatibility metadata, SSR, browser behavior, accessibility automation, and packed four-surface integration. External trusted-publisher evidence and manual assistive-technology completion remain governed separately and are not implied by repository package verification.

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Package metadata uses `SEE LICENSE IN LICENSE`, and the package-local `LICENSE` matches the repository root license.

# Vue package

`@vyrnforge/ui-vue` is the first-class Vue facade over the canonical `@vyrnforge/ui-elements` implementation. It provides Vue-native component names, `v-model` mappings, typed emits, slots, refs, and setup helpers while preserving the same rendering, behavior, accessibility, form, styling, and event contracts used by the other VyrnForge surfaces.

## Support and package boundary

The supported Vue runtime contract is `>=3.5 <4`.

- Vue is a required peer of `@vyrnforge/ui-vue`; it is not bundled into the package.
- Shared foundations remain Vue-independent. `ui-core`, `ui-behaviors`, and `ui-elements` do not acquire Vue runtime or peer dependencies.
- The Vue facade delegates canonical rendering to `@vyrnforge/ui-elements`; application state management remains a consumer concern.
- The base Vue package exposes the canonical non-grid catalog. Data-grid framework work remains independently packaged and tracked.

The workspace remains private while the Vue lane is staged. Release integration owns removing that staging guard after compatibility and accessibility evidence passes.

## Setup

Use the package plugin for normal applications:

```ts
import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";
import App from "./App.vue";

createApp(App).use(VyrnForgeVue).mount("#app");
```

`VyrnForgeVue` registers the canonical VyrnForge custom elements and all public `Vf*` facade components. Consumers using the facade components do not need to copy `@vyrnforge/ui-elements/register` or configure Vue compiler `isCustomElement` rules.

For controlled setup, including hosts that provide an explicit custom-element registry, use `createVyrnForgeVue(options)` or `installVyrnForgeVue(app, options)`.

Public components can also be imported directly:

```vue
<script setup lang="ts">
import { VfButton, VfTextInput } from "@vyrnforge/ui-vue";
</script>

<template>
  <VfTextInput v-model="owner" label="Owner" />
  <VfButton action="save">Save</VfButton>
</template>
```

Direct component imports still require the canonical elements to be registered before browser interaction. The package plugin is the default application setup because it performs both responsibilities consistently.

## `v-model`

Vue model names are generated from the canonical component model contract rather than maintained as a separate Vue-only model list.

Common mappings include:

```vue
<VfTextInput v-model="text" />
<VfCheckbox v-model="checked" />
<VfDialog v-model:open="dialogOpen" />
<VfToggleButton v-model:pressed="pressed" />
<VfMultiSelect v-model="selectedValues" />
```

The facade translates between Vue model events and the canonical element property/event pair. For example, text-like controls map `modelValue` to the native `value` property and canonical `vf-value-change` event, while checked controls map through `checked` and `vf-checked-change`. Array-valued models use equivalence checks that avoid duplicate parent updates when the canonical value is unchanged.

## Events

Use Vue-facing emits for normal facade integration. Generated emits are typed from canonical event metadata.

```vue
<VfDialog
  v-model:open="open"
  @dismiss="handleDismiss"
/>
```

Canonical `vf-*` DOM listeners are also available as typed passthrough attributes when a consumer intentionally needs the native event contract:

```vue
<VfButton @vf-action="handleCanonicalAction">Save</VfButton>
```

Prefer Vue-facing emits when both forms represent the same interaction. Use canonical DOM events for lower-level interoperability, event delegation, or code shared with Native HTML consumers.

## Slots and composition

Vue slots preserve the canonical Light DOM slot contract. Default slot roots pass through without wrapper elements. Named element roots receive the canonical `slot` assignment directly; fragment roots are flattened; only non-element roots such as text require the smallest fallback wrapper.

```vue
<VfDialog v-model:open="open">
  <template #trigger>
    <button type="button">Open</button>
  </template>

  <template #header>Account details</template>

  <template #content>
    <AccountForm />
  </template>

  <template #actions>
    <VfButton action="save">Save</VfButton>
  </template>
</VfDialog>
```

Omitting an optional Vue slot does not manufacture placeholder content, so canonical element fallback behavior remains intact.

## Typed refs and imperative methods

Vue component refs expose canonical imperative methods directly. Consumers do not need to query internal DOM or reach through an implementation-only element reference for documented operations.

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  VfDialog,
  VfPopover,
  VfTextInput,
  type VfDialogRef,
  type VfPopoverRef,
  type VfTextInputRef,
} from "@vyrnforge/ui-vue";

const inputRef = ref<VfTextInputRef | null>(null);
const dialogRef = ref<VfDialogRef | null>(null);
const popoverRef = ref<VfPopoverRef | null>(null);

function validate(): boolean {
  inputRef.value?.focus();
  return inputRef.value?.reportValidity() ?? true;
}

function openDialog(): void {
  dialogRef.value?.show();
}

function toggleHelp(): void {
  popoverRef.value?.toggle();
}
</script>
```

Method availability is generated from canonical method metadata. Examples include focus/click, validity methods, selection, overlay show/close/toggle, and confirm/cancel where those methods exist on the canonical component.

The typed ref also exposes the underlying canonical `element` for advanced interoperability. Treat that as an escape hatch; prefer the generated direct methods for documented imperative operations.

## Native forms

Canonical form association remains implemented by the custom elements through `ElementInternals`. The Vue facade does not replace native validity or form submission semantics.

Use facade components for Vue model integration and native element capabilities for normal HTML form participation. `checkValidity`, `reportValidity`, and `setCustomValidity` are surfaced as typed ref methods on components whose canonical contracts expose them.

## SSR and server imports

Importing `@vyrnforge/ui-vue` is server-safe and does not require browser globals. Custom-element registration is safely deferred by `@vyrnforge/ui-elements` when no `customElements` registry exists.

The package verifies:

- direct Node server import without DOM globals;
- Vue server rendering of the public facade/plugin path;
- Vite SSR build and execution;
- browser registration after entering a browser-capable environment.

Do not perform application-specific DOM work during module evaluation merely because the package itself is server-safe.

## Raw Native HTML escape hatch

Applications can intentionally use canonical `<vf-*>` elements alongside Vue facade components when they need the raw platform contract.

```vue
<template>
  <vf-text-input
    name="owner"
    required
    @vf-value-change="handleNativeValue"
  ></vf-text-input>
</template>
```

Raw custom-element templates may require Vue compiler `isCustomElement` configuration and local template typing depending on the application toolchain. That configuration is not required for normal `Vf*` facade usage.

Use the raw path deliberately; do not recreate Vue adapters, model wrappers, or generated facade copies in application code.

## Migration from the pre-package fixture pattern

Older consumer evidence used fixture-local generated wrappers and model adapters. The supported package path replaces that infrastructure:

1. Import facade components from `@vyrnforge/ui-vue` instead of copying generated files.
2. Install `VyrnForgeVue` instead of importing `@vyrnforge/ui-elements/register` solely for facade setup.
3. Replace local `modelValue`/canonical-event bridge wrappers with the generated facade `v-model` contract.
4. Replace wrapper-specific named-slot markup with public Vue slots.
5. Replace internal DOM queries or `.element` method calls with typed direct component-ref methods where available.
6. Keep raw `<vf-*>` usage only where the application intentionally needs the Native HTML escape hatch.

The real packed Vue consumer fixture follows this public path and contains application code rather than private package adapter copies.

## Verification boundaries

Package tests verify peer policy, generated catalog/model/type/method coverage, zero-config facade consumption, SSR, and deterministic generation. The packed consumer verifies production build and browser behavior. Compatibility/accessibility evidence and final publish/release classification are separately dependency-tracked so staging status is not confused with release readiness.

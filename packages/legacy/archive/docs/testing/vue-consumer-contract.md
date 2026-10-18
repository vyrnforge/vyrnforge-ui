# Vue Consumer Contract

The Vue consumer contract verifies `@vyrnforge/ui-vue` as the first-class Vue
facade over VyrnForge's framework-neutral/native foundations. The
machine-readable fixture source of truth is `docs/metadata/vue-consumer.json`;
Vue package support evidence is recorded in
`docs/metadata/vue-support-evidence.json`.

## Supported Vue line

The public package peer policy is `>=3.5 <4`. Compatibility evidence covers the
supported Vue 3.5 line at the repository's minimum/current compatibility cases.
The clean consumer fixture remains outside the VyrnForge npm workspace so packed
runtime evidence cannot be satisfied by workspace links.

Vue, Vite, `@vitejs/plugin-vue`, `vue-tsc`, and TypeScript are fixture-owned
third-party tooling. VyrnForge's shared foundations remain Vue-independent; the
Vue runtime is a peer of `@vyrnforge/ui-vue` and is not bundled into the package.

## Normal application contract

`tests/consumers/vue` proves the package-owned facade path:

1. clean installation from packed VyrnForge package artifacts;
2. no workspace symlink, repository-source import, or fixture-local generated
   facade copy;
3. application setup through `VyrnForgeVue` for canonical element registration
   and public facade registration;
4. generated `Vf*` components and package-owned TypeScript declarations;
5. scalar/object/array property behavior derived from canonical metadata;
6. typed Vue-facing emits plus canonical `vf-*` DOM-event interoperability;
7. generated `v-model` mappings for canonical value/checked/open/pressed and
   other modeled state;
8. named Vue slots preserving canonical Light DOM composition;
9. typed component refs and supported imperative methods;
10. native `ElementInternals` validity and form submission;
11. strict `vue-tsc`, production Vite build, SSR-safe import/server rendering,
    and Chromium interaction;
12. automated keyboard/focus and accessibility checks covered by the current
    repository evidence model.

Raw `<vf-*>` templates remain a supported Native HTML interoperability escape
hatch. That path may require Vue compiler `isCustomElement` configuration and
local template typing, but those requirements do not apply to normal `Vf*`
facade consumption.

## `v-model` boundary

Vue models are generated from the canonical component model contract rather than
maintained as a separate application adapter layer. The facade translates Vue
model properties and `update:*` emits to the canonical element property/event
pair while preserving the native renderer's validation, selection, composition,
and form-association behavior.

Representative mappings include:

```vue
<VfTextInput v-model="text" />
<VfCheckbox v-model="checked" />
<VfDialog v-model:open="open" />
<VfToggleButton v-model:pressed="pressed" />
```

Consumers should not recreate fixture-local `modelValue` bridges for mappings
already provided by `@vyrnforge/ui-vue`.

## Slots, refs, and native integration

Generated slot metadata maps Vue slots to canonical Light DOM slots. Generated
ref types expose documented canonical methods directly, including focus,
validity, selection, and overlay operations where supported. The underlying
canonical element remains available as an advanced interoperability escape hatch,
but private DOM traversal is not the normal public API.

Native form participation remains owned by the Custom Element implementation;
the Vue facade does not replace `ElementInternals` validity or submission
semantics.

## SSR and bundler contract

Importing `@vyrnforge/ui-vue` must not require browser globals. Verification
covers direct Node import, Vue server rendering, SSR bundler execution, clean
production Vite output, and later browser registration in a browser-capable
environment.

## Required commands

```bash
npm run test:vue-consumer
npm run verify:vue-consumer
npm run verify:vue-consumer:runtime
npm run verify:compatibility-release-matrix
npm run quality
```

The broader release gate additionally verifies the real Vue tarball, package
contents/declarations, size budgets, packed four-surface integration, and
release-group metadata. Repository automation does not by itself claim completed
manual screen-reader review or completed external trusted-publisher evidence;
those controls remain separately governed.

# Vue Consumer Contract

CF-7005 verifies Vue as a packed consumer
of the framework-neutral native renderer. The machine-readable source of truth is
`docs/metadata/vue-consumer.json`.

## Supported fixture line

The fixture pins Vue 3.5.40, Vite 8.1.5, `@vitejs/plugin-vue` 6.0.8,
`vue-tsc` 3.3.8, and TypeScript 6.0.3. It remains outside the VyrnForge npm
workspace so the pending runtime evidence cannot be satisfied by workspace
links. Strict template checking uses the consumer-local
`tests/consumers/vue/src/vyrnforge-elements.d.ts` bridge. VyrnForge remains
framework-neutral and does not publish Vue-specific declarations.

## Vue references

- https://www.npmjs.com/package/vue
- https://www.npmjs.com/package/@vitejs/plugin-vue
- https://www.npmjs.com/package/vue-tsc

## Runtime contract

`tests/consumers/vue` proves:

1. clean Vue dependency installation;
2. clean installation of packed `ui-core`, `ui-behaviors`, and `ui-elements`;
3. no workspace symlink or repository-source import;
4. compiler recognition of every `vf-*` tag through `isCustomElement`;
5. explicit `@vyrnforge/ui-elements/register` registration;
6. scalar attributes and forced DOM property binding through `.prop`;
7. canonical DOM event binding through `@vf-action` and
   `@vf-value-change`;
8. named Light DOM composition;
9. native `ElementInternals` form submission;
10. consumer-local Custom Element, canonical event, native `slot`, and `data-*` template typings;
11. strict `vue-tsc`, production Vite build, and Chromium interaction.

## `v-model` boundary

CF-7005 defines direct property and canonical event consumption. Vue's
component-oriented `v-model` protocol expects `modelValue` and
`update:modelValue`, which does not automatically map to native VyrnForge
`value`/`checked` properties and `vf-value-change`/`vf-checked-change` events.
CF-7006 supplies the separate thin integration adapter described in
`vue-model-adapter-contract.md`. It translates Vue syntax without duplicating
native rendering, validation, selection, or form-association behavior.

## Required commands

```bash
npm run test:vue-consumer
npm run verify:vue-consumer
npm run verify:vue-consumer:runtime
npm run quality
```

GMF4 remains in progress. CF-7005 is `packed-vue-runtime-verified` after the
clean packed installation, strict `vue-tsc`, production Vite build, and
Chromium matrix pass. The Vue model adapter, shared browser and accessibility
matrices, documentation generation, and final compatibility review remain S7
work.

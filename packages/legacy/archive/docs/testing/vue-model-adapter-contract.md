# Vue v-model Integration Contract

Vue `v-model` integration is owned by the first-class `@vyrnforge/ui-vue` package. It translates canonical VyrnForge component model metadata into idiomatic Vue model props and `update:*` events without introducing a second renderer.

## Contract

The canonical native implementation remains authoritative for rendering and behavior:

- `vf-text-input.value` + `vf-value-change` map to Vue `modelValue` + `update:modelValue`;
- `vf-checkbox.checked` + `vf-checked-change` map to Vue `modelValue` + `update:modelValue`;
- modeled `open`, `pressed`, selection, and collection state follow the same generated mapping contract;
- rendering, accessibility, keyboard behavior, native validity, and `ElementInternals` remain owned by shared VyrnForge foundations.

Reusable synchronization logic lives in `packages/ui-vue/src/model.ts`, while generated Vue facades select the canonical property/event mapping from shared component metadata. Consumer fixtures must not carry copied `useVyrnForgeModel` implementations or local wrapper components for mappings already supplied by the package.

## Runtime evidence

The packed Vue fixture proves both directions for representative value and checked models:

1. Vue model state writes the underlying canonical property;
2. canonical value-change semantics update a string `v-model`;
3. canonical checked-change semantics update a Boolean `v-model`;
4. later programmatic Vue model changes write back to the underlying controls;
5. production build and Chromium interaction consume packed `@vyrnforge/ui-vue` without workspace links or fixture-local adapter copies.

## Commands

```bash
npm run test:vue-model-adapter
npm run verify:vue-model-adapter
npm run verify:vue-model-adapter:runtime
npm run quality
```

Historical CF-7006 fixture-side reference adapters are superseded implementation evidence. Current support is the package-owned Vue model integration verified through the public facade and packed runtime matrix.

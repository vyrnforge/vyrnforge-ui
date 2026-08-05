# Vue v-model Adapter Contract

CF-7006 adds a thin **consumer-side reference integration** for Vue `v-model`.
It does not add Vue to a published VyrnForge package and does not introduce a
second renderer.

## Contract

The native renderer remains authoritative:

- `vf-text-input.value` + `vf-value-change` map to Vue `modelValue` +
  `update:modelValue`;
- `vf-checkbox.checked` + `vf-checked-change` map to Vue `modelValue` +
  `update:modelValue`;
- rendering, accessibility, keyboard behavior, native validity, and
  `ElementInternals` remain owned by `@vyrnforge/ui-elements`.

The reusable glue lives under `tests/consumers/vue/src/adapters/`. The generic
`useVyrnForgeModel` composable owns synchronization and listener cleanup while
the two reference wrappers only select the native property and canonical event.

## Runtime evidence

The packed Vue fixture must prove both directions for value and checked models:

1. Vue model state writes the underlying native property;
2. `vf-value-change` updates a string `v-model`;
3. `vf-checked-change` updates a Boolean `v-model`;
4. a later programmatic Vue model change writes back to both native controls;
5. production build and Chromium interaction still use packed VyrnForge
   packages without workspace links.

## Commands

```bash
npm run test:vue-model-adapter
npm run verify:vue-model-adapter
npm run verify:vue-model-adapter:runtime
npm run quality
```

The packed Vue Chromium matrix verifies the adapter in both model directions without duplicating native rendering or validation logic.

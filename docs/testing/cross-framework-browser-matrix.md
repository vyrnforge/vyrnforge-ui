# Cross-Framework Browser Matrix

CF-7009 verifies one shared browser contract across the packed Native HTML,
React 19, Angular 22, and Vue 3 consumers.

The matrix intentionally reuses the existing packed-consumer runtime rather
than introducing a second browser harness. Each consumer is installed from
fresh VyrnForge tarballs, typechecked, production-built, started on its own
preview port, and exercised in Chromium.

The shared scenarios are:

| Scenario                  | Canonical assertion                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Canonical action event    | `vf-action` reaches the consumer and produces observable application state.                                |
| Tabs property assignment  | `vf-tabs.items` renders the `Summary` tab as a DOM property contract without serializing the object value. |
| Text-input value property | `vf-text-input.value` reaches the internal native input with the same initial `Operations` value.          |

Framework-specific adapter scenarios remain in the same runtime pass. Angular
continues to verify the Forms bridge, Vue continues to verify the `v-model`
reference adapter, and native form-association coverage remains owned by the
existing consumer fixtures.

Run:

```bash
npm run verify:cross-framework-matrix
npm run test:cross-framework-matrix
npm run verify:cross-framework-matrix:runtime
```

The runtime command writes a normalized JSON report and one Playwright trace
per consumer under `test-results/cross-framework-matrix/`. CI uploads that
directory as the `cross-framework-browser-matrix` artifact.

The support claim may move from `cross-framework-browser-matrix-runtime-ready`
to `cross-framework-browser-matrix-verified` only after the packed runtime
command succeeds on the supported Node/npm toolchain.

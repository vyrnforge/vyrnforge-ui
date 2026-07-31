# Vue packed consumer fixture

CF-7005 verifies Vue as a clean packed consumer of `@vyrnforge/ui-elements`.
The fixture configures the Vue compiler to treat every `vf-*` tag as a Custom
Element and covers object-valued property binding, canonical DOM events, named
Light DOM composition, native form participation, production output, and
Chromium interaction. The clean install, strict template typecheck, production build, and Chromium
matrix are verified.

The fixture intentionally remains outside the root npm workspace. The runtime
verifier installs Vue tooling first, then installs packed VyrnForge tarballs so
no workspace symlink or repository-source import can satisfy the test.

CF-7006 verifies a thin consumer-local `v-model` adapter under `src/adapters/`. It
translates `modelValue` / `update:modelValue` to native `value` / `checked`
properties and the canonical `vf-value-change` / `vf-checked-change` events.
It does not duplicate native rendering, validation, accessibility, or form logic.

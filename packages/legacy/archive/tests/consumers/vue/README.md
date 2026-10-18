# Vue packed consumer fixture

This fixture verifies Vue as a clean packed consumer of `@vyrnforge/ui-elements`.
The Vue compiler treats every `vf-*` tag as a Custom Element, and the fixture
covers object-valued property binding, canonical DOM events, named Light DOM
composition, native form participation, production output, and Chromium
interaction. Clean installation, strict template type checking, production
build, and the Chromium matrix are all verified.

The fixture intentionally remains outside the root npm workspace. The runtime
verifier installs Vue tooling first, then installs packed VyrnForge tarballs so
no workspace symlink or repository-source import can satisfy the test.

A thin consumer-local `v-model` reference adapter lives under `src/adapters/`.
It translates `modelValue` / `update:modelValue` to native `value` / `checked`
properties and the canonical `vf-value-change` / `vf-checked-change` events.
It does not duplicate native rendering, validation, accessibility, or form logic.

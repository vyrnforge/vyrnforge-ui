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

Vue's built-in `v-model` protocol does not map the VyrnForge canonical
`vf-value-change` and `vf-checked-change` events automatically. CF-7006 owns the
thin adapter decision and implementation; it must translate framework syntax
without duplicating native rendering or form logic.

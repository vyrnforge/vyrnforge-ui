# Repository tooling

`tooling/` is the private `@vyrnforge/repository-tooling` package. It contains repository-only automation, is deliberately not part of the public npm workspace set, and is not a runtime dependency layer. Nothing under `packages/` may import it.

The package boundary groups shared repository automation without centralizing evidence that belongs to a package, product slice, application, documentation source, or GitHub configuration. Root scripts invoke tooling entrypoints from the repository root; the package is an ownership and module boundary, not a separately published or installed unit.

A top-level tooling capability exists only while it owns recurring repository automation that cannot be more naturally owned elsewhere. Capability directories are **need-driven**, not a fixed architecture checklist. `tooling/verify/workspace-structure.mjs` discovers them dynamically instead of maintaining an allowlist.

Every top-level capability directory must have its own `README.md` describing what it owns and what it explicitly does not own. That local README is the capability's ownership contract; adding or removing a capability must not require editing a centralized directory inventory.

Small repository-wide helpers that do not justify a capability directory may live directly under `tooling/`; `clean.mjs` is the current example.

## Placement rules

1. Put logic with the capability or product owner that defines it, not with the command that happens to call it.
2. Product-specific tests, fixtures, semantics, examples, and evidence stay with `product/<component>/`, `packages/<package>/test/`, or the owning application.
3. Keep tooling tests beside the tooling they prove.
4. Workflow files orchestrate; `impact/` owns validation selection and dependency truth.
5. `verify/` enforces durable invariants. Never keep a verifier solely to preserve an already-completed rollout milestone.
6. Public packages must never import repository tooling, and `tooling/` must remain private and outside the public workspace list.
7. Do not create `utils/`, `common/`, `misc/`, `scripts/`, empty placeholders, or a new top-level tooling directory without a maintained recurring capability.
8. Deleting a tooling capability when its recurring need disappears is expected architecture maintenance, not a compatibility break.

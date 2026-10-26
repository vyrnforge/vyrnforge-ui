# Repository tooling

`tooling/` contains repository-only automation. It is not a runtime dependency layer and nothing under `packages/` may import it.

A tooling capability exists only while it owns recurring repository automation that cannot be more naturally owned by a package, product slice, application, documentation source, or GitHub configuration. Top-level tooling directories are **need-driven**, not a fixed architecture checklist.

| Area | Owns | Does not own |
| --- | --- | --- |
| `ci/` | recurring CI operational support that cannot live cleanly in workflow YAML | product validation logic or one-off migration scripts |
| `docs/` | documentation generation, compilation, serving, and example integration | docs application presentation/content or product contracts |
| `impact/` | impact policy, dependency graph construction, validation selection/execution/reporting | behavioral scenarios or product implementation |
| `release/` | change-fragment discovery and release/changelog composition | CI selection or product behavior |
| `testing/` | reusable validation harnesses and repository-wide evidence infrastructure | component/package behavior definitions that belong with their owner |
| `tokens/` | repository-internal token transformation and generation | generated browser runtime CSS |
| `verify/` | durable repository, architecture, package, and public-boundary invariants | milestone acceptance gates, generators, or general test harnesses |

Small repository-wide helpers that do not justify a capability directory may live directly under `tooling/`; `clean.mjs` is the current example.

## Placement rules

1. Put logic with the capability or product owner that defines it, not with the command that happens to call it.
2. Product-specific tests, fixtures, semantics, examples, and evidence stay with `product/<component>/`, `packages/<package>/test/`, or the owning application.
3. Keep tooling tests beside the tooling they prove.
4. Workflow files orchestrate; `impact/` owns validation selection and dependency truth.
5. `verify/` enforces durable invariants. Never keep a verifier solely to preserve an already-completed rollout milestone.
6. Public packages must never import repository tooling.
7. Do not create `utils/`, `common/`, `misc/`, `scripts/`, empty placeholders, or a new top-level tooling directory without a maintained recurring capability.
8. Deleting a tooling capability when its recurring need disappears is expected architecture maintenance, not a compatibility break.

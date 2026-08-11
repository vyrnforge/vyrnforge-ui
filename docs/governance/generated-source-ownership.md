# Generated Source Ownership

- Task: MFD-1011
- Status: Accepted target policy
- Depends on: MFD-1005

## Purpose

VyrnForge generates framework glue from canonical metadata wherever practical. Generated output is a build product with one source of truth; it is not a second place to maintain component semantics.

## Source of truth

Canonical component semantics live in `docs/metadata/component-contracts.json` and its schema. Framework exceptions live in `docs/metadata/framework-exceptions.json`. Generator implementation may add deterministic framework syntax, but must not become the only place where public semantic mappings are defined.

## Generated file rules

Every generated artifact must have:

- a stable generated path owned by a named generator;
- a reproducible generation command;
- a generated-file header stating the source metadata and no-hand-edit rule;
- deterministic formatting/order;
- stale-output verification that regenerates or compares expected output;
- a review path that focuses semantic changes on source metadata/generator logic, not direct output edits.

Generated framework artifacts must not be hand-edited. If output is wrong, change canonical metadata, exception metadata, or generator logic and regenerate.

## Ownership classes

Files fall into one of four classes:

1. **Canonical source** — architecture decisions and machine-readable contracts maintained by humans.
2. **Generator source** — framework-independent loader/normalization plus focused framework emitters.
3. **Generated output** — deterministic artifacts derived from canonical sources; no hand edits.
4. **Handwritten exception source** — only paths explicitly authorized by active MFD-1009 exception records.

A file must not silently move between classes.

## Layout principles

Exact package implementation paths are established by S11/S12/S13/S14 tasks, but generated artifacts should live with the package or generated-source area that publishes/consumes them. Do not place generated framework integration inside consuming fixture application source once official framework packages exist.

Generators should share one normalized contract loader rather than implementing separate metadata parsers for React, Angular, Vue, and Native.

## Regeneration contract

S11 must provide repository commands that can:

- load and validate canonical contracts;
- regenerate the selected output or all outputs deterministically;
- fail when committed generated output is stale;
- identify the source record responsible for a changed artifact;
- regenerate from a clean checkout without implementation-source discovery.

The concrete command names are implementation work and are not invented by this policy.

## Review rules

A pull request containing generated output should normally include the source metadata/generator change that caused it. Reviewers should reject direct output-only fixes unless the PR is explicitly regenerating previously stale committed output from unchanged canonical sources.

Generated diffs must remain inspectable. If generation creates excessive opaque churn, improve generator stability before scaling catalog generation.

## Removal and migration

Generated output must be safely removable and reproducible. Legacy handwritten integration is removed only after its generated replacement passes the applicable gate and rollback criteria. Generated output itself must not be treated as irreplaceable authored source.

## Acceptance mapping

This policy establishes one source of truth, generated paths owned by generators, deterministic regeneration/stale-output verification, no-hand-edit markers, and review/removal rules without prematurely inventing S11 command names or framework package internals.

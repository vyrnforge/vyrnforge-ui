# Documentation Governance

## Purpose

This document is the canonical source for VyrnForge documentation ownership,
lifecycle, authoring, generated projections, and cleanup rules.

VyrnForge documentation must have one current owner per fact. Reader-facing
pages, generated references, AI context, and historical evidence may project or
explain that fact, but they must not become competing authorities.

## Documentation layers

VyrnForge documentation has four layers:

1. **Canonical human guidance** — current Markdown under `docs/`, rooted at
   `docs/README.md`.
2. **Canonical structured facts** — machine-readable metadata under
   `docs/metadata/`, package manifests, public entrypoints, and
   implementation-owned documentation sources.
3. **Generated projections** — reproducible outputs under `docs/generated/`,
   including Reference, search, framework API, and AI-consumer projections.
4. **Historical evidence** — retained only when it still has audit, migration,
   regression, release, or architectural value.

`apps/docs` is the presentation application for VyrnForge Reference. It renders
canonical or generated information; it is not the semantic owner of component,
package, framework, token, accessibility, release, or API truth.

## Authority map

Use the smallest canonical owner that fits the fact:

- Product identity and durable scope:
  `docs/governance/01-project-source-of-truth.md`.
- Documentation navigation: `docs/README.md`.
- Documentation governance and lifecycle: this document.
- Public documentation contributor workflow:
  `docs/engineering/documentation-authoring.md`.
- Branching, PR topology, merge, and delivery:
  `docs/governance/05-trunk-delivery.md`.
- Package and dependency boundaries:
  `docs/architecture/01-package-boundaries.md` and package manifests.
- Shared state and adapter ownership:
  `docs/architecture/02-state-and-adapter-ownership.md`.
- Styling, tokens, and theming: architecture guidance, canonical token metadata,
  and runtime token CSS.
- Component contracts and API semantics:
  `docs/metadata/component-contracts.json` plus generated framework mappings.
- Component catalog and maturity: `docs/metadata/components.json`.
- Package and public-entrypoint facts: `docs/metadata/packages.json`, release
  metadata, package manifests, and verified entrypoints.
- Framework identities and support topology: `docs/metadata/multi-framework.json`,
  `docs/metadata/reference-portal.json`, and release metadata.
- Framework-specific exceptions: `docs/metadata/framework-exceptions.json`.
- Public document registry: `docs/metadata/documentation-pages.json`.
- Generated Reference, navigation, and search: `docs/generated/` outputs derived
  from canonical metadata.
- Active task status, dependencies, and gates: VyrnForge Progress Tracker — Live
  Status.
- Repository agent execution rules: `AGENTS.md`.

Generated inventories may summarize canonical facts but never supersede their
inputs.

## Authoring rules

Before adding or editing documentation:

1. identify the canonical owner;
2. update that owner instead of creating another summary;
3. keep framework-neutral semantics shared;
4. add framework-specific prose only where behavior or integration genuinely
   differs;
5. derive normal API, package, and token facts from canonical metadata or
   implementation rather than hand-copying them;
6. regenerate projections after canonical structured inputs change;
7. verify links, generated drift, and the Docs build.

### Human guidance vs generated facts

Human-authored guidance owns information that cannot be safely inferred, such as:

- purpose and when to use or avoid a capability;
- interaction and composition guidance;
- accessibility context and evidence references;
- limitations and maturity caveats;
- migration and release context.

Generated facts own ordinary properties, attributes, inputs, outputs, events,
slots/templates, methods, framework bindings, package facts, token values, route
registries, search indexes, and other deterministic projections.

Do not maintain the same fact manually in Markdown, application code, metadata,
generated files, and AI context.

## Package and component ownership

Package-level setup, public entrypoint guidance, package limitations, and
package-scoped migration or release detail belong with the package that owns
them.

Component human guidance should migrate toward package-owned, schema-validated
sources colocated with the canonical implementation. Shared renderer-neutral API
semantics remain in shared contracts; shared tokens remain in the design
foundation; framework bindings come from framework mappings, generators, and
explicit framework exceptions.

Do not move shared cross-framework semantics into a React-, Angular-, Vue-, or
Custom-Element-only folder merely for locality.

Centralized component and package guidance under `docs/metadata` may remain as
migration input where still required, but new duplication must not be
introduced.

## VyrnForge Reference boundary

`apps/docs` may own generic rendering, navigation and search presentation,
framework/version context UI, code and example presentation, and host adapters
for verified examples.

It must not own:

- package or component semantic truth;
- framework support truth;
- accessibility claims;
- token or theming contracts;
- component-specific limitations or maturity;
- package or component migration facts;
- hand-maintained API registries.

Dedicated Reference pages are presentation overrides only. They may change how a
canonical record is presented but may not delete, fork, or replace the canonical
semantic record.

## Lifecycle

Documentation uses these lifecycle states:

- **Draft** — incomplete idea or work in progress; keep it close to the active
  proposal and do not present it as canonical.
- **Proposed** — structured but awaiting approval; link only from active planning
  and mark it clearly.
- **Stable** — accepted current guidance; index it from the appropriate canonical
  owner.
- **Deprecated** — retained during a migration or compatibility period; name the
  replacement and removal condition.
- **Archived** — historical material with continuing evidence value; move it
  under `docs/archive/yyyy-mm-topic-name/` and mark the replacement and reason.
- **Deleted** — obsolete material with no continuing repository value; remove it
  and rely on Git history for recovery.
- **Generated** — reproducible projection consumed by current tooling or product;
  never hand-edit it and remove it only after consumers and generator contracts
  are retired.

## Cleanup disposition

During repository cleanup, classify each document as one of:

- `KEEP` — canonical and correctly scoped;
- `UPDATE` — canonical but stale or incomplete;
- `MERGE` — unique value belongs in another canonical source;
- `REPLACE` — wrong abstraction or source; introduce the canonical replacement
  first;
- `ARCHIVE` — historical evidence still matters;
- `DELETE` — obsolete or duplicate with no continuing value;
- `GENERATED` — produced output governed by its generator and consumers.

Delete rather than archive when a file is only:

- a completed one-time task instruction;
- a stale sprint or program note with no continuing policy value;
- an exact or near-exact duplicate;
- a copied or generated artifact that is reproducible and no longer consumed;
- a pointer-only archive with no historical evidence beyond Git history.

Do not delete required legal text, accepted ADR history, release evidence
required by policy, or material still consumed by active code, tests, or
documentation.

## Archive policy

When archival is justified, use:

```text
docs/archive/yyyy-mm-topic-name/
```

Every archived item must state the replacement and why the historical copy
remains useful. Archived content never overrides current guidance.

## Generated material

Generated outputs are not authoring surfaces. Change canonical inputs and
regenerate.

A generated artifact remains checked in when a current package, Reference
surface, consumer, test, or verification contract consumes it. Remove it only
after its consumers and generator or currentness checks are intentionally
retired or changed.

## AI-facing documentation

`AGENTS.md` and `.ai/` are concise operational entrypoints. They must link to
canonical human and structured sources instead of restating architecture,
package maps, component catalogs, or release state.

Do not create machine-readable mirrors unless a real generator, verifier,
consumer, or workflow owns them.

## Verification

Documentation changes should use repository-owned verification rather than
manual confidence. The current expected path is:

```bash
npm run generate:reference
npm run verify:reference
npm run verify:docs-quality
npm run test:contracts
npm run build:docs
```

Run additional package, browser, accessibility, consumer, or release checks when
the changed capability requires them. Protected CI is the completion evidence.

## Removal and relocation checklist

Before deleting, archiving, or moving a document:

1. check repository references and Docs source discovery or bindings;
2. confirm it is not a canonical owner or required evidence source;
3. merge any unique current guidance into its canonical destination;
4. update active links and source mappings;
5. remove or archive the obsolete source;
6. regenerate derived documentation where needed;
7. run documentation and Reference verification plus the Docs build.

## Non-goals

Documentation governance does not own product architecture, package APIs,
release state, active tracker status, or component semantics. It defines where
those facts live and how documentation projects them without duplication.

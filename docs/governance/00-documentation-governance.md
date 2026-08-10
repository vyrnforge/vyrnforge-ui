# Documentation Governance

## Purpose

VyrnForge documentation should have one current source of truth per topic.
Reader-facing entrypoints link to canonical documents rather than repeating
their full content.

## Canonical ownership

| Topic                                                      | Canonical source                                      |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| Documentation entrypoint                                   | `docs/README.md`                                      |
| Project identity                                           | `docs/governance/01-project-source-of-truth.md`       |
| Package boundaries                                         | `docs/architecture/01-package-boundaries.md`          |
| State ownership                                            | `docs/architecture/02-state-and-adapter-ownership.md` |
| Theming and styling                                        | `docs/architecture/03-theming-and-styling.md`         |
| Current roadmap                                            | `docs/roadmap/00-master-roadmap.md`                   |
| Component catalog, maturity, and per-component limitations | `docs/metadata/components.json`                       |
| Generated component/framework reference                    | `docs/generated/component-reference.json`             |
| CI/CD architecture                                         | `docs/engineering/ci-cd-architecture.md`              |
| Release procedure                                          | `docs/release/publication-procedure.md`               |
| AI context                                                 | `.ai/AI_CONTEXT.md`                                   |

Generated inventories and references may summarize canonical metadata, but they
must not become competing manually maintained catalogs.

## Core rules

### One source of truth per topic

Before creating a document, identify whether an existing canonical source
already owns the subject. Update that source and link to it instead of creating
another version.

### Current guidance before history

Normal usage, architecture, package, and release docs describe current behavior.
Completed sprint narratives, gate-closure reports, old audits, and
release-specific evidence belong under clearly marked historical/evidence
areas.

Historical evidence never overrides current guidance.

### Archive replaced guidance

When a document is replaced rather than updated, move it under
`docs/archive/<yyyy-mm-topic>/`, add an archive note, and link the replacement.

### Keep generated catalogs generated

Component lists and framework-reference views must derive from canonical
metadata. Do not hand-maintain the same component/status table in the README,
roadmap, package docs, API index, and metadata.

### Human and machine-readable sources must agree

Markdown owns human-readable decisions. Structured metadata supports
verification, generated docs, and AI lookup and must stay aligned with those
decisions.

## Important document lifecycle

Stable or canonical documents should state their purpose, scope, non-goals where
needed, and related sources. See [Document Lifecycle](02-document-lifecycle.md)
for archive and replacement rules.

## Verification

`npm run verify:documentation-current` checks primary guidance for stale release
channels, hardcoded prerelease versions, obsolete project-state language, and
reader-entrypoint structure.

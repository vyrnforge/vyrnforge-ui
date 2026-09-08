# Documentation Governance

## Purpose

VyrnForge documentation has one current source of truth per topic. Reader-facing
entrypoints link to canonical documents or generated views rather than repeating
their content.

The documentation system itself is described in
[Documentation System](../engineering/documentation-system.md).

## Canonical ownership

| Topic | Canonical source |
| --- | --- |
| Documentation entrypoint | `docs/README.md` |
| Documentation organization and docs-app ownership | `docs/engineering/documentation-system.md` |
| Project identity and durable scope | `docs/governance/01-project-source-of-truth.md` |
| Package boundaries | `docs/architecture/01-package-boundaries.md` |
| State ownership | `docs/architecture/02-state-and-adapter-ownership.md` |
| Theming and styling | `docs/architecture/03-theming-and-styling.md` |
| Active sprint, task status, dependencies, sequencing, and gate status | Google Drive spreadsheet `VyrnForge Progress Tracker — Live Status` |
| Component catalog, maturity, and per-component limitations | `docs/metadata/components.json` |
| Generated component/framework reference | `docs/generated/component-reference.json` |
| Generated AI consumer context | `docs/generated/ai-context/` |
| CI/CD architecture | `docs/engineering/ci-cd-architecture.md` |
| Release procedure | `docs/release/publication-procedure.md` |
| Repository coding-agent operational rules | `AGENTS.md` |

The GitHub repository is the implementation, canonical technical documentation,
and evidence source. It does not maintain a second sprint or execution tracker.

Generated inventories and references may summarize canonical metadata, but they
must not become competing manually maintained catalogs.

## Core rules

### One source of truth per topic

Before creating a document, identify whether an existing canonical source
already owns the subject. Update that source and link to it instead of creating
another version.

### Current guidance before history

Normal usage, architecture, package, quality, and release docs describe current
behavior. Completed sprint narratives, gate-closure reports, old audits, and
release-specific evidence remain only when they retain current audit, migration,
regression, release, or architectural value.

Historical evidence never overrides current guidance or the Drive execution
tracker.

### Retain history intentionally

Git history is the recovery mechanism for ordinary documentation changes. Do not
archive replaced files by default.

Retain superseded material only when it has continuing audit, migration,
regression, release, or architectural value. Delete obsolete one-time prompts,
task instructions, closed-program ledgers, reproducible copies, and duplicate
guidance when they have no continuing value.

See [Document Lifecycle](02-document-lifecycle.md) for the retention rules.

### Keep generated catalogs generated

Component lists, framework-reference views, repository inventories, and AI
consumer context must derive from canonical metadata or implementation. Do not
hand-maintain the same facts in a roadmap, package guide, AI mirror, and generated
artifact.

### Keep executable inventories executable

When code already owns a current inventory or mapping, documentation explains the
durable contract and links to the implementation rather than copying the
inventory into Markdown. Documentation routes and source mappings are owned by
`apps/docs/src/docsRegistry.ts`.

### Human and machine-readable sources must agree

Markdown owns human-readable decisions. Structured metadata owns queryable facts
and verification state. Generated outputs must be reproducible from their
canonical inputs.

Agent-facing files should remain concise operational pointers and guardrails;
they must not become a second architecture manual or component catalog.

## Verification

`npm run verify:documentation-current` checks primary guidance for stale release
channels, obsolete project-state language, and reader-entrypoint structure.

Documentation changes must also preserve the docs build because `apps/docs`
imports repository documentation directly. Generated documentation and AI context
must pass their currentness verifiers.

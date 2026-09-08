# Documentation Governance

## Purpose

VyrnForge documentation has one current owner per important fact. Reader-facing
entrypoints link to canonical documents or generated views instead of repeating
the same package, framework, maturity, release, or execution state in multiple
places.

The documentation system itself is described in
[Documentation System](../engineering/documentation-system.md).

## Canonical ownership

| Topic | Canonical source |
| --- | --- |
| Documentation entrypoint | `docs/README.md` |
| Documentation organization and docs-app ownership | `docs/engineering/documentation-system.md` |
| Project identity, scope, and durable product boundaries | `docs/governance/01-project-source-of-truth.md` |
| Active sprint/task execution and gate status | Drive spreadsheet `VyrnForge Progress Tracker — Live Status` |
| Package boundaries | `docs/architecture/01-package-boundaries.md` |
| State ownership | `docs/architecture/02-state-and-adapter-ownership.md` |
| Theming and styling | `docs/architecture/03-theming-and-styling.md` |
| Component catalog, maturity, and per-component limitations | `docs/metadata/components.json` |
| Generated component/framework reference | `docs/generated/component-reference.json` |
| Generated AI retrieval context | `docs/generated/ai-context/` |
| CI/CD architecture | `docs/engineering/ci-cd-architecture.md` |
| Release procedure | `docs/release/publication-procedure.md` |

Package manifests, public entrypoints, implementation, executable tests, and
canonical metadata remain authoritative for exact current implementation facts.
The Drive progress tracker owns execution state; the repository must not maintain
a competing sprint tracker.

## Core rules

### One source of truth per topic

Before creating a document, identify whether an existing canonical source
already owns the subject. Update that owner and link to it instead of creating a
second version.

### Current guidance before history

Normal usage, architecture, package, release, and quality docs describe current
behavior. Completed sprint narratives, gate ledgers, old audits, and
release-specific evidence remain only when they retain current audit, migration,
regression, compatibility, or architectural value.

Historical evidence never overrides current guidance.

### Retain history intentionally

Git history is the recovery mechanism for ordinary replaced guidance. Do not
create documentation archives merely to avoid deletion. Retain old material only
when its continuing evidence value is explicit and current.

See [Document Lifecycle](02-document-lifecycle.md) for the retention rules.

### Keep generated facts generated

Component lists, framework-reference views, repository inventories, and AI
retrieval context derive from canonical metadata or repository state. Do not
hand-maintain the same facts in parallel Markdown, JSON, agent files, and
application routes.

### Keep executable inventories executable

When code owns a current inventory or mapping, documentation explains the durable
contract and links to the implementation rather than copying the inventory. For
example, documentation routes and source mappings are owned by
`apps/docs/src/docsRegistry.ts`.

### Human and machine-readable sources must agree

Markdown owns human-readable decisions. Structured metadata supports
verification, generated docs, and AI lookup and must stay aligned with those
decisions.

Agent-facing files stay concise and operational. Product/package/component truth
comes from canonical docs, manifests, metadata, and generated AI context rather
than a second hand-maintained architecture manual.

## Verification

`npm run verify:documentation-current` checks primary guidance for stale release
channels, hardcoded prerelease versions, obsolete project-state language, and
reader-entrypoint structure.

Documentation changes also preserve a successful docs build and valid links and
navigation because `apps/docs` imports repository documentation directly.

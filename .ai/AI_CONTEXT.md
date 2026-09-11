# VyrnForge AI Bootstrap

Use canonical or generated context instead of maintaining a second project manual in `.ai`.

## Start small

For normal UI work, begin with the generated context index:

`docs/generated/ai-context/index.json`

Then load only the smallest relevant generated slice:

- component: `docs/generated/ai-context/components/<id>.json`
- pattern/workflow: `docs/generated/ai-context/patterns/`
- category discovery: `docs/generated/ai-context/categories/`

Local queries are available through `npm run query:ai-context`.

## Repository changes

Before modifying the repository, read `AGENTS.md` and follow
`docs/governance/05-trunk-delivery.md` for lane ownership, task PRs, promotion,
validation, and synchronization.

Escalate only when the generated context is insufficient:

- product identity and scope: `docs/governance/01-project-source-of-truth.md`
- package boundaries: `docs/architecture/01-package-boundaries.md`
- package/framework status: `docs/metadata/packages.json` and release metadata
- component maturity: `docs/metadata/components.json`
- public APIs: `docs/api/`
- current limitations: `docs/quality/03-known-limitations.md`
- release process: `docs/release/README.md`
- active execution and gates: the live VyrnForge progress tracker

Do not infer support, maturity, APIs, package topology, or release status from
this bootstrap. Canonical metadata, manifests, public entrypoints, current docs,
and required evidence own those facts.

# Documentation System

## Purpose

This document defines how VyrnForge documentation is organized and how the documentation application consumes it. It does not replace topic-specific architecture, API, package, release, or governance documents.

The goal is to keep documentation discoverable without creating parallel sources of truth.

## Source layers

VyrnForge documentation has four distinct layers:

1. **Canonical human guidance** — current Markdown under `docs/`, rooted at `docs/README.md`.
2. **Structured metadata** — machine-readable contracts under `docs/metadata/` and generated views under `docs/generated/`.
3. **Agent context** — concise repository-navigation and implementation guidance in `AGENTS.md` and `.ai/`.
4. **Historical evidence** — retained material under `docs/archive/`, `docs/quality/`, `docs/testing/`, or release evidence only when it has continuing audit, migration, regression, or architectural value.

These layers may link to each other, but they must not independently maintain the same architecture, component catalog, route list, package map, or release state.

## Documentation application

`apps/docs` is a presentation and navigation application. It is not a source of truth for VyrnForge behavior or architecture.

The application renders canonical Markdown and structured metadata from the repository. When the application needs a new page, prefer registering an existing canonical source rather than creating a docs-app-only copy of the same information.

### Route ownership

`apps/docs/src/docsRegistry.ts` is the executable source for documentation routes and source-file mappings.

Do not maintain a second hand-written route inventory in Markdown. Documentation about routing should describe durable routing rules and link to the registry for the current route set.

The current application uses hash routing so GitHub Pages does not require server-side rewrite rules. Deployment base paths remain application configuration, not documentation architecture.

### Dogfooding

The documentation application should consume VyrnForge components for reusable UI primitives where practical.

Docs-app CSS should focus on documentation-specific layout and presentation such as navigation, Markdown, code blocks, responsive structure, and metadata views. Do not create a parallel generic component system inside `apps/docs`.

If the docs application exposes a reusable UI need that belongs in VyrnForge, evaluate whether the existing component foundation can be reused or extended before adding an application-only replacement.

## Example standards

Examples should be short, accurate, and reusable. A public-facing example should include the information needed to consume the API correctly, as applicable:

- package and CSS imports;
- a focused use case;
- minimal code;
- accessibility requirements;
- relevant theming or token notes;
- controlled or uncontrolled behavior when relevant;
- when to use the component or pattern and important limitations.

Large fixture datasets, business-specific authentication, application routing, and unrelated product logic should stay outside reusable examples.

## AI-facing documentation

`AGENTS.md` and `.ai/` provide concise agent entrypoints. They should point to canonical human documentation and structured metadata rather than restating whole architecture documents.

Do not create speculative machine-readable files merely because an older plan named them. A machine-readable artifact should exist only when a current generator, verifier, consumer, or documented workflow owns it.

Component and framework facts should come from canonical metadata and generated references where those sources exist. Do not hand-maintain duplicate component catalogs for AI consumption.

## Retention and cleanup

Git history already preserves deleted repository content. Active documentation should therefore keep historical material only when it has continuing value.

Archive a replaced document when it is useful for audit evidence, migration history, regression investigation, or understanding an accepted architectural decision.

Delete instead of archive when a file is only:

- a completed one-time implementation prompt;
- an obsolete task instruction with no continuing policy value;
- an exact or near-exact duplicate of a canonical document;
- a generated/copy artifact that can be reproduced from its owner;
- a pointer-only archive that contains no historical evidence beyond Git history.

Never delete required legal text, accepted ADR history, release evidence required by policy, or verification evidence solely to reduce file count.

## Change checklist

When changing documentation:

1. Identify the canonical owner for the topic.
2. Update that owner rather than creating a parallel document.
3. Update structured metadata when the canonical contract requires it.
4. Update `apps/docs/src/docsRegistry.ts` when the docs application route/source mapping changes.
5. Remove or archive replaced material according to its continuing historical value.
6. Run the repository documentation verification and the affected docs build.

## Related sources

- [Documentation index](../README.md)
- [Documentation governance](../governance/00-documentation-governance.md)
- [Document lifecycle](../governance/02-document-lifecycle.md)
- [Project source of truth](../governance/01-project-source-of-truth.md)
- [CI/CD architecture](ci-cd-architecture.md)
- [`AGENTS.md`](../../AGENTS.md)
- [AI documentation usage guide](../../.ai/DOC_USAGE_GUIDE.md)

# Documentation System

## Purpose

This document defines how VyrnForge documentation is organized and how the reader-facing Reference product consumes it. It does not replace topic-specific architecture, API, package, release, or governance documents.

The goal is to keep documentation discoverable without creating parallel sources of truth.

## Source layers

VyrnForge documentation has four distinct layers:

1. **Canonical human guidance** — current Markdown under `docs/`, rooted at `docs/README.md`.
2. **Structured metadata** — machine-readable contracts under `docs/metadata/` and generated views under `docs/generated/`.
3. **Agent context** — concise repository-navigation and implementation guidance in `AGENTS.md` and `.ai/`.
4. **Historical evidence** — retained material under `docs/archive/`, `docs/quality/`, `docs/testing/`, or release evidence only when it has continuing audit, migration, regression, or architectural value.

These layers may link to each other, but they must not independently maintain the same architecture, component catalog, route list, package map, release state, or public API facts.

## VyrnForge Reference product

Docs and Playground are two presentation surfaces of one reader-facing product: **VyrnForge Reference**.

`docs/metadata/reference-portal.json` owns the shared Reference product identity, framework and surface vocabulary, navigation sections, content-domain ownership, framework/version context, deep-link rules, and deployment semantics. It does not replace the canonical component, package, token, pattern, accessibility, release, or executable-example contracts that supply the underlying facts.

The current Docs and Playground applications may use React internally. React is an implementation host, not the semantic owner of the Reference product. Native HTML / Custom Elements, React, Angular, and Vue remain equal first-class reader contexts and must share the same VyrnForge terminology, behavior contracts, accessibility model, styling foundation, and API facts.

### Information model and ownership

Reference content follows these ownership rules:

| Domain        | Canonical ownership                                                                                             | Reference behavior                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Guides        | Current Markdown under `docs/`                                                                                  | Curated explanation and recommendations; link to structured facts rather than copying them.                       |
| Components    | `docs/metadata/components.json`, `docs/metadata/component-contracts.json`, and multi-framework metadata         | Generated catalog/API facts with curated usage guidance layered on top.                                           |
| Packages      | `docs/metadata/packages.json`, release metadata, package manifests, and verified public entrypoints             | Generated package/setup facts; no application-owned package map.                                                  |
| Tokens        | `docs/metadata/design-tokens.json` and shared `ui-core` token/theme/density styles                              | Generated token facts and examples; reference surfaces do not own token values.                                   |
| Patterns      | `docs/metadata/patterns.json` plus curated workflow guidance                                                    | Canonical pattern identity with authored explanation where useful.                                                |
| Examples      | `docs/metadata/executable-examples.json`, `tests/consumers/manifest.json`, and authored example implementations | Shared semantic example identities with framework-specific executable implementations and verification.           |
| Accessibility | Shared component contracts, accessibility evidence metadata, and curated guidance                              | Shared keyboard/accessibility behavior with evidence and explanation; no framework-specific fork of the contract. |
| Search        | Derived from generated reference records and curated text                                                       | Search owns no API, package, token, framework, version, or release facts.                                         |

Generated component facts already exist in `docs/generated/consumer-knowledge.json` and `docs/generated/framework-api-reference.json`. Future Reference generation should compose canonical sources into a shared reference model rather than introduce a new hand-maintained API authority.

### Framework and version context

Framework context uses the shared framework IDs declared by `reference-portal.json` and the `framework` query parameter. Version context uses the canonical `vyrnforge-versions.json` catalog and versioned paths. Navigation between Docs and Playground must preserve the selected framework and version whenever the target version supports that surface.

The default framework may be React for convenience, but default selection does not give React stronger product semantics than Native HTML, Angular, or Vue.

### Route and deep-link ownership

Stable route IDs are semantic identities. The current applications transport those identities through hash routes so GitHub Pages does not require server-side rewrite rules. Framework context is query-based and version context is path-based.

`apps/docs/src/docsRegistry.ts`, `examples/basic-playground/src/app/routes.ts`, and `examples/basic-playground/src/app/referenceCatalogRoutes.ts` are transitional runtime registries. They remain required until generated replacements are proven, but they are not canonical owners for component, package, token, framework, version, accessibility, or API facts.

The steady-state Reference architecture derives navigation and route records from canonical content and metadata, then lets Docs and Playground render that shared information model with surface-specific presentation where appropriate. Transitional registries should be removed only after the generated replacement passes routing, deep-link, framework/version-context, accessibility, and deployment verification.

### Deployment ownership

`scripts/reference-artifact.mjs` owns the shared immutable Reference artifact contract. Preview and production artifacts contain both Docs and Playground, preserve commit/CI lineage, and use `main` as the production source. Presentation changes must preserve this delivery contract unless the deployment architecture itself is intentionally revised and re-verified.

## Documentation application

`apps/docs` is a presentation and navigation application. It is not a source of truth for VyrnForge behavior or architecture.

The application renders canonical Markdown and structured/generated metadata from the repository. When the application needs a new page, prefer registering or generating from an existing canonical source rather than creating a docs-app-only copy of the same information.

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

When an example represents the same VyrnForge capability across frameworks, use a shared semantic example identity and keep framework-specific code as implementations of that identity rather than four unrelated catalog entries.

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

When changing Reference content or presentation:

1. Identify the canonical owner for the topic.
2. Update that owner rather than creating a parallel document or application-owned fact table.
3. Update or regenerate structured metadata when the canonical contract requires it.
4. Keep framework/version context and stable route identities aligned across Docs and Playground.
5. Update transitional route registries only when the current runtime still requires them; do not treat them as the durable information model.
6. Preserve executable-example registry identities and cross-framework verification when example behavior changes.
7. Remove transitional registries or duplicated facts only after their generated replacement is verified.
8. Run repository documentation/reference verification and the affected Docs/Playground builds.

## Related sources

- [Documentation index](../README.md)
- [Metadata ownership](../metadata/README.md)
- [`reference-portal.json`](../metadata/reference-portal.json)
- [Documentation governance](../governance/00-documentation-governance.md)
- [Document lifecycle](../governance/02-document-lifecycle.md)
- [Project source of truth](../governance/01-project-source-of-truth.md)
- [CI/CD architecture](ci-cd-architecture.md)
- [`AGENTS.md`](../../AGENTS.md)
- [AI bootstrap](../../.ai/AI_CONTEXT.md)

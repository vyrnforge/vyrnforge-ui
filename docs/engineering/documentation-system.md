# Documentation System

## Purpose

This document defines how VyrnForge documentation is organized and how the
reader-facing Reference product consumes it. It does not replace topic-specific
architecture, API, package, release, or governance documents.

The goal is to keep documentation discoverable without creating parallel sources
of truth.

## Source layers

VyrnForge documentation has four distinct layers:

1. **Canonical human guidance** — current Markdown under `docs/`, rooted at
   `docs/README.md`.
2. **Structured metadata** — machine-readable contracts under `docs/metadata/`
   and generated views under `docs/generated/`.
3. **Agent context** — concise repository-navigation and implementation guidance
   in `AGENTS.md` and `.ai/`.
4. **Historical evidence** — retained material under `docs/archive/`,
   `docs/quality/`, `docs/testing/`, or release evidence only when it has
   continuing audit, migration, regression, or architectural value.

These layers may link to each other, but they must not independently maintain
the same architecture, component catalog, route list, package map, release
state, or public API facts.

## VyrnForge Reference product

Docs and Playground are two presentation surfaces of one reader-facing product:
**VyrnForge Reference**.

`docs/metadata/reference-portal.json` owns the shared Reference product
identity, framework and surface vocabulary, navigation sections, content-domain
ownership, framework/version context, deep-link rules, and deployment semantics.
It does not replace the canonical component, package, token, pattern,
accessibility, release, or executable-example contracts that supply the
underlying facts.

The current Docs and Playground applications may use React internally. React is
an implementation host, not the semantic owner of the Reference product.
Semantic ownership remains framework-neutral. Native HTML / Custom Elements,
React, Angular, and Vue remain equal first-class reader contexts and must share
the same VyrnForge terminology, behavior contracts, accessibility model, styling
foundation, and API facts.

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
| Accessibility | Shared component contracts, accessibility evidence metadata, and curated guidance                               | Shared keyboard/accessibility behavior with evidence and explanation; no framework-specific fork of the contract. |
| Search        | Derived from generated reference records and curated text                                                       | Search owns no API, package, token, framework, version, or release facts.                                         |

Generated component facts exist in
`docs/generated/consumer-knowledge.json` and
`docs/generated/framework-api-reference.json`. Reference generation composes
canonical sources into a shared reference model rather than introducing a new
hand-maintained API authority.

### Framework and version context

Framework context uses the shared framework IDs declared by
`reference-portal.json` and the `framework` query parameter. Version context
uses the canonical `vyrnforge-versions.json` catalog and versioned paths.
Navigation between Docs and Playground must preserve the selected framework and
version whenever the target version supports that surface.

The default framework may be React for convenience, but default selection does
not give React stronger product semantics than Native HTML, Angular, or Vue.

### Route and deep-link ownership

Stable route IDs are semantic identities. The applications transport those
identities through hash routes so GitHub Pages does not require server-side
rewrite rules. Framework context is query-based and version context is
path-based.

The transitional runtime registries have been retired. Docs discovers authored
Markdown, metadata, and generated AI-context sources directly and composes its
generated reader entries from `docs/generated/reference-model.json`. Playground
binds curated executable pages to generated/canonical component and example
identities; those bindings do not own component labels, package identity,
framework API facts, accessibility contracts, or stable component routes.

Derivable navigation and catalog facts therefore come from the generated
Reference model, canonical metadata, or repository source discovery. Curated
prose and executable demonstrations remain authored only where they add
presentation or behavioral value that is not already a generated fact.

### Executable preview contract

The primary reader experience should present guidance, generated API facts, and
executable UI behavior together instead of forcing readers to choose between a
"Docs mode" and a separate "Playground mode" for the same component.

Component reference pages may embed an executable presentation when canonical
component metadata provides a verified `playgroundPath`. The embedded view must
reuse that canonical route and shared framework/version context; it must not
introduce a second demo registry or a docs-only copy of example behavior.

The standalone Playground remains a maintained execution and verification
surface for deep links, focused example exploration, CI, browser evidence, and
packed-consumer integration. It is not a competing source of documentation
truth or a separate component catalog.

Preview transport is intentionally replaceable. The current Reference host may
embed the maintained Playground route in an isolated presentation context, while
future delivery may bind the same semantic component/example identity to
versioned framework-specific preview bundles. Changing iframe, worker, module,
or bundle transport must not change canonical component IDs, example IDs,
framework context, generated API ownership, or route identity.

A preview must not overstate framework evidence. Shared UI rendering may be
shown with the selected framework context, but claims that a specific framework
runtime executed must come from its executable-example or packed-consumer
evidence. Native HTML, React, Angular, and Vue remain equal semantic surfaces
whether their preview transport is shared or framework-specific.

### Deployment ownership

`scripts/reference-artifact.mjs` owns the shared immutable Reference artifact
contract. Preview and production artifacts contain both Docs and Playground,
preserve commit/CI lineage, and use `main` as the production source.
Presentation changes must preserve this delivery contract unless the deployment
architecture itself is intentionally revised and re-verified.

## Documentation application

`apps/docs` is a presentation and navigation application. It is not a source of
truth for VyrnForge behavior or architecture.

The application renders canonical Markdown and structured/generated metadata
from the repository. When the application needs a new page, prefer discovering
or generating from an existing canonical source rather than creating a
docs-app-only copy of the same information.

### Dogfooding

The documentation application should consume VyrnForge components for reusable
UI primitives where practical.

Docs-app CSS should focus on documentation-specific layout and presentation such
as navigation, Markdown, code blocks, responsive structure, and metadata views.
Do not create a parallel generic component system inside `apps/docs`.

If the docs application exposes a reusable UI need that belongs in VyrnForge,
evaluate whether the existing component foundation can be reused or extended
before adding an application-only replacement.

## Example standards

Examples should be short, accurate, and reusable. A public-facing example should
include the information needed to consume the API correctly, as applicable:

- package and CSS imports;
- a focused use case;
- minimal code;
- accessibility requirements;
- relevant theming or token notes;
- controlled or uncontrolled behavior when relevant;
- when to use the component or pattern and important limitations.

Large fixture datasets, business-specific authentication, application routing,
and unrelated product logic should stay outside reusable examples.

When an example represents the same VyrnForge capability across frameworks, use
a shared semantic example identity and keep framework-specific code as
implementations of that identity rather than four unrelated catalog entries.

## AI-facing documentation

`AGENTS.md` and `.ai/` provide concise agent entrypoints. They should point to
canonical human documentation and structured metadata rather than restating
whole architecture documents.

Do not create speculative machine-readable files merely because an older plan
named them. A machine-readable artifact should exist only when a current
generator, verifier, consumer, or documented workflow owns it.

Component and framework facts should come from canonical metadata and generated
references where those sources exist. Do not hand-maintain duplicate component
catalogs for AI consumption.

## Retention and cleanup

Git history already preserves deleted repository content. Active documentation
should therefore keep historical material only when it has continuing value.

Archive a replaced document when it is useful for audit evidence, migration
history, regression investigation, or understanding an accepted architectural
decision.

Delete instead of archive when a file is only:

- a completed one-time implementation prompt;
- an obsolete task instruction with no continuing policy value;
- an exact or near-exact duplicate of a canonical document;
- a generated/copy artifact that can be reproduced from its owner;
- a pointer-only archive that contains no historical evidence beyond Git
  history.

Never delete required legal text, accepted ADR history, release evidence
required by policy, or verification evidence solely to reduce file count.

## Change checklist

When changing Reference content or presentation:

1. Identify the canonical owner for the topic.
2. Update that owner rather than creating a parallel document or
   application-owned fact table.
3. Update or regenerate structured metadata when the canonical contract requires
   it.
4. Keep framework/version context and stable route identities aligned across
   Docs and Playground.
5. Derive route and catalog facts from the shared Reference model, canonical
   metadata, or repository source discovery rather than application registries.
6. Preserve executable-example registry identities and cross-framework
   verification when example behavior changes.
7. Keep curated prose and executable demos authored only where they add value
   beyond generated facts.
8. Run repository documentation/reference drift verification and the affected
   Docs/Playground builds.

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

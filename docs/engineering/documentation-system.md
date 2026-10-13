# Documentation System

## Purpose

This document defines the architecture of the reader-facing **VyrnForge Reference** product and how repository-owned documentation is projected into it.

Documentation authority, lifecycle, archival, cleanup, AI-context, and authoring-governance rules are owned by [`../governance/documentation.md`](../governance/documentation.md). This document does not duplicate those policies.

## VyrnForge Reference product

`apps/docs` is the presentation surface of VyrnForge Reference. It is a renderer and navigation application over canonical VyrnForge documentation, metadata, generated facts, and verified examples; it is not a semantic source of truth for components, packages, frameworks, tokens, accessibility, release state, or public APIs.

`docs/metadata/reference-portal.json` owns the shared Reference product identity, framework and surface vocabulary, content-domain navigation taxonomy, content-domain ownership, framework/version context, deep-link rules, and deployment semantics.

The Docs application may use React internally. React is an implementation host, not the semantic owner of Reference. Native HTML / Custom Elements, React, Angular, and Vue remain equal first-class reader contexts.

## Information model

Reference content follows these ownership rules:

<!-- prettier-ignore -->
| Domain | Canonical ownership | Reference behavior |
| --- | --- | --- |
| Guides | current authored Markdown under `docs/` | curated explanation and recommendations; links to structured facts rather than copying them |
| Components | `docs/metadata/components.json`, `docs/metadata/component-contracts.json`, package-owned guidance, and framework mappings | generated catalog/API facts with curated usage guidance layered on top |
| Packages | `docs/metadata/packages.json`, release metadata, package manifests, and verified public entrypoints | generated package/setup facts; no application-owned package map |
| Tokens | `docs/metadata/design-tokens.json` and shared runtime token CSS | generated token facts and examples; Reference does not own token values |
| Patterns | `docs/metadata/patterns.json` plus curated workflow guidance | canonical pattern identity with authored explanation where useful |
| Examples | `docs/metadata/executable-examples.json`, `tests/consumers/manifest.json`, and authored implementations | shared semantic example identities with framework-specific executable implementations and verification |
| Accessibility | shared component contracts, accessibility evidence metadata, and curated guidance | shared keyboard/accessibility behavior with evidence and explanation |
| Search | generated Reference records plus curated text | search owns no API, package, token, framework, version, or release facts |

Generated component facts include `docs/generated/consumer-knowledge.json` and `docs/generated/framework-api-reference.json`. Reference generation composes canonical sources into a shared model rather than introducing a hand-maintained API authority.

## Generation pipeline

The ordered regeneration path is:

```bash
npm run generate:reference
```

It regenerates framework/native artifacts, preset and consumer-knowledge projections, and the shared `reference-model.json`. Use:

```bash
npm run verify:reference
```

to prove checked-in generated Reference inputs are current without modifying them.

`npm run build:docs` verifies the generated chain, builds the direct VyrnForge runtime dependencies used by Docs, and builds the Docs application. Exact-main delivery repeats currentness verification before creating the production Pages artifact. Pages deploys the verified commit-bound artifact and does not regenerate source.

## Framework and version context

Framework context uses the shared framework IDs declared by `reference-portal.json` and the `framework` query parameter. Version context uses the canonical `vyrnforge-versions.json` catalog and versioned paths.

Navigation must preserve the selected framework and version across reader-facing routes. A convenience default such as React does not grant that framework stronger product semantics.

## Route and deep-link ownership

Stable route IDs are semantic identities. The application transports those identities through hash routes so GitHub Pages does not require server-side rewrite rules. Framework context is query-based and version context is path-based.

Canonical public page registration and record-domain bindings live in `docs/metadata/documentation-pages.json` and compile into `docs/generated/documentation-registry.json`. The Docs application consumes those generated bindings; `apps/docs/src/referenceRoutes.ts` is an adapter, not a page or record-route authority.

Derivable navigation, catalog, search, index, and sitemap facts come from the generated Reference model, canonical metadata, or repository source discovery. Curated prose and executable demonstrations remain authored only where they add value that cannot be derived safely.

## Executable preview contract

The primary reader experience presents guidance, generated API facts, and interactive UI behavior in one Docs application. VyrnForge does not maintain a separate semantic Playground product.

Foundations, patterns, advanced-module demonstrations, and framework examples use curated Docs routes backed by canonical metadata and verified consumer fixtures. Interactive examples may use authored presentation code, but they must not become a second API registry or overstate framework runtime evidence.

Claims that a framework runtime executed must come from executable-example or packed-consumer evidence.

## Docs application boundary

`apps/docs` may own:

- generic page and layout renderers;
- framework/version context UI;
- navigation and search presentation derived from generated registries;
- generic code and example presentation;
- host adapters required to render verified examples;
- documentation-specific layout and content styling.

It must not own package/component semantic truth, framework-support truth, accessibility claims, token contracts, release state, maturity, public APIs, or duplicated component-specific registries.

The Docs application should dogfood VyrnForge components for reusable UI primitives where practical. If Docs reveals a reusable UI need, evaluate the existing VyrnForge foundation before adding an application-only replacement.

## Dedicated Reference pages

A capability may have a dedicated catalog or tool when the generic record presentation cannot provide the required browsing experience. This is a presentation override, not a second semantic owner.

The canonical component, package, token, contract, framework, accessibility, and API records remain intact and continue feeding generators, search, AI context, and verification. Dedicated pages use the shared Reference shell, framework/version context, route model, and design system.

## Example standards

Public examples should remain focused, accurate, reusable, and attributable to canonical capability identities. Where applicable they should include package/CSS imports, a focused use case, minimal code, accessibility requirements, relevant theming notes, controlled/uncontrolled behavior, and important limitations.

Large fixture datasets, business-specific authentication, application routing, persistence, and unrelated product logic stay outside reusable examples.

The same conceptual capability across frameworks uses one shared example identity with framework-specific implementations rather than four unrelated catalog entries.

## Change verification

When changing Reference content, generation, or presentation:

1. identify and update the canonical owner;
2. regenerate structured projections when required;
3. preserve framework/version context and stable route identities;
4. preserve executable-example identities and cross-framework evidence;
5. keep curated prose and executable demos only where they add value beyond generated facts;
6. run `npm run verify:reference` and `npm run verify:docs-quality`;
7. run `npm run build:docs` for the complete Docs dependency/build path;
8. run additional browser/accessibility/consumer gates when behavior changed.

## Related sources

- [Documentation index](../README.md)
- [Documentation governance](../governance/documentation.md)
- [Documentation authoring](documentation-authoring.md)
- [Package/component documentation ownership](documentation-ownership.md)
- [Metadata ownership](../metadata/README.md)
- [`reference-portal.json`](../metadata/reference-portal.json)
- [Project source of truth](../governance/01-project-source-of-truth.md)
- [CI/CD architecture](ci-cd-architecture.md)
- [`AGENTS.md`](../../AGENTS.md)

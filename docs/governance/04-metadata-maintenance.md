# Metadata Maintenance

## Purpose

VyrnForge metadata makes package, component, styling, state, framework, release, documentation, and verification facts machine-readable for repository tooling, generated documentation, framework generation, and AI consumers.

Markdown owns durable human-readable architecture and policy decisions. Structured metadata owns queryable canonical facts. Generated outputs project those sources and must not become independent hand-maintained authorities.

## Primary metadata

<!-- prettier-ignore -->
| File | Update when |
| --- | --- |
| `docs/metadata/packages.json` | Package ownership, dependencies, CSS imports, or public entrypoints change. |
| `docs/metadata/components.json` | A component is added, renamed, deprecated, removed, changes public status/maturity, or materially changes catalog metadata. |
| `docs/metadata/multi-framework.json` | Framework support topology, implementation mapping/status, or framework evidence policy changes. |
| `docs/metadata/component-contracts.json` | Canonical properties, events, composition regions, methods, models, or form association change. |
| `docs/metadata/framework-exceptions.json` | A narrow framework-specific exception is introduced, changed, closed, or removed. |
| `docs/metadata/css-imports.json` | CSS entrypoints, import order, prefixes, or token ownership change. |
| `docs/metadata/design-tokens.json` | Semantic tokens, theme roles, density, motion, layering, or compatibility bridges change. |
| `docs/metadata/state-contracts.json` | Shared state ownership, store policy, persistence, server-query, or export-request contracts change. |
| `docs/metadata/release-groups.json` | Release-line membership, versions, dist-tags, framework documentation readiness, or exact internal dependency alignment change. |
| `docs/metadata/documentation-pages.json` | Public document identity, renderer/source binding, section placement, release line, or documentation-layer composition changes. |
| `docs/metadata/reference-portal.json` | VyrnForge Reference product identity, content-domain taxonomy, framework/version context, routing, or deployment semantics change. |
| `docs/metadata/validation-layers.json` | Validation ownership, public commands, or repository validation-layer semantics change. |
| `docs/metadata/ai-usage-rules.json` | Agent dependency constraints or structured usage rules change. |

The exact metadata inventory is owned by `docs/metadata/README.md` and repository discovery; this document should not become a second exhaustive file catalog.

## Generated projections

Generated Reference, framework, search, navigation, and AI-consumer outputs derive from canonical metadata and implementation-owned sources. Do not restore retired hand-maintained AI mirrors such as `.ai/COMPONENT_MAP.json`.

When a generated projection is stale:

1. identify its canonical input or generator;
2. change that owner;
3. run the repository generation path;
4. verify committed output is reproducible;
5. never patch generated semantic facts directly merely to make verification pass.

Generated-source policy is owned by [Generated Source Ownership](generated-source-ownership.md).

## Rules

- Keep metadata explicit, schema-validated where applicable, stable, and easy to diff.
- Do not encode roadmap, active sprint status, or architecture rationale as structured facts unless a canonical schema explicitly owns that concern.
- Do not list unavailable planned components as available imports or claim framework support without required evidence.
- Keep public maturity and limitations in canonical component/release metadata instead of duplicating them across roadmaps, package docs, and Reference presentation code.
- Keep framework-neutral semantics in canonical shared contracts; framework mappings and exceptions project or narrow those semantics rather than redefine them independently.
- Generated component/API/reference views must derive from canonical sources and fail verification on drift.
- If metadata conflicts with a durable architecture/policy decision, resolve the canonical owner first and then align metadata and projections.

## Review checklist

Before merging metadata changes:

1. identify the canonical owner for every changed fact;
2. confirm schemas/JSON parse and metadata validation passes;
3. confirm package exports/manifests and component/package records agree;
4. confirm CSS import/token ownership agrees with runtime package contracts;
5. confirm state rules agree with `docs/architecture/02-state-and-adapter-ownership.md`;
6. confirm framework claims agree with current contracts, mappings, exceptions, and consumer/browser evidence;
7. confirm release-line and documentation-readiness facts remain consistent;
8. confirm AI usage rules do not permit forbidden dependencies or create a second semantic owner;
9. regenerate affected projections and verify drift checks;
10. run the Docs/Reference build when documentation consumption changes;
11. run additional package, packed-consumer, browser, accessibility, compatibility, or release verification required by the affected metadata domain.

## AI usage

AI agents consume canonical metadata and generated AI context for structured lookup. Product architecture and human policy decisions remain in canonical Markdown. Agent-facing files should point to those sources rather than maintaining another component/package catalog.

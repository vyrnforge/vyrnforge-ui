# Metadata Maintenance

## Purpose

VyrnForge metadata makes package, component, styling, state, release, and
verification information machine-readable for repository tooling, generated
documentation, and AI agents.

Markdown remains the source of truth for human-readable architecture and
project decisions. `docs/metadata/components.json` is the canonical structured
component catalog for public status, maturity, ownership, exports, routes,
evidence, and per-component limitations.

## Primary metadata

| File                                     | Update when                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `docs/metadata/packages.json`            | Package ownership, dependencies, CSS imports, or public entrypoints change.                                                     |
| `docs/metadata/components.json`          | A component is added, renamed, deprecated, removed, changes public status/maturity, or materially changes its catalog metadata. |
| `docs/metadata/multi-framework.json`     | Framework support, renderer status, release topology, or fixture policy changes.                                                |
| `docs/metadata/component-contracts.json` | Canonical properties, events, composition regions, methods, or form association change.                                         |
| `docs/metadata/css-imports.json`         | CSS entrypoints, import order, prefixes, or token ownership change.                                                             |
| `docs/metadata/design-tokens.json`       | Semantic tokens, theme roles, density, motion, layering, or compatibility bridges change.                                       |
| `docs/metadata/state-contracts.json`     | State ownership, store policy, persistence, server-query, or export-request contracts change.                                   |
| `docs/metadata/release-groups.json`      | Release-group membership, versions, dist-tags, or exact internal dependency alignment change.                                   |
| `docs/metadata/validation-layers.json`   | Validation ownership, public commands, or repository validation layers change.                                                  |
| `docs/metadata/ai-usage-rules.json`      | Agent dependency constraints or usage rules change.                                                                             |

`.ai/COMPONENT_MAP.json` is a compact lookup and must stay aligned with
`docs/metadata/components.json`.

## Rules

- Keep metadata explicit, stable, and easy to diff.
- Do not generate roadmap or architecture decisions inside metadata.
- Do not list unavailable planned components as available imports.
- Keep public maturity and limitations in the canonical component catalog
  instead of duplicating them across roadmap and package docs.
- Generated component/API views must derive from canonical metadata.
- If metadata conflicts with human-readable architecture, update the canonical
  Markdown decision first and then align metadata.

## Review checklist

Before merging metadata changes:

1. Confirm `docs/README.md` still points to the correct canonical area.
2. Confirm JSON parses and generated references remain reproducible.
3. Confirm package exports and component catalog records agree.
4. Confirm CSS import order agrees with package manifests and API docs.
5. Confirm state rules agree with
   `docs/architecture/02-state-and-adapter-ownership.md`.
6. Confirm framework support agrees with current verified consumer evidence.
7. Confirm AI rules do not permit forbidden dependencies.
8. Build the documentation application when documentation/metadata consumption
   changes.
9. Run the repository's targeted metadata verifiers for the area changed.

## AI usage

AI agents use metadata for structured lookup and current status. Architecture
and usage decisions still come from the canonical Markdown documents linked
from `docs/README.md`.

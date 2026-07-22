# Metadata Maintenance

## Purpose

VyrnForge metadata files make package, component, styling, state, and AI guidance machine-readable for the docs app and Codex agents.

Markdown docs remain the source of truth for project direction. Metadata files are structured indexes and must not introduce competing roadmap or architecture decisions.

## Metadata Files

| File                                 | Update when                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/metadata/packages.json`        | Package ownership, dependencies, CSS imports, or public entry points change.                                                                                           |
| `docs/metadata/components.json`      | A component/contract is added, renamed, deprecated, removed, materially changes usage guidance, or changes maturity, ownership, routes, exports, or maturity evidence. |
| `docs/metadata/css-imports.json`     | CSS import paths, import order, class prefixes, or token ownership changes.                                                                                            |
| `docs/metadata/design-tokens.json`   | Semantic token categories, theme roles, density aliases, motion rules, layering, compatibility bridges, or token ownership changes.                                    |
| `docs/metadata/state-contracts.json` | State ownership, Redux policy, persistence, server query, or export request contracts change.                                                                          |
| `docs/metadata/ai-usage-rules.json`  | Agent rules, dependency constraints, or recommended usage patterns change.                                                                                             |
| `.ai/COMPONENT_MAP.json`             | Component/package quick lookup changes; keep it compact and aligned to `docs/metadata/components.json`.                                                                |

## Rules

- Keep JSON stable, explicit, and easy to diff.
- Do not generate new roadmap direction inside metadata.
- Do not list planned components as available imports.
- Mark unavailable future components as `planned`.
- Mark unstable public components as `experimental`.
- Keep internal APIs as `internal` records in the canonical component catalog;
  they must not be package-root exports.
- Keep `.ai/COMPONENT_MAP.json` compact; put full details in `docs/metadata/components.json`.
- If metadata conflicts with markdown docs, update markdown first, then metadata.

## Review Checklist

Before merging metadata changes:

1. Confirm `docs/README.md` links the metadata area.
2. Confirm each JSON file parses.
3. Confirm canonical component maturity and public-export status match package exports and roadmap docs.
4. Confirm CSS import order still matches package docs.
5. Confirm the semantic-token catalog matches `@vyrnforge/ui-core`, including theme, density, motion, compatibility, and layer contracts.
6. Confirm state rules still match `docs/architecture/02-state-and-adapter-ownership.md`.
7. Confirm AI rules do not permit forbidden dependencies.
8. Confirm the docs app still builds.
9. Run `npm run verify:design-tokens` and `npm run test:design-tokens` when the token contract or metadata changes.
10. Run `npm run verify:component-metadata` and `npm run verify:component-maturity` when component metadata or evidence changes.

## AI Notes

AI agents should read metadata only as an index. For decisions, read the canonical markdown docs linked from `docs/README.md`.

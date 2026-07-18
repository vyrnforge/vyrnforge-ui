# Metadata Maintenance

## Purpose

VyrnForge metadata files make package, component, styling, state, and AI guidance machine-readable for the docs app and Codex agents.

Markdown docs remain the source of truth for project direction. Metadata files are structured indexes and must not introduce competing roadmap or architecture decisions.

## Metadata Files

| File | Update when |
| --- | --- |
| `docs/metadata/packages.json` | Package ownership, dependencies, CSS imports, or public entry points change. |
| `docs/metadata/components.json` | A public component/contract is added, renamed, deprecated, removed, or materially changes usage guidance. |
| `docs/metadata/component-status.json` | Component maturity changes between stable, experimental, planned, deprecated, or internal. |
| `docs/metadata/css-imports.json` | CSS import paths, import order, class prefixes, or token ownership changes. |
| `docs/metadata/state-contracts.json` | State ownership, Redux policy, persistence, server query, or export request contracts change. |
| `docs/metadata/ai-usage-rules.json` | Agent rules, dependency constraints, or recommended usage patterns change. |
| `.ai/COMPONENT_MAP.json` | Component/package quick lookup changes; keep it compact and aligned to `docs/metadata/components.json`. |

## Rules

- Keep JSON stable, explicit, and easy to diff.
- Do not generate new roadmap direction inside metadata.
- Do not list planned components as available imports.
- Mark unavailable future components as `planned`.
- Mark unstable public components as `experimental`.
- Keep internal APIs in the separate `internal` registry; do not list them as
  public component entries.
- Keep `.ai/COMPONENT_MAP.json` compact; put full details in `docs/metadata/components.json`.
- If metadata conflicts with markdown docs, update markdown first, then metadata.

## Review Checklist

Before merging metadata changes:

1. Confirm `docs/README.md` links the metadata area.
2. Confirm each JSON file parses.
3. Confirm component status matches package exports and roadmap docs.
4. Confirm CSS import order still matches package docs.
5. Confirm state rules still match `docs/architecture/02-state-and-adapter-ownership.md`.
6. Confirm AI rules do not permit forbidden dependencies.
7. Confirm the docs app still builds.
8. Run `npm run verify:metadata`.

## AI Notes

AI agents should read metadata only as an index. For decisions, read the canonical markdown docs linked from `docs/README.md`.

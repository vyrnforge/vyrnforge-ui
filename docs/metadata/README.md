# VyrnForge UI Metadata

These files are structured indexes for the docs app and AI/Codex agents.

Markdown docs remain the human source of truth for project direction. Metadata complements those docs by making packages, components, CSS imports, state contracts, and AI usage rules easy to query without scanning the source tree.

## Files

| File | Purpose |
| --- | --- |
| `packages.json` | Package ownership, dependencies, CSS imports, and public entry points. |
| `components.json` | Full component and public contract catalog. |
| `component-status.json` | Compact component status lookup grouped by package. |
| `css-imports.json` | Required CSS import order and styling ownership. |
| `state-contracts.json` | State ownership levels and adapter policies. |
| `ai-usage-rules.json` | AI-specific usage rules and constraints. |

## Maintenance

Update metadata when public components, package entry points, CSS imports, state contracts, or AI rules change.

Component maturity uses `stable`, `experimental`, `planned`, `deprecated`, and
`internal`. Public entries belong in the package sections of
`component-status.json`; internal items belong only in its separate
`internal` registry. Run `npm run verify:metadata` after metadata changes.

Canonical maintenance rules live in `docs/governance/04-metadata-maintenance.md`.

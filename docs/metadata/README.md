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

Component maturity uses `planned`, `experimental`, `alpha-stable`,
`beta-stable`, `stable`, `deprecated`, and `internal`. Public entries belong
in the package sections of `component-status.json`; internal items belong only
in its separate `internal` registry. The evidence model lives in the top-level
`maturityEvidence` property of `components.json`; run both
`npm run verify:metadata` and `npm run verify:component-maturity` after a
maturity or evidence change.

## Maturity evidence

Each entry in `maturityEvidence.entries` is keyed as
`<package>:<component name>`. It declares a `maturityState`, one of the
component categories (`non-interactive`, `form-control`,
`composite-navigation`, `overlay`, `feedback-status`, `data-grid-feature`, or
`internal-only`), and evidence records. An evidence record uses `complete`,
`pending`, or `not-applicable`: complete records include a repository-visible
reference, while pending and not-applicable records include a rationale.

The verifier requires named ownership; API/export, logic, accessibility,
theme/density, documentation, example, compatibility, and lifecycle evidence
as the maturity state requires. DOM and keyboard evidence is conditional on
the category, and browser evidence is required for overlays, composite
navigation, data-grid features, and explicitly complex controls. Alpha/Beta
browser evidence may be explicitly pending while browser infrastructure is
not available; Stable cannot use pending evidence.

The initial transition policy is `new-promotions-only`. The explicitly listed
legacy entries keep their current maturity labels but are reported as
unverified rather than being populated with invented proof. A later promotion,
or any new higher-maturity entry, must add a complete evidence record.

Canonical maintenance rules live in `docs/governance/04-metadata-maintenance.md`.

# VyrnForge UI Metadata

These files are structured indexes for the docs app and AI/Codex agents.

Markdown docs remain the human source of truth for project direction. Metadata complements those docs by making packages, components, CSS imports, state contracts, and AI usage rules easy to query without scanning the source tree.

## Files

| File | Purpose |
| --- | --- |
| `packages.json` | Package ownership, dependencies, CSS imports, and public entry points. |
| `components.json` | Canonical normalized component and public contract catalog. |
| `component-schema.md` | Field definitions and contributor workflow for canonical component metadata. |
| `css-imports.json` | Required CSS import order and styling ownership. |
| `state-contracts.json` | State ownership levels and adapter policies. |
| `ai-usage-rules.json` | AI-specific usage rules and constraints. |

## Maintenance

Update metadata when public components, package entry points, CSS imports, state contracts, or AI rules change.

`components.json` is the only structured owner of component maturity, package
ownership, docs and playground routes, public-export status, and evidence.
It uses `planned`, `experimental`, `alpha-stable`, `beta-stable`, `stable`,
`deprecated`, and `internal`; internal records must never be public exports.
Run `npm run verify:component-metadata` and
`npm run verify:component-maturity` after a component metadata change.

## Maturity evidence

Each entry in `maturityEvidence.entries` is keyed by the stable component `id`.
It declares a `maturityState`, one of the categories declared in the catalog
schema, and the VF-1009 evidence records. An evidence record uses `complete`,
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
legacy entries retain their historical metadata value but are presented in
public documentation as **Legacy stable — verification required**, not as a
verified success state. They must be fully reviewed through `VF-2015` by Gate
`G2` and the exception list must be empty before `1.0.0-beta.1`. A later
promotion, or any new higher-maturity entry, must add a complete evidence
record; invented proof is prohibited.

Canonical maintenance rules live in `docs/governance/04-metadata-maintenance.md`.

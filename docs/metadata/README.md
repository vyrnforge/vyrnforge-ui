# VyrnForge UI Metadata

These files are structured indexes for the docs app, contributors, and AI
agents. Markdown remains the human-readable policy source; metadata provides
queryable repository facts and evidence records.

## Files

| File                                | Purpose                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages.json`                     | Package ownership, dependencies, CSS imports, and public entry points.                             |
| `components.json`                   | Canonical normalized component and public-contract catalog, including maturity evidence.           |
| `component-schema.md`               | Field definitions and contributor workflow for canonical component metadata.                       |
| `assistive-technology-reviews.json` | Canonical manual screen-reader environment, scenario, and result status.                           |
| `design-tokens.json`                | Canonical semantic token categories, themes, densities, motion, layers, and compatibility bridges. |
| `css-imports.json`                  | Required CSS import order and styling ownership.                                                   |
| `state-contracts.json`              | State ownership levels and adapter policies.                                                       |
| `ai-usage-rules.json`               | AI-specific usage rules and constraints.                                                           |

## Component metadata maintenance

`components.json` is the only structured owner of component maturity, package
ownership, documentation and playground routes, public-export status, and
component evidence. It supports `planned`, `experimental`, `alpha-stable`,
`beta-stable`, `stable`, `deprecated`, and `internal`.

VF-2015 closed the temporary legacy-stable exception. The transition policy's
`legacyUnverifiedEntries` list must remain empty. Its `closedEntries` audit list
records the 47 unsupported historical Stable claims that were honestly
reclassified as Experimental without changing their public exports. Future
promotion requires the complete evidence defined by the canonical maturity
model.

Run these commands after component metadata changes:

```bash
npm run verify:component-metadata
npm run verify:component-maturity
npm run verify:maturity-closure
```

## Manual assistive-technology evidence

`assistive-technology-reviews.json` records required environments, deterministic
fixture scenarios, manual contracts, execution status, and immutable result
references. Pending records are allowed during current alpha development but
do not represent a manual pass. Beta or stable promotion requires the strict
gate and passing results for every declared scenario and environment.

```bash
npm run verify:assistive-technology
npm run verify:assistive-technology:release
```

Canonical maintenance rules live in
`docs/governance/04-metadata-maintenance.md`; accessibility execution rules live
in `docs/architecture/05-accessibility-standards.md`.

## Design token metadata

`design-tokens.json` is the structured S3 contract for shared semantic roles.
It is aligned with `packages/ui-core/src/theme/tokenContract.ts` and the
`ui-core` CSS foundation.

```bash
npm run test:design-tokens
npm run verify:design-tokens
```

The verifier rejects missing categories, duplicate names, incomplete theme
presets, broken compatibility bridges, missing density aliases, invalid layer
order, and incomplete reduced-motion behavior.

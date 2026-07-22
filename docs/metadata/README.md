# VyrnForge UI Metadata

These files are structured indexes for the docs app, contributors, and AI
agents. Markdown remains the human-readable policy source; metadata provides
queryable repository facts and evidence records.

## Files

| File                                | Purpose                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `packages.json`                     | Package ownership, dependencies, CSS imports, and public entry points.                                 |
| `multi-framework.json`              | Canonical renderer support levels, beta release groups, planned packages, and consumer fixture policy. |
| `component-contracts.json`          | Canonical cross-framework events, slots, form association, and representative component contracts.     |
| `component-contract.schema.json`    | JSON Schema for the canonical multi-framework component contract catalog.                              |
| `components.json`                   | Canonical normalized component and public-contract catalog, including maturity evidence.               |
| `component-schema.md`               | Field definitions and contributor workflow for canonical component metadata.                           |
| `assistive-technology-reviews.json` | Canonical manual screen-reader environment, scenario, and result status.                               |
| `design-tokens.json`                | Canonical semantic token categories, themes, densities, motion, layers, and compatibility bridges.     |
| `visual-regression-matrix.json`     | Canonical VF-3011 browser visual-evidence suites, dimensions, selectors, and token assertions.         |
| `g3-closure.json`                   | Machine-readable VF-3012 G3 task, evidence, check, blocker, and closure record.                        |
| `css-imports.json`                  | Required CSS import order and styling ownership.                                                       |
| `state-contracts.json`              | State ownership levels and adapter policies.                                                           |
| `ai-usage-rules.json`               | AI-specific usage rules and constraints.                                                               |

## Multi-framework architecture metadata

`multi-framework.json` records the approved React/native-first web strategy,
planned package topology, Angular/Vue verification status, Light DOM policy,
and deferred data-grid release track. `component-contracts.json` owns the
canonical `vf-*` event vocabulary, semantic slot regions, form-association
contract, and representative renderer-neutral component records.

Architecture fixtures remain `architecture-fixture-only` until runtime consumer
evidence passes GMF4.

```bash
npm run test:multi-framework
npm run verify:multi-framework
```

The human-readable sources are:

- `docs/architecture/adr-004-multi-framework-web-support.md`;
- `docs/architecture/09-component-contracts-and-events.md`;
- `docs/architecture/10-custom-elements-and-form-association.md`;
- `docs/testing/multi-framework-consumer-fixtures.md`.

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

## Visual regression and G3 closure metadata

`visual-regression-matrix.json` owns the deterministic VF-3011 case matrix. It
combines a blocking computed-style-to-token comparison with successful-run PNG
and observation artifacts. `g3-closure.json` records the complete VF-3001
through VF-3012 evidence chain without treating a local metadata edit as a
substitute for the required GitHub `ci-gate`.

```bash
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
npm run test:g3-closure
npm run verify:g3-closure
```

Maintenance guidance lives in `docs/quality/s3-visual-regression.md`; the final
evidence decision is documented in `docs/quality/s3-g3-closure.md`.

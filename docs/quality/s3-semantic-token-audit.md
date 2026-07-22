# S3 Semantic Token Audit

## Scope

VF-3001 reviewed shared CSS decisions before broad component and grid
migration. The audit covered `@vyrnforge/ui-core`,
`@vyrnforge/ui-components`, `@vyrnforge/ui-data-grid`, the docs application,
the playground, and regression fixtures.

The audit is an implementation inventory, not a claim that VF-3009 through
VF-3011 are already complete.

## Baseline findings

| Area                     | Finding                                                                                                                                                                    | Classification                                           | Follow-up                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Core token foundation    | Existing tokens mixed primitive values, broad aliases, density, motion, and layers in one small contract.                                                                  | Shared token gap                                         | VF-3002–VF-3008 implemented the semantic contract.                            |
| Components               | 54 CSS files contained 8 hexadecimal colors, 1 RGB color, 6 literal transitions, 8 local outline decisions, and 6 literal z-index declarations.                            | Shared semantic debt                                     | VF-3009 migrates shared component decisions.                                  |
| Data grid                | 22 CSS files contained repeated fallback color values across token and theme files, 4 literal transitions, 6 local outline decisions, and 15 literal z-index declarations. | Shared/grid boundary debt                                | VF-3010 aligns grid tokens and keeps only grid-specific `--udg-*`.            |
| Docs and playground      | App-owned CSS contains scoped product presentation and fallback values.                                                                                                    | Application-local unless it duplicates package semantics | Review during VF-3011 visual evidence and S6 docs work.                       |
| Component-local `--vf-*` | Several component variables describe runtime overlay coordinates, shell dimensions, slider progress, and similar geometry.                                                 | Valid component-local geometry                           | Retain unless a role becomes reusable.                                        |
| Status roles             | Existing success/warning/danger/info tokens lacked a complete text/background/border/indicator matrix and had no pending/neutral role.                                     | Shared token gap                                         | VF-3004 implemented six complete roles.                                       |
| Density                  | Existing compact/standard/comfortable names did not expose icon sizing, vertical padding, hit-target policy, or canonical business terminology.                            | Shared token gap                                         | VF-3005 added compact/balanced/spacious with compatibility aliases.           |
| Typography               | Components and docs primarily combined primitive font values directly.                                                                                                     | Shared semantic gap                                      | VF-3006 added eight named roles; adoption remains VF-3009 and docs follow-up. |
| Motion                   | One `--vf-transition-fast` alias could not express entrance, exit, opacity, transform, or reduced motion.                                                                  | Shared token gap                                         | VF-3007 added the motion contract and browser evidence.                       |
| Layering                 | Historical `--vf-z-*` values existed but lacked a raised, scrim, and debug role and had no machine-verifiable ordering.                                                    | Shared token gap                                         | VF-3008 added deterministic canonical layers and compatibility aliases.       |

## Decision rules

Every styling decision is now categorized as one of:

1. **Shared token:** reusable semantic role owned by `ui-core`.
2. **Component-local:** private composition or runtime geometry owned by
   `ui-components`.
3. **Grid-local:** grid-only behavior owned by `ui-data-grid`, using `--udg-*`.
4. **Application-local:** docs, playground, fixture, or product presentation
   that must not become a package default.

Hard-coded shared colors, focus values, status roles, typography roles, motion,
or layer values outside `ui-core` are migration debt unless an explicit
exception documents why the decision is local.

## Implemented foundation

VF-3002 through VF-3008 add:

- 147 canonical semantic tokens in nine categories
- complete light, dark, and enterprise TypeScript presets
- system dark behavior
- canonical compact, balanced, and spacious density roles
- standard and comfortable compatibility aliases
- named typography utilities
- explicit and automatic reduced-motion behavior
- unique deterministic layer levels
- machine-readable metadata and verification
- browser computed-style contracts for themes, density, motion, and layers

## Deferred migration inventory

The following are intentionally not changed in this foundation batch:

- component CSS adoption — VF-3009
- data-grid semantic alignment — VF-3010
- screenshot visual regression across themes and densities — VF-3011
- final G3 migration report and gate evidence — VF-3012

This prevents a partial token foundation from being mixed with broad styling
changes in the same review.

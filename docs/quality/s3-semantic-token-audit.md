# S3 Semantic Token Audit

## Scope

VF-3001 reviewed shared CSS decisions before broad component and grid
migration. The audit covered `@vyrnforge/ui-core`,
`@vyrnforge/ui-components`, `@vyrnforge/ui-data-grid`, the docs application,
the playground, and regression fixtures.

The audit began as an implementation inventory. VF-3009 through VF-3012 are
now complete, and this document records the closed S3 result.

## Baseline findings

| Area                     | Finding                                                                                                                                                                    | Classification                                           | Follow-up                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Core token foundation    | Existing tokens mixed primitive values, broad aliases, density, motion, and layers in one small contract.                                                                  | Shared token gap                                         | VF-3002–VF-3008 implemented the semantic contract.                                     |
| Components               | 54 CSS files contained 8 hexadecimal colors, 1 RGB color, 6 literal transitions, 8 local outline decisions, and 6 literal z-index declarations.                            | Shared semantic debt                                     | VF-3009 completed shared component semantic adoption.                                  |
| Data grid                | 22 CSS files contained repeated fallback color values across token and theme files, 4 literal transitions, 6 local outline decisions, and 15 literal z-index declarations. | Shared/grid boundary debt                                | VF-3010 completed grid-to-core semantic alignment.                                     |
| Docs and playground      | App-owned CSS contains scoped product presentation and fallback values.                                                                                                    | Application-local unless it duplicates package semantics | VF-3011 reviewed representative package surfaces; broader docs polish remains S6 work. |
| Component-local `--vf-*` | Several component variables describe runtime overlay coordinates, shell dimensions, slider progress, and similar geometry.                                                 | Valid component-local geometry                           | Retain unless a role becomes reusable.                                                 |
| Status roles             | Existing success/warning/danger/info tokens lacked a complete text/background/border/indicator matrix and had no pending/neutral role.                                     | Shared token gap                                         | VF-3004 implemented six complete roles.                                                |
| Density                  | Existing compact/standard/comfortable names did not expose icon sizing, vertical padding, hit-target policy, or canonical business terminology.                            | Shared token gap                                         | VF-3005 added compact/balanced/spacious with compatibility aliases.                    |
| Typography               | Components and docs primarily combined primitive font values directly.                                                                                                     | Shared semantic gap                                      | VF-3006 added eight named roles; VF-3009 adopted them in shared components.            |
| Motion                   | One `--vf-transition-fast` alias could not express entrance, exit, opacity, transform, or reduced motion.                                                                  | Shared token gap                                         | VF-3007 added the motion contract and browser evidence.                                |
| Layering                 | Historical `--vf-z-*` values existed but lacked a raised, scrim, and debug role and had no machine-verifiable ordering.                                                    | Shared token gap                                         | VF-3008 added deterministic canonical layers and compatibility aliases.                |

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

## Completed migration inventory

The staged S3 sequence is now complete:

- component CSS adoption — VF-3009
- data-grid semantic alignment — VF-3010
- visual regression across themes and densities — VF-3011
- final G3 migration report and gate evidence — VF-3012

The staged reviews prevented a partial token foundation from being mixed with
broad styling changes while still closing one coherent gate.

## Post-adoption result

VF-3009 and VF-3010 closed the package-level debt identified above.

| Area              | Result                                                                                                                                                            | Remaining exception                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Shared components | All package CSS uses canonical semantic roles for shared visual decisions. Hard-coded package colors and literal motion timings are rejected by verification.     | Component-local geometry and one local stacking context remain private implementation details.           |
| Data grid         | Grid-facing roles map to ui-core semantic tokens; repeated light/dark/enterprise/system color maps were removed. Typed presets derive from ui-core theme presets. | The package-owned high-contrast grid theme remains explicit until ui-core publishes a shared equivalent. |
| Density           | Grid CSS accepts compact/balanced/spacious plus standard/comfortable compatibility aliases.                                                                       | The public TypeScript grid density union remains unchanged during alpha.                                 |
| Evidence          | Static adoption verification and browser evidence cover components and grid across light/dark themes.                                                             | VF-3011 adds fourteen computed-style baseline cases plus per-case screenshot artifacts.                  |

The authoritative detailed record is `s3-token-adoption-report.md`.

## G3 closure

VF-3011 and VF-3012 close the remaining evidence gap. See
`s3-visual-regression.md`, `s3-g3-closure.md`, and
`../metadata/g3-closure.json`. G3 is marked passed only after the final pull
request `ci-gate` succeeds.

# VyrnForge UI Master Roadmap

## Current direction

S0 through S3 established controlled change, quality evidence, interaction
hardening, and semantic token consistency. The next release program prioritizes
a multi-framework **non-grid beta** instead of further data-grid expansion.

The data-grid package remains available as a React alpha but does not block the
beta release group.

## Release groups

### Non-grid beta

```text
@vyrnforge/ui-core
@vyrnforge/ui-behaviors
@vyrnforge/ui-components
@vyrnforge/ui-elements
```

### Deferred independent alpha

```text
@vyrnforge/ui-data-grid
```

## Sprint plan

| Sprint | Name                                      | Goal                                                                                                                      | Gate        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| S0     | Baseline and Change Control               | Lock inventory, toolchain, governance, and ownership.                                                                     | G0 — passed |
| S1     | Quality Foundation                        | Enforce lint, tests, metadata, packages, consumers, and stable CI aggregation.                                            | G1 — passed |
| S2     | Interaction and Accessibility Evidence    | Prove critical keyboard, focus, overlay, form, navigation, feedback, and grid behavior.                                   | G2 — passed |
| S3     | Semantic Tokens and Component Consistency | Establish semantic tokens and align shared components and grid styling.                                                   | G3 — passed |
| S4     | Multi-Framework Architecture              | Approve support scope, package topology, component contracts, events, composition, styling, forms, and fixture ownership. | GMF1        |
| S5     | Framework-Neutral Behaviors               | Extract reusable non-grid controllers while preserving React API and behavior.                                            | GMF2        |
| S6     | Native Custom Elements                    | Implement native non-grid elements with form, browser, accessibility, theme, and density parity.                          | GMF3        |
| S7     | Cross-Framework Verification and Docs     | Verify React, plain HTML, Angular, and Vue consumers and publish generated framework documentation.                       | GMF4        |
| S8     | Non-Grid Beta Release                     | Harden packages, canary in applications, publish beta artifacts, and complete exit review.                                | GBETA       |

## S4 architecture tasks

- MF-4001: multi-framework web support ADR
- MF-4002: package topology and dependency rules
- MF-4003: canonical component-contract schema
- MF-4004: canonical event vocabulary
- MF-4005: composition and slot vocabulary
- MF-4006: Light DOM and styling policy
- MF-4007: form-associated element contract
- MF-4008: React, native HTML, Angular, and Vue fixture foundation

S4 does not port components or create a framework support claim.

## Deferred data-grid track

The previously planned grid decomposition and scale work moves to a separate
post-beta track. Replanning begins only after GBETA unless a production defect
requires a targeted fix.

Deferred work includes:

- internal grid-controller decomposition;
- query and persistence refactoring;
- column, selection, grouping, keyboard, and visual-region decomposition;
- scale benchmarks and virtualization decisions;
- framework-neutral grid core and additional renderers.

Grid defects, security corrections, and compatibility maintenance remain
allowed. Feature expansion is not on the non-grid beta critical path.

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

- MF-4009: create the `@vyrnforge/ui-behaviors` package foundation
- MF-4010: create the `@vyrnforge/ui-elements` package foundation
- MF-4011: add complete framework-parity catalog metadata
- MF-4012: complete GMF1 architecture gate evidence

S4 establishes real package foundations but does not port public components or create a framework support claim.

## S5 behavior tasks

### Foundation batch — implemented

- MF-5001: controllable state primitives
- MF-5002: collection and active-item primitives
- MF-5003: single, multiple, toggle, and range selection models
- MF-5004: canonical controller event model

The foundation batch is framework- and DOM-neutral. It does not migrate React
components or complete GMF2.

### Remaining GMF2 work

- MF-5005: simple action and toggle behaviors — implemented
- MF-5006: simple form-control behaviors — implemented
- MF-5007: Tabs and composite navigation behavior — implemented
- MF-5008: Autocomplete behavior
- MF-5009: MultiSelect behavior
- MF-5010: Transfer List behavior
- MF-5011: Menu and SideNav navigation behavior
- MF-5012: overlay lifecycle and DOM-adapter boundary
- MF-5013: Dialog, Drawer, Popover, and Tooltip controllers
- MF-5014: Toast and ConfirmDialog behavior
- MF-5015: React component adoption
- MF-5016: shared behavior parity gate

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
